
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { QueryApplicationDto } from './dto/query-application.dto';
import { AppStatus } from '../generated/prisma/enums';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  // CREATE APPLICATION
  async create(dto: CreateApplicationDto) {
    // Check if the server exists
    const server = await this.prisma.server.findUnique({
      where: {
        id: dto.serverId,
      },
    });

    if (!server) {
      throw new NotFoundException(
        `Server with ID ${dto.serverId} not found`,
      );
    }

    return this.prisma.application.create({
      data: {
        name: dto.name,
        version: dto.version,
        serverId: dto.serverId,
      },
      include: {
        server: true,
      },
    });
  }

  // GET ALL APPLICATIONS WITH FILTERS AND PAGINATION
  async findAll(query: QueryApplicationDto) {
    const { q, serverId, status } = query;

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      ...(serverId ? { serverId } : {}),
      ...(status ? { status: status as AppStatus } : {}),
      ...(q
        ? {
            name: {
              contains: q,
              mode: 'insensitive' as const,
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          server: true,
        },
      }),

      this.prisma.application.count({
        where,
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  // GET ONE APPLICATION
  async findOne(id: string) {
    const application = await this.prisma.application.findUnique({
      where: {
        id,
      },
      include: {
        server: true,
      },
    });

    if (!application) {
      throw new NotFoundException(
        `Application with ID ${id} not found`,
      );
    }

    return application;
  }

  // UPDATE APPLICATION
  async update(id: string, dto: UpdateApplicationDto) {
    // Check if application exists
    await this.findOne(id);

    return this.prisma.application.update({
      where: {
        id,
      },
      data: {
        ...(dto.version !== undefined
          ? { version: dto.version }
          : {}),

        ...(dto.status !== undefined
          ? { status: dto.status as AppStatus }
          : {}),
      },
      include: {
        server: true,
      },
    });
  }

  // DELETE APPLICATION
  async remove(id: string) {
    // Check if application exists
    await this.findOne(id);

    await this.prisma.application.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Application deleted successfully',
    };
  }
}
