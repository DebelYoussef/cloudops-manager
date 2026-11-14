import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { PrismaModule } from './prisma/prisma.module';

import { MonitoringModule } from './monitoring/monitoring.module';
import { AlertsModule } from './alerts/alerts.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ScheduleModule.forRoot(),

    PrismaModule,

    MonitoringModule,
    AlertsModule,
    NotificationsModule,
    ProjectsModule,
  ],
})
export class AppModule {}