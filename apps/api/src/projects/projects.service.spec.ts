import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(() => {
    service = new ProjectsService({} as PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});