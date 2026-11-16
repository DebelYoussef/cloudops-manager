import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { AlertEvaluationService } from './alert-evaluation.service';
import { AlertRulesController } from '././alert-rule.controller';
import { AlertsService } from './alerts.service';
import { IncidentsController } from './incidents.controller';

@Module({
  imports: [NotificationsModule],
  controllers: [AlertRulesController, IncidentsController],
  providers: [AlertsService, AlertEvaluationService],
  exports: [AlertEvaluationService],
})
export class AlertsModule {}
