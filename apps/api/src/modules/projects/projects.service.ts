import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { CreateEnvironmentDto } from './dto/create-environment.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  // CREATE PROJECT
  async create(dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: dto,
    });
  }

  async findAll(query: QueryProjectDto) {
    const { page = 1, limit = 10, q, status } = query;

    const where = {
      ...(q
        ? {
            name: {
              contains: q,
              mode: 'insensitive' as const,
            },
          }
        : {}),
      ...(status ? { status } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.project.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  // GET PROJECT BY ID
  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        members: true,
        environments: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  // UPDATE PROJECT
  async update(id: string, dto: UpdateProjectDto) {
    await this.findOne(id);

    return this.prisma.project.update({
      where: { id },
      data: dto,
    });
  }

  // DELETE PROJECT
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.project.delete({
      where: { id },
    });
  }

  // ADD MEMBER TO PROJECT
  async addMember(projectId: string, dto: AddProjectMemberDto) {
    await this.findOne(projectId);

    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingMember = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: dto.userId,
          projectId,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException('User is already a project member');
    }

    return this.prisma.projectMember.create({
      data: {
        userId: dto.userId,
        projectId,
        projectRole: dto.projectRole,
      },
    });
  }

  // UPDATE MEMBER ROLE
  async updateMember(projectId: string, userId: string, projectRole: string) {
    await this.findOne(projectId);

    const member = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Project member not found');
    }

    return this.prisma.projectMember.update({
      where: { id: member.id },
      data: { projectRole },
    });
  }

  // REMOVE MEMBER
  async removeMember(projectId: string, userId: string) {
    await this.findOne(projectId);

    const member = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Project member not found');
    }

    return this.prisma.projectMember.delete({
      where: { id: member.id },
    });
  }

  // CREATE ENVIRONMENT
  async createEnvironment(projectId: string, dto: CreateEnvironmentDto) {
    await this.findOne(projectId);

    const existing = await this.prisma.environment.findUnique({
      where: {
        projectId_name: {
          projectId,
          name: dto.name,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        'This environment already exists in the project',
      );
    }

    return this.prisma.environment.create({
      data: {
        name: dto.name,
        projectId,
      },
    });
  }

  // GET PROJECT ENVIRONMENTS
  async findEnvironments(projectId: string) {
    await this.findOne(projectId);

    return this.prisma.environment.findMany({
      where: { projectId },
      include: { servers: true },
    });
  }

  // DELETE ENVIRONMENT
  async removeEnvironment(environmentId: string) {
    const environment = await this.prisma.environment.findUnique({
      where: { id: environmentId },
    });

    if (!environment) {
      throw new NotFoundException('Environment not found');
    }

    return this.prisma.environment.delete({
      where: { id: environmentId },
    });
  }
}
