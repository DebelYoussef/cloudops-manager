import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsIP,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateServerDto {
  @ApiProperty({ example: 'Production Server' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'AWS' })
  @IsString()
  @IsNotEmpty()
  provider: string;

  @ApiProperty({ example: 'eu-west-1' })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiProperty({ example: 8 })
  @IsInt()
  @Min(1)
  cpuCores: number;

  @ApiProperty({ example: 16 })
  @IsInt()
  @Min(1)
  ramGb: number;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(1)
  storageGb: number;

  @ApiProperty({ example: '192.168.1.10' })
  @IsIP()
  ipAddress: string;

  @ApiProperty({ example: 'ONLINE' })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({ example: 'UUID_ENVIRONMENT' })
  @IsUUID()
  environmentId: string;
}
