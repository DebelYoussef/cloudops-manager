import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'List projects with search and pagination' })
  findAll(@Query() query: QueryProjectsDto) {
    return this.projectsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project details, members and environments' })
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add a member to a project' })
  addMember(
    @Param('id') projectId: string,
    @Body() dto: CreateProjectMemberDto,
  ) {
    return this.projectsService.addMember(projectId, dto);
  }

  @Patch(':id/members/:userId')
  @ApiOperation({ summary: 'Update a project member role' })
  updateMember(
    @Param('id') projectId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateProjectMemberDto,
  ) {
    return this.projectsService.updateMember(projectId, userId, dto);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove a member from a project' })
  removeMember(
    @Param('id') projectId: string,
    @Param('userId') userId: string,
  ) {
    return this.projectsService.removeMember(projectId, userId);
  }

  @Post(':id/environments')
  @ApiOperation({ summary: 'Create an environment in a project' })
  createEnvironment(
    @Param('id') projectId: string,
    @Body() dto: CreateEnvironmentDto,
  ) {
    return this.projectsService.createEnvironment(projectId, dto);
  }

  @Get(':id/environments')
  @ApiOperation({ summary: 'List project environments' })
  findEnvironments(@Param('id') projectId: string) {
    return this.projectsService.findEnvironments(projectId);
  }

  @Delete('environments/:id')
  @ApiOperation({ summary: 'Delete an environment' })
  removeEnvironment(@Param('id') id: string) {
    return this.projectsService.removeEnvironment(id);
  }
}