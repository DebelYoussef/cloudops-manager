import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppStatus } from '../../generated/prisma/enums.js';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({ example: 'billing-api' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '1.4.2' })
  @IsString()
  @IsNotEmpty()
  version!: string;

  @ApiPropertyOptional({ enum: AppStatus, default: AppStatus.RUNNING })
  @IsOptional()
  @IsEnum(AppStatus)
  status?: AppStatus;

  @ApiProperty({ description: 'Id du serveur qui héberge l’application' })
  @IsUUID()
  serverId!: string;
}
