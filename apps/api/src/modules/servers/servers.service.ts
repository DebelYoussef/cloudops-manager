import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { Prisma } from '../../generated/prisma/client';

import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';
import { QueryServerDto } from './dto/query-server.dto';

@Injectable()
export class ServersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateServerDto) {
    const environment = await this.prisma.environment.findUnique({
      where: { id: dto.environmentId },
    });

    if (!environment) {
      throw new NotFoundException('Environment not found');
    }

    const data: Prisma.ServerUncheckedCreateInput = {
      name: dto.name,
      provider: dto.provider,
      region: dto.region,
      cpuCores: dto.cpuCores,
      ramGb: dto.ramGb,
      storageGb: dto.storageGb,
      ipAddress: dto.ipAddress,
      status: dto.status as Prisma.ServerUncheckedCreateInput['status'],
      environmentId: dto.environmentId,
    };

    return this.prisma.server.create({
      data,
      include: { environment: true },
    });
  }

  async findAll(query: QueryServerDto) {
    const {
      page = 1,
      limit = 10,
      q,
      provider,
      region,
      status,
      environmentId,
    } = query;

    const where: Prisma.ServerWhereInput = {
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { ipAddress: { contains: q, mode: 'insensitive' } },
        ],
      }),
      ...(provider && { provider }),
      ...(region && { region }),
      ...(status && {
        status: status as Prisma.ServerWhereInput['status'],
      }),
      ...(environmentId && { environmentId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.server.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          environment: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),

      this.prisma.server.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const server = await this.prisma.server.findUnique({
      where: { id },
      include: {
        environment: true,
        applications: true,
      },
    });

    if (!server) {
      throw new NotFoundException('Server not found');
    }

    return server;
  }

  async update(id: string, dto: UpdateServerDto) {
    await this.findOne(id);

    if (dto.environmentId) {
      const environment = await this.prisma.environment.findUnique({
        where: { id: dto.environmentId },
      });

      if (!environment) {
        throw new NotFoundException('Environment not found');
      }
    }

    const data: Prisma.ServerUncheckedUpdateInput = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.provider !== undefined && { provider: dto.provider }),
      ...(dto.region !== undefined && { region: dto.region }),
      ...(dto.cpuCores !== undefined && { cpuCores: dto.cpuCores }),
      ...(dto.ramGb !== undefined && { ramGb: dto.ramGb }),
      ...(dto.storageGb !== undefined && { storageGb: dto.storageGb }),
      ...(dto.ipAddress !== undefined && { ipAddress: dto.ipAddress }),
      ...(dto.status !== undefined && {
        status: dto.status as Prisma.ServerUncheckedUpdateInput['status'],
      }),
      ...(dto.environmentId !== undefined && {
        environmentId: dto.environmentId,
      }),
    };

    return this.prisma.server.update({
      where: { id },
      data,
      include: {
        environment: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.server.delete({
      where: { id },
    });
  }
}
