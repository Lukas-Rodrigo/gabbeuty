import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { execSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

let prisma = new PrismaClient();

function generateUniqueDataBaseUrl(schemaId: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('Please provider a DATABASE_URL enrinment variable');
  }

  const url = new URL(process.env.DATABASE_URL);
  url.searchParams.set('schema', schemaId);

  return url.toString();
}

const uniqueDataBaseUrl = randomUUID();

beforeAll(async () => {
  const dataBaseUrl = generateUniqueDataBaseUrl(uniqueDataBaseUrl);
  process.env.DATABASE_URL = dataBaseUrl;

  const cleanupPrisma = new PrismaClient();
  try {
    await cleanupPrisma.$executeRawUnsafe(
      `DROP SCHEMA IF EXISTS "${uniqueDataBaseUrl}" CASCADE`,
    );
  } catch (error) {
    console.log(error);
  } finally {
    await cleanupPrisma.$disconnect();
  }

  execSync('npx prisma db push --force-reset', { stdio: 'inherit' });

  prisma = new PrismaClient();
});

afterAll(async () => {
  console.log('banco de dados destruido');
  await prisma.$executeRawUnsafe(
    `DROP SCHEMA IF EXISTS "${uniqueDataBaseUrl}" CASCADE`,
  );
  await prisma.$disconnect();
});
