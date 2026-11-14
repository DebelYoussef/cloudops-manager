import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { IncidentStatus, Severity } from '../../generated/prisma/client';

export class QueryIncidentsDto {
  @ApiPropertyOptional({ enum: IncidentStatus }) @IsOptional() @IsEnum(IncidentStatus) status?: IncidentStatus;
  @ApiPropertyOptional({ enum: Severity }) @IsOptional() @IsEnum(Severity) severity?: Severity;
  @ApiPropertyOptional() @IsOptional() @IsUUID() serverId?: string;
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @ApiPropertyOptional({ default: 20 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number = 20;
}