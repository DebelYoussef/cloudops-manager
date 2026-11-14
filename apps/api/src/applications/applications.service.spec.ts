import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import { ApplicationsService } from './applications.service.js';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  const prisma = {
    application: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    server: { findUnique: jest.fn() },
    $transaction: jest.fn(),
  };

  const dto = { name: 'billing-api', version: '1.0.0', serverId: 'srv-1' };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [ApplicationsService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(ApplicationsService);
  });

  it('creates an application when the server exists', async () => {
    prisma.server.findUnique.mockResolvedValue({ id: 'srv-1' });
    prisma.application.create.mockResolvedValue({ id: 'a1', ...dto });

    const result = await service.create(dto);

    expect(prisma.application.create).toHaveBeenCalledWith({ data: dto });
    expect(result.id).toBe('a1');
  });

  it('throws NotFound when the server does not exist', async () => {
    prisma.server.findUnique.mockResolvedValue(null);

    await expect(service.create(dto)).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.application.create).not.toHaveBeenCalled();
  });

  it('update throws NotFound for an unknown application', async () => {
    prisma.application.findUnique.mockResolvedValue(null);

    await expect(service.update('nope', { version: '2.0.0' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
