import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AddProjectMemberDto {
  @ApiProperty({
    description: 'ID of the user to add',
    example: 'c9e60558-6435-4932-b0ad-e1487abe95cd',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Role of the user in the project',
    example: 'DEVOPS',
    enum: ['ADMIN', 'DEVOPS', 'VIEWER'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['ADMIN', 'DEVOPS', 'VIEWER'])
  projectRole: string;
}
