import { Module } from '@nestjs/common';
import { ServersController } from './servers.controller.js';
import { ServersService } from './servers.service.js';

@Module({
  controllers: [ServersController],
  providers: [ServersService],
  exports: [ServersService],
})
export class ServersModule {}
