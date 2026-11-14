import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsIn, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { MetricType, Severity } from '../../generated/prisma/client';

export class CreateAlertRuleDto {
  @ApiProperty() @IsString() name!: string;
  @ApiProperty({ enum: MetricType }) @IsEnum(MetricType) metricType!: MetricType;
  @ApiProperty({ enum: ['>', '>=', '<', '<='] }) @IsIn(['>', '>=', '<', '<=']) operator!: string;
  @ApiProperty() @IsNumber() threshold!: number;
  @ApiProperty({ enum: Severity }) @IsEnum(Severity) severity!: Severity;
  @ApiPropertyOptional({ description: 'Omit for a global rule' }) @IsOptional() @IsUUID() serverId?: string;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}