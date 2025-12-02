import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔗 Testing database connection...\n');
    
    // Test simple query
    const userCount = await prisma.user.count();
    console.log(`✅ Total users in database: ${userCount}\n`);
    
    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, emailVerifiedAt: true }
    });
    
    console.log('📋 All users:');
    console.table(users);
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
