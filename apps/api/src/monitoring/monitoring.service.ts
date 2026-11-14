import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMetricDto } from './dto/create-metric.dto';
import { QueryMetricsDto } from './dto/query-metrics.dto';

const SAMPLE_INTERVAL_S = 15;

@Injectable()
export class MonitoringService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertServer(id: string) {
    const server = await this.prisma.server.findUnique({ where: { id } });
    if (!server) throw new NotFoundException(`Server ${id} not found`);
    return server;
  }

  async create(dto: CreateMetricDto) {
    await this.assertServer(dto.serverId);
    return this.prisma.metric.create({
      data: {
        serverId: dto.serverId,
        cpuUsage: dto.cpuUsage,
        ramUsage: dto.ramUsage,
        timestamp: dto.timestamp ?? new Date(),
      },
    });
  }

  async findByServer(serverId: string, q: QueryMetricsDto) {
    await this.assertServer(serverId);
    const where = {
      serverId,
      timestamp: { ...(q.from && { gte: q.from }), ...(q.to && { lte: q.to }) },
    };
    const limit = q.limit ?? 100;
    const rows = await this.prisma.metric.findMany({
      where, orderBy: { timestamp: 'desc' }, take: limit,
    });
    return rows.reverse(); // ordre chronologique, pratique pour les graphiques
  }

  // Disponibilité = métriques reçues / métriques attendues sur la fenêtre
  async availability(serverId: string, hours = 24) {
    const server = await this.assertServer(serverId);
    const since = new Date(Date.now() - hours * 3600_000);
    const count = await this.prisma.metric.count({
      where: { serverId, timestamp: { gte: since } },
    });
    const expected = (hours * 3600) / SAMPLE_INTERVAL_S;
    const last = await this.prisma.metric.findFirst({
      where: { serverId }, orderBy: { timestamp: 'desc' }, select: { timestamp: true },
    });
    return {
      serverId,
      status: server.status,
      windowHours: hours,
      availabilityPercent: Math.min(100, Math.round((count / expected) * 1000) / 10),
      lastMetricAt: last?.timestamp ?? null,
    };
  }
}