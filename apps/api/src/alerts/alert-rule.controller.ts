import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { CreateAlertRuleDto } from './dto/create-alert-rule.dto';
import { UpdateAlertRuleDto } from './dto/update-alert-rule.dto';
import { QueryAlertRulesDto } from '././dto/query-alert-rule.dto';

@ApiTags('Alert rules')
@Controller('alert-rules')
export class AlertRulesController {
  constructor(private readonly service: AlertsService) {}

  @Post() @ApiOperation({ summary: 'Create an alert rule' })
  create(@Body() dto: CreateAlertRuleDto) { return this.service.createRule(dto); }

  @Get() @ApiOperation({ summary: 'List alert rules (filters: server, severity, isActive)' })
  list(@Query() q: QueryAlertRulesDto) { return this.service.findRules(q); }

  @Get(':id') @ApiOperation({ summary: 'Get an alert rule' })
  one(@Param('id', ParseUUIDPipe) id: string) { return this.service.findRule(id); }

  @Patch(':id') @ApiOperation({ summary: 'Update an alert rule' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAlertRuleDto) {
    return this.service.updateRule(id, dto);
  }

  @Delete(':id') @ApiOperation({ summary: 'Delete an alert rule' })
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.service.removeRule(id); }
}