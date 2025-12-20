import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { execSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

let prisma: PrismaClient;

function generateUniqueDataBaseUrl(schemaId: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('Please provider a DATABASE_URL environment variable');
  }

  const url = new URL(process.env.DATABASE_URL);
  url.searchParams.set('schema', schemaId);

  return url.toString();
}

const uniqueDataBaseUrl = randomUUID();

beforeAll(async () => {
  const dataBaseUrl = generateUniqueDataBaseUrl(uniqueDataBaseUrl);
  process.env.DATABASE_URL = dataBaseUrl;

  const cleanupPool = new Pool({ connectionString: dataBaseUrl });
  const cleanupAdapter = new PrismaPg(cleanupPool);
  const cleanupPrisma = new PrismaClient({
    adapter: cleanupAdapter,
  });
  try {
    await cleanupPrisma.$executeRawUnsafe(
      `DROP SCHEMA IF EXISTS "${uniqueDataBaseUrl}" CASCADE`,
    );
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    await cleanupPrisma.$disconnect();
    await cleanupPool.end();
  }

  execSync('npx prisma db push --force-reset', { stdio: 'inherit' });

  const pool = new Pool({ connectionString: dataBaseUrl });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({
    adapter,
  });
});

afterAll(async () => {
  console.log('banco de dados destruido');
  await prisma.$executeRawUnsafe(
    `DROP SCHEMA IF EXISTS "${uniqueDataBaseUrl}" CASCADE`,
  );
  await prisma.$disconnect();
});
