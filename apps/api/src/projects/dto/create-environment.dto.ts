import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { EnvType } from '../../generated/prisma/client';

export class CreateEnvironmentDto {
  @ApiProperty({ enum: EnvType, example: EnvType.DEV })
  @IsEnum(EnvType)
  name: EnvType;
}