import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { ServersService } from './servers.service';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';
import { QueryServerDto } from './dto/query-server.dto';

@ApiTags('Servers')
@Controller('servers')
export class ServersController {
  constructor(private readonly serversService: ServersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a server' })
  create(@Body() dto: CreateServerDto) {
    return this.serversService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all servers with filters and pagination' })
  findAll(@Query() query: QueryServerDto) {
    return this.serversService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a server by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.serversService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a server' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateServerDto) {
    return this.serversService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a server' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.serversService.remove(id);
  }
}
