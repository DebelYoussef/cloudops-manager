import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateProjectMemberDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 'DEVELOPER' })
  @IsString()
  @MaxLength(50)
  projectRole: string;
}