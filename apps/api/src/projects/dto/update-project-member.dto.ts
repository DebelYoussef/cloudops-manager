import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class UpdateProjectMemberDto {
  @ApiProperty({ example: 'ADMIN' })
  @IsString()
  @MaxLength(50)
  projectRole: string;
}