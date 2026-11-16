import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class UpdateProjectMemberDto {
  @ApiProperty({
    example: 'DEVOPS',
    enum: ['ADMIN', 'DEVOPS', 'VIEWER'],
  })
  @IsString()
  @IsIn(['ADMIN', 'DEVOPS', 'VIEWER'])
  projectRole: string;
}
