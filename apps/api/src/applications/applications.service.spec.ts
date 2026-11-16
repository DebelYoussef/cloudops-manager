import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ApplicationsService', () => {
  let service: ApplicationsService;

  const prismaMock = {
    server: {
      findUnique: jest.fn(),
    },
    application: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an application if server exists', async () => {
    prismaMock.server.findUnique.mockResolvedValue({ id: 'server-id' });

    const application = {
      id: 'app-id',
      name: 'Nginx',
      version: '1.25',
      serverId: 'server-id',
    };

    prismaMock.application.create.mockResolvedValue(application);

    const result = await service.create({
      name: 'Nginx',
      version: '1.25',
      serverId: 'server-id',
    });

    expect(result).toEqual(application);
    expect(prismaMock.server.findUnique).toHaveBeenCalled();
  });

  it('should throw 404 if server does not exist', async () => {
    prismaMock.server.findUnique.mockResolvedValue(null);

    await expect(
      service.create({
        name: 'Nginx',
        version: '1.25',
        serverId: 'server-id',
      }),
    ).rejects.toThrow(NotFoundException);

    expect(prismaMock.application.create).not.toHaveBeenCalled();
  });

  it('should return paginated applications', async () => {
    prismaMock.application.findMany.mockResolvedValue([]);
    prismaMock.application.count.mockResolvedValue(0);

    const result = await service.findAll({
      page: 1,
      limit: 10,
    });

    expect(result).toEqual({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    });
  });

  it('should throw 404 if application does not exist', async () => {
    prismaMock.application.findUnique.mockResolvedValue(null);

    await expect(service.findOne('unknown-id')).rejects.toThrow(
      NotFoundException,
    );
  });
});
