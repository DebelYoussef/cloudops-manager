import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

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
}
