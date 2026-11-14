import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import { ServersService } from './servers.service.js';

describe('ServersService', () => {
  let service: ServersService;
  const prisma = {
    server: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    environment: { findUnique: jest.fn() },
    $transaction: jest.fn(),
  };

  const dto = {
    name: 'web-01',
    provider: 'AWS',
    region: 'eu-west-1',
    cpuCores: 4,
    ramGb: 16,
    storageGb: 200,
    ipAddress: '10.0.1.15',
    environmentId: 'env-1',
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [ServersService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(ServersService);
  });

  it('creates a server when the environment exists', async () => {
    prisma.environment.findUnique.mockResolvedValue({ id: 'env-1' });
    prisma.server.create.mockResolvedValue({ id: 's1', ...dto });

    const result = await service.create(dto);

    expect(prisma.server.create).toHaveBeenCalledWith({ data: dto });
    expect(result.id).toBe('s1');
  });

  it('throws NotFound when the environment does not exist', async () => {
    prisma.environment.findUnique.mockResolvedValue(null);

    await expect(service.create(dto)).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.server.create).not.toHaveBeenCalled();
  });

  it('findOne throws NotFound for an unknown id', async () => {
    prisma.server.findUnique.mockResolvedValue(null);

    await expect(service.findOne('nope')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findAll returns a paginated response', async () => {
    prisma.$transaction.mockResolvedValue([[{ id: 's1' }], 1]);

    const result = await service.findAll({ page: 2, limit: 5 });

    expect(result).toEqual({ data: [{ id: 's1' }], total: 1, page: 2, limit: 5 });
  });
});
