import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlertRuleDto } from './dto/create-alert-rule.dto';
import { UpdateAlertRuleDto } from './dto/update-alert-rule.dto';
import { QueryAlertRulesDto } from './dto/query-alert-rule.dto';
import { QueryIncidentsDto } from './dto/query-incidents.dto';
import { IncidentStatus, Prisma } from '../generated/prisma/client';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- Rules ----------
  async createRule(dto: CreateAlertRuleDto) {
    if (dto.serverId) await this.assertServer(dto.serverId);
    return this.prisma.alertRule.create({ data: dto });
  }

  async findRules(q: QueryAlertRulesDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;

    const where: Prisma.AlertRuleWhereInput = {};
    if (q.serverId) where.serverId = q.serverId;
    if (q.severity) where.severity = q.severity;
    if (q.isActive !== undefined) where.isActive = q.isActive;

    const [data, total] = await Promise.all([
      this.prisma.alertRule.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      this.prisma.alertRule.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findRule(id: string) {
    const rule = await this.prisma.alertRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException(`Alert rule ${id} not found`);
    return rule;
  }

  async updateRule(id: string, dto: UpdateAlertRuleDto) {
    await this.findRule(id);
    if (dto.serverId) await this.assertServer(dto.serverId);
    return this.prisma.alertRule.update({ where: { id }, data: dto });
  }

  async removeRule(id: string) {
    await this.findRule(id);
    return this.prisma.alertRule.delete({ where: { id } });
  }

  // ---------- Incidents ----------
  async findIncidents(q: QueryIncidentsDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;

    const where: Prisma.IncidentWhereInput = {};
    if (q.status) where.status = q.status;
    if (q.severity) where.severity = q.severity;
    if (q.serverId) where.serverId = q.serverId;

    const [data, total] = await Promise.all([
      this.prisma.incident.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { openedAt: 'desc' },
      }),
      this.prisma.incident.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findIncident(id: string) {
    const incident = await this.prisma.incident.findUnique({ where: { id } });
    if (!incident) throw new NotFoundException(`Incident ${id} not found`);
    return incident;
  }

  async acknowledge(id: string, userId?: string) {
    await this.findIncident(id);
    const data: Prisma.IncidentUncheckedUpdateInput = {
      status: IncidentStatus.ACKNOWLEDGED,
      acknowledgedAt: new Date(),
    };
    if (userId) data.acknowledgedById = userId;
    return this.prisma.incident.update({ where: { id }, data });
  }

  async resolve(id: string) {
    await this.findIncident(id);
    return this.prisma.incident.update({
      where: { id },
      data: { status: IncidentStatus.RESOLVED, resolvedAt: new Date() },
    });
  }

  private async assertServer(id: string) {
    const s = await this.prisma.server.findUnique({ where: { id } });
    if (!s) throw new NotFoundException(`Server ${id} not found`);
  }
}
