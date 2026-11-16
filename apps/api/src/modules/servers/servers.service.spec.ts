import { NotFoundException } from '@nestjs/common';
import { ServersService } from './servers.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServerDto } from './dto/create-server.dto';
import { QueryServerDto } from './dto/query-server.dto';

describe('ServersService', () => {
  let service: ServersService;

  const prismaMock = {
    environment: {
      findUnique: jest.fn(),
    },
    server: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new ServersService(prismaMock as unknown as PrismaService);
  });

  describe('create', () => {
    it('should create a server when environment exists', async () => {
      prismaMock.environment.findUnique.mockResolvedValue({
        id: 'env-1',
      });

      prismaMock.server.create.mockResolvedValue({
        id: 'server-1',
        name: 'Test Server',
      });

      const dto = {
        name: 'Test Server',
        provider: 'AWS',
        region: 'eu-west',
        cpuCores: 4,
        ramGb: 8,
        storageGb: 100,
        ipAddress: '192.168.1.10',
        status: 'ONLINE',
        environmentId: 'env-1',
      };

      const result = await service.create(dto);

      expect(result).toEqual({
        id: 'server-1',
        name: 'Test Server',
      });

      expect(prismaMock.server.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if environment does not exist', async () => {
      prismaMock.environment.findUnique.mockResolvedValue(null);

      const dto = {
        environmentId: 'unknown',
      } as CreateServerDto;

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);

      expect(prismaMock.server.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated servers', async () => {
      const servers = [
        { id: 'server-1', name: 'Server 1' },
        { id: 'server-2', name: 'Server 2' },
      ];

      prismaMock.server.findMany.mockResolvedValue(servers);
      prismaMock.server.count.mockResolvedValue(20);

      const query = {
        page: 2,
        limit: 5,
      } as QueryServerDto;

      const result = await service.findAll(query);

      expect(result).toEqual({
        data: servers,
        total: 20,
        page: 2,
        limit: 5,
      });

      expect(prismaMock.server.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if server does not exist', async () => {
      prismaMock.server.findUnique.mockResolvedValue(null);

      await expect(service.findOne('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
