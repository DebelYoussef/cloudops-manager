import { Module } from '@nestjs/common';
import { AlertsModule } from '../alerts/alerts.module';
import { MetricsSimulatorService } from './metrics-simulator.service';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';

@Module({
  imports: [AlertsModule],
  controllers: [MonitoringController],
  providers: [MonitoringService, MetricsSimulatorService],
  exports: [MonitoringService],
})
export class MonitoringModule {}
