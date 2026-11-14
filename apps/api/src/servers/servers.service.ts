import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateServerDto } from './dto/create-server.dto.js';
import { QueryServerDto } from './dto/query-server.dto.js';
import { UpdateServerDto } from './dto/update-server.dto.js';

@Injectable()
export class ServersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateServerDto) {
    await this.assertEnvironmentExists(dto.environmentId);
    return this.prisma.server.create({ data: dto });
  }

  async findAll(query: QueryServerDto) {
    const { page, limit, q, provider, region, status, environmentId } = query;

    const where: Prisma.ServerWhereInput = {
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { ipAddress: { contains: q } },
        ],
      }),
      ...(provider && { provider }),
      ...(region && { region }),
      ...(status && { status }),
      ...(environmentId && { environmentId }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.server.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { environment: true },
      }),
      this.prisma.server.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const server = await this.prisma.server.findUnique({
      where: { id },
      include: { environment: true, applications: true },
    });
    if (!server) throw new NotFoundException('Server not found');
    return server;
  }

  async update(id: string, dto: UpdateServerDto) {
    await this.findOne(id);
    if (dto.environmentId) await this.assertEnvironmentExists(dto.environmentId);
    return this.prisma.server.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.server.delete({ where: { id } });
  }

  private async assertEnvironmentExists(environmentId: string) {
    const env = await this.prisma.environment.findUnique({
      where: { id: environmentId },
    });
    if (!env) throw new NotFoundException('Environment not found');
  }
}
