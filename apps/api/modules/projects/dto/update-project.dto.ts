
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { ProjectStatus } from '../../../src/generated/prisma/client';
export class UpdateProjectDto {
  @ApiPropertyOptional({ example: 'CloudOps Platform Updated' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'Updated project description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ enum: ProjectStatus, example: 'ARCHIVED' })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}
