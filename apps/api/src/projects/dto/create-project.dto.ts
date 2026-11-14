import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ProjectStatus } from '../../generated/prisma/client';

export class CreateProjectDto {
  @ApiProperty({ example: 'Cloud Infrastructure' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Main cloud infrastructure project' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ProjectStatus, default: ProjectStatus.ACTIVE })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}