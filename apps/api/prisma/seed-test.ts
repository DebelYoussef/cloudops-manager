import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const project = await prisma.project.create({
    data: { name: 'Demo Project', description: 'Test' },
  });
  const env = await prisma.environment.create({
    data: { name: 'DEV', projectId: project.id },
  });
  const server = await prisma.server.create({
    data: {
      name: 'srv-test-01',
      provider: 'AWS',
      region: 'eu-west-3',
      cpuCores: 4,
      ramGb: 16,
      storageGb: 100,
      ipAddress: '10.0.0.1',
      status: 'ONLINE',
      environmentId: env.id,
    },
  });
  console.log('SERVER ID:', server.id);
}

main().finally(() => prisma.$disconnect());