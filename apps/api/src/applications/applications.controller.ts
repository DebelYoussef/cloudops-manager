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

import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { QueryApplicationDto } from './dto/query-application.dto';

@ApiTags('Applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new application' })
  create(@Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all applications with filters and pagination' })
  findAll(@Query() query: QueryApplicationDto) {
    return this.applicationsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an application by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.applicationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an application' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.applicationsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an application' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.applicationsService.remove(id);
  }
}
