import { Module } from '@nestjs/common';

import { ProjectsController } from './projects.controller';
import { EnvironmentsController } from './environments.controller';
import { ProjectsService } from './projects.service';

@Module({
  controllers: [ProjectsController, EnvironmentsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
