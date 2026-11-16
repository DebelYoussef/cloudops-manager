import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class CreateEnvironmentDto {
  @ApiProperty({
    description: 'Environment type',
    example: 'DEV',
    enum: ['DEV', 'STAGING', 'PROD'],
  })
  @IsIn(['DEV', 'STAGING', 'PROD'])
  name: 'DEV' | 'STAGING' | 'PROD';
}
