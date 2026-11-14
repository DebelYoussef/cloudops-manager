import { ApiPropertyOptional } from '@nestjs/swagger';
import { ServerStatus } from '../../generated/prisma/enums.js';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

// page/limit définis ici pour ne pas dépendre de common/ (Person B).
// Quand PaginationDto est mergé dans develop, remplace par : extends PaginationDto
export class QueryServerDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @ApiPropertyOptional({ description: 'Recherche sur le nom ou l’IP' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ enum: ServerStatus })
  @IsOptional()
  @IsEnum(ServerStatus)
  status?: ServerStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  environmentId?: string;
}
