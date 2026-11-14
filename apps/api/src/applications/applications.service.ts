import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateApplicationDto } from './dto/create-application.dto.js';
import { QueryApplicationDto } from './dto/query-application.dto.js';
import { UpdateApplicationDto } from './dto/update-application.dto.js';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateApplicationDto) {
    await this.assertServerExists(dto.serverId);
    return this.prisma.application.create({ data: dto });
  }

  async findAll(query: QueryApplicationDto) {
    const { page, limit, q, serverId, status } = query;

    const where: Prisma.ApplicationWhereInput = {
      ...(q && { name: { contains: q, mode: 'insensitive' } }),
      ...(serverId && { serverId }),
      ...(status && { status }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.application.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { server: { select: { id: true, name: true, ipAddress: true } } },
      }),
      this.prisma.application.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: { server: true },
    });
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }

  async update(id: string, dto: UpdateApplicationDto) {
    await this.findOne(id);
    if (dto.serverId) await this.assertServerExists(dto.serverId);
    return this.prisma.application.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.application.delete({ where: { id } });
  }

  private async assertServerExists(serverId: string) {
    const server = await this.prisma.server.findUnique({ where: { id: serverId } });
    if (!server) throw new NotFoundException('Server not found');
  }
}
