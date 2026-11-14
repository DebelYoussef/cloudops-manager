import { Injectable, Logger } from '@nestjs/common';
import { Metric } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

const compare = (v: number, op: string, t: number) =>
  op === '>' ? v > t : op === '>=' ? v >= t : op === '<' ? v < t : op === '<=' ? v <= t : false;

@Injectable()
export class AlertEvaluationService {
  private readonly logger = new Logger(AlertEvaluationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async evaluate(metric: Metric): Promise<void> {
    const rules = await this.prisma.alertRule.findMany({
      where: { isActive: true, OR: [{ serverId: metric.serverId }, { serverId: null }] },
    });

    for (const rule of rules) {
      const value = rule.metricType === 'CPU' ? metric.cpuUsage : metric.ramUsage;
      if (!compare(value, rule.operator, rule.threshold)) continue;

      // Pas de doublon : un incident encore ouvert pour cette règle et ce serveur
      const open = await this.prisma.incident.findFirst({
        where: { ruleId: rule.id, serverId: metric.serverId, status: { in: ['OPEN', 'ACKNOWLEDGED'] } },
      });
      if (open) continue;

      const incident = await this.prisma.incident.create({
        data: {
          ruleId: rule.id,
          serverId: metric.serverId,
          message: `${rule.name}: ${rule.metricType} ${rule.operator} ${rule.threshold} (value ${value.toFixed(1)})`,
          valueAtTrigger: value,
          severity: rule.severity,
          status: 'OPEN',
        },
      });
      this.logger.warn(`Incident ${incident.id} opened`);
      await this.notifications.createForIncident(incident);
    }
  }
}