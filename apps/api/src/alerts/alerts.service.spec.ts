import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AlertsService } from './alerts.service';

describe('AlertsService', () => {
  let service: AlertsService;

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      providers: [AlertsService, { provide: PrismaService, useValue: {} }],
    }).compile();
    service = mod.get(AlertsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
