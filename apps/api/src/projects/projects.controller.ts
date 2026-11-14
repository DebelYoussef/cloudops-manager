import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectsDto } from './dto/query-projects.dto';
import { CreateProjectMemberDto } from './dto/create-project-member.dto';
import { UpdateProjectMemberDto } from './dto/update-project-member.dto';
import { CreateEnvironmentDto } from './dto/create-environment.dto';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a project' })
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects with filters and pagination' })
  findAll(@Query() query: QueryProjectsDto) {
    return this.projectsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project details with members and environments' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.remove(id);
  }

  // ───────── Members ─────────

  @Post(':id/members')
  @ApiOperation({ summary: 'Add a member to a project' })
  addMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateProjectMemberDto,
  ) {
    return this.projectsService.addMember(id, dto);
  }

  @Patch(':id/members/:userId')
  @ApiOperation({ summary: 'Update a project member role' })
  updateMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateProjectMemberDto,
  ) {
    return this.projectsService.updateMember(id, userId, dto);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove a project member' })
  removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.projectsService.removeMember(id, userId);
  }

  // ───────── Environments (of a project) ─────────

  @Post(':id/environments')
  @ApiOperation({ summary: 'Create an environment for a project' })
  createEnvironment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateEnvironmentDto,
  ) {
    return this.projectsService.createEnvironment(id, dto);
  }

  @Get(':id/environments')
  @ApiOperation({ summary: 'Get project environments' })
  findEnvironments(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.findEnvironments(id);
  }
}

// DELETE /environments/:id : contrôleur séparé pour obtenir bien cette URL
// (dans ProjectsController, le préfixe donnerait /projects/environments/:id)
@ApiTags('Projects')
@Controller('environments')
export class EnvironmentsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an environment' })
  removeEnvironment(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.removeEnvironment(id);
  }
}