import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AlertEvaluationService } from './alert-evaluation.service';

describe('AlertEvaluationService', () => {
  let service: AlertEvaluationService;
  const prisma = {
    alertRule: { findMany: jest.fn() },
    incident: { findFirst: jest.fn(), create: jest.fn() },
  };
  const notifications = { createForIncident: jest.fn() };
  const metric: any = { serverId: 's1', cpuUsage: 95, ramUsage: 40 };
  const rule = {
    id: 'r1',
    name: 'CPU high',
    metricType: 'CPU',
    operator: '>',
    threshold: 80,
    severity: 'HIGH',
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const mod = await Test.createTestingModule({
      providers: [
        AlertEvaluationService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notifications },
      ],
    }).compile();
    service = mod.get(AlertEvaluationService);
  });

  it('creates an incident and a notification on breach', async () => {
    prisma.alertRule.findMany.mockResolvedValue([rule]);
    prisma.incident.findFirst.mockResolvedValue(null);
    prisma.incident.create.mockResolvedValue({ id: 'i1' });
    await service.evaluate(metric);
    expect(prisma.incident.create).toHaveBeenCalled();
    expect(notifications.createForIncident).toHaveBeenCalled();
  });

  it('does not create a duplicate while an incident is open', async () => {
    prisma.alertRule.findMany.mockResolvedValue([rule]);
    prisma.incident.findFirst.mockResolvedValue({ id: 'i1' });
    await service.evaluate(metric);
    expect(prisma.incident.create).not.toHaveBeenCalled();
  });

  it('does nothing below the threshold', async () => {
    prisma.alertRule.findMany.mockResolvedValue([rule]);
    await service.evaluate({ ...metric, cpuUsage: 50 });
    expect(prisma.incident.create).not.toHaveBeenCalled();
  });
});
