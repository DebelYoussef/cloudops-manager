import { Controller, Delete, Param, ParseUUIDPipe } from '@nestjs/common';

import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';

@ApiTags('Environments')
@Controller('environments')
export class EnvironmentsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an environment' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.removeEnvironment(id);
  }
}
