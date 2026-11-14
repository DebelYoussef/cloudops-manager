import { Controller, Get, Param, ParseUUIDPipe, Patch, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { QueryIncidentsDto } from './dto/query-incidents.dto';

@ApiTags('Incidents')
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly service: AlertsService) {}

  @Get() @ApiOperation({ summary: 'List incidents (filters: status, severity, server)' })
  list(@Query() q: QueryIncidentsDto) { return this.service.findIncidents(q); }

  @Get(':id') @ApiOperation({ summary: 'Get an incident' })
  one(@Param('id', ParseUUIDPipe) id: string) { return this.service.findIncident(id); }

  @Patch(':id/acknowledge') @ApiOperation({ summary: 'Acknowledge an incident' })
  acknowledge(@Param('id', ParseUUIDPipe) id: string) { return this.service.acknowledge(id); }

  @Patch(':id/resolve') @ApiOperation({ summary: 'Resolve an incident' })
  resolve(@Param('id', ParseUUIDPipe) id: string) { return this.service.resolve(id); }
}