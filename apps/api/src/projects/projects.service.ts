import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectsDto } from './dto/query-projects.dto';
import { CreateProjectMemberDto } from './dto/create-project-member.dto';
import { UpdateProjectMemberDto } from './dto/update-project-member.dto';
import { CreateEnvironmentDto } from './dto/create-environment.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProjectDto) {
    return this.prisma.project.create({ data: dto });
  }

  async findAll(query: QueryProjectsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: 'insensitive' as const } },
              {
                description: {
                  contains: query.q,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.project.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        members: { include: { user: true } },
        environments: { include: { servers: true } },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }

    return project;
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.ensureProjectExists(id);
    return this.prisma.project.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.ensureProjectExists(id);
    return this.prisma.project.delete({ where: { id } });
  }

  async addMember(projectId: string, dto: CreateProjectMemberDto) {
    await this.ensureProjectExists(projectId);

    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException(`User ${dto.userId} not found`);
    }

    const existing = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: dto.userId,
          projectId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('This user is already a project member');
    }

    return this.prisma.projectMember.create({
      data: {
        userId: dto.userId,
        projectId,
        projectRole: dto.projectRole,
      },
    });
  }

  async updateMember(
    projectId: string,
    userId: string,
    dto: UpdateProjectMemberDto,
  ) {
    await this.ensureMemberExists(projectId, userId);

    return this.prisma.projectMember.update({
      where: { userId_projectId: { userId, projectId } },
      data: { projectRole: dto.projectRole },
    });
  }

  async removeMember(projectId: string, userId: string) {
    await this.ensureMemberExists(projectId, userId);

    return this.prisma.projectMember.delete({
      where: { userId_projectId: { userId, projectId } },
    });
  }

  async createEnvironment(projectId: string, dto: CreateEnvironmentDto) {
    await this.ensureProjectExists(projectId);

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

  async findEnvironments(projectId: string) {
    await this.ensureProjectExists(projectId);

    return this.prisma.environment.findMany({
      where: { projectId },
      include: { servers: true },
      orderBy: { name: 'asc' },
    });
  }

  async removeEnvironment(id: string) {
    const environment = await this.prisma.environment.findUnique({
      where: { id },
    });

    if (!environment) {
      throw new NotFoundException(`Environment ${id} not found`);
    }

    return this.prisma.environment.delete({ where: { id } });
  }

  private async ensureProjectExists(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }
  }

  private async ensureMemberExists(projectId: string, userId: string) {
    const member = await this.prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });

    if (!member) {
      throw new NotFoundException('Project member not found');
    }
  }
}