const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function test() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ DATABASE_URL works perfectly');
  } catch (err) {
    console.error('❌ DATABASE_URL FAILED');
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
