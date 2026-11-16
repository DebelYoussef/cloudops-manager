import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ProjectsService } from './projects.service';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
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
  @ApiOperation({ summary: 'Get all projects with pagination' })
  findAll(@Query() query: QueryProjectDto) {
    return this.projectsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
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

  // PROJECT MEMBERS

  @Post(':id/members')
  @ApiOperation({ summary: 'Add a member to a project' })
  addMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddProjectMemberDto,
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
    return this.projectsService.updateMember(id, userId, dto.projectRole);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove a member from a project' })
  removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.projectsService.removeMember(id, userId);
  }

  // PROJECT ENVIRONMENTS

  @Post(':id/environments')
  @ApiOperation({ summary: 'Create an environment' })
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
