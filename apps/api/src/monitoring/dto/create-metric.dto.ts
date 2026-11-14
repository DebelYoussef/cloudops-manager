import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class CreateMetricDto {
  @ApiProperty() @IsUUID() serverId: string;
  @ApiProperty({ minimum: 0, maximum: 100 }) @IsNumber() @Min(0) @Max(100) cpuUsage: number;
  @ApiProperty({ minimum: 0, maximum: 100 }) @IsNumber() @Min(0) @Max(100) ramUsage: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() timestamp?: Date;
}