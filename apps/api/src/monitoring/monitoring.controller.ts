import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateMetricDto } from './dto/create-metric.dto';
import { QueryMetricsDto } from './dto/query-metrics.dto';
import { MonitoringService } from './monitoring.service';

@ApiTags('Monitoring')
@Controller()
export class MonitoringController {
  constructor(private readonly service: MonitoringService) {}

  @Post('metrics')
  @ApiOperation({ summary: 'Record a metric for a server' })
  create(@Body() dto: CreateMetricDto) { return this.service.create(dto); }

  @Get('servers/:id/metrics')
  @ApiOperation({ summary: 'Metric history of a server (from, to, limit)' })
  list(@Param('id', ParseUUIDPipe) id: string, @Query() q: QueryMetricsDto) {
    return this.service.findByServer(id, q);
  }

  @Get('servers/:id/availability')
  @ApiOperation({ summary: 'Availability of a server over the last 24h' })
  availability(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.availability(id);
  }
}