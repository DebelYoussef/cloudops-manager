import { Module } from '@nestjs/common';
import { EnvironmentsController, ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  controllers: [ProjectsController, EnvironmentsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}