import { ApiPropertyOptional } from '@nestjs/swagger';
import { AppStatus } from '../../generated/prisma/enums.js';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

// page/limit définis ici pour ne pas dépendre de common/ (Person B).
// Quand PaginationDto est mergé dans develop, remplace par : extends PaginationDto
export class QueryApplicationDto {
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

  @ApiPropertyOptional({ description: 'Recherche sur le nom' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  serverId?: string;

  @ApiPropertyOptional({ enum: AppStatus })
  @IsOptional()
  @IsEnum(AppStatus)
  status?: AppStatus;
}
