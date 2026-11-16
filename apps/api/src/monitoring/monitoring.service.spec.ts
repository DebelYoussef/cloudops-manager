import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { MonitoringService } from './monitoring.service';

describe('MonitoringService', () => {
  let service: MonitoringService;
  const prisma = {
    server: { findUnique: jest.fn() },
    metric: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const mod = await Test.createTestingModule({
      providers: [
        MonitoringService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = mod.get(MonitoringService);
  });

  it('rejects a metric for an unknown server', async () => {
    prisma.server.findUnique.mockResolvedValue(null);
    await expect(
      service.create({ serverId: 'x', cpuUsage: 1, ramUsage: 1 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates a metric for an existing server', async () => {
    prisma.server.findUnique.mockResolvedValue({ id: 's1' });
    prisma.metric.create.mockResolvedValue({ id: 'm1' });
    await service.create({ serverId: 's1', cpuUsage: 10, ramUsage: 20 });
    expect(prisma.metric.create).toHaveBeenCalled();
  });

  it('caps availability at 100%', async () => {
    prisma.server.findUnique.mockResolvedValue({ id: 's1', status: 'ONLINE' });
    prisma.metric.count.mockResolvedValue(999999);
    prisma.metric.findFirst.mockResolvedValue(null);
    const res = await service.availability('s1');
    expect(res.availabilityPercent).toBe(100);
  });
});
