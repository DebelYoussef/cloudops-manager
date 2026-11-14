import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServerStatus } from '../../generated/prisma/enums.js';
import {
  IsEnum,
  IsInt,
  IsIP,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateServerDto {
  @ApiProperty({ example: 'web-01' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'AWS' })
  @IsString()
  @IsNotEmpty()
  provider!: string;

  @ApiProperty({ example: 'eu-west-1' })
  @IsString()
  @IsNotEmpty()
  region!: string;

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(1)
  cpuCores!: number;

  @ApiProperty({ example: 16, description: 'RAM en Go' })
  @IsInt()
  @Min(1)
  ramGb!: number;

  @ApiProperty({ example: 200, description: 'Stockage en Go' })
  @IsInt()
  @Min(1)
  storageGb!: number;

  @ApiProperty({ example: '10.0.1.15' })
  @IsIP()
  ipAddress!: string;

  @ApiPropertyOptional({ enum: ServerStatus, default: ServerStatus.ONLINE })
  @IsOptional()
  @IsEnum(ServerStatus)
  status?: ServerStatus;

  @ApiProperty({ description: "Id de l'environnement du serveur" })
  @IsUUID()
  environmentId!: string;
}
