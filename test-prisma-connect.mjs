import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    console.log('🔗 Testing Prisma connection...');
    const count = await prisma.user.count();
    console.log('✅ Prisma connected! Users:', count);
    process.exit(0);
  } catch (error) {
    console.error('❌ Prisma error:', error.message);
    process.exit(1);
  }
}

test();
