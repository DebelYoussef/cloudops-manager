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
import { CreateServerDto } from './dto/create-server.dto.js';
import { QueryServerDto } from './dto/query-server.dto.js';
import { UpdateServerDto } from './dto/update-server.dto.js';
import { ServersService } from './servers.service.js';

@ApiTags('servers')
@Controller('servers')
export class ServersController {
  constructor(private readonly serversService: ServersService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un serveur' })
  create(@Body() dto: CreateServerDto) {
    return this.serversService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les serveurs (recherche, filtres, pagination)' })
  findAll(@Query() query: QueryServerDto) {
    return this.serversService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'un serveur" })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.serversService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un serveur' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServerDto,
  ) {
    return this.serversService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un serveur' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.serversService.remove(id);
  }
}
