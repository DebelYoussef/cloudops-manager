import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    example: 'Cloud Monitoring Platform',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'Platform for infrastructure monitoring',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description?: string;
}