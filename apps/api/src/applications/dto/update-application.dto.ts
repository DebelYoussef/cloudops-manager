import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateApplicationDto {
  @ApiPropertyOptional({ example: '1.26.0' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  version?: string;

  @ApiPropertyOptional({
    example: 'RUNNING',
  })
  @IsOptional()
  @IsString()
  status?: string;
}