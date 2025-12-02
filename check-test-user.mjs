import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Checking test user in Railway database...\n');

    // Check test user
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });

    if (user) {
      console.log('✅ Test user EXISTS:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Email Verified: ${user.emailVerifiedAt ? 'YES' : 'NO'}`);
      console.log(`   Password Hash: ${user.password.substring(0, 20)}...`);
      
      // Test password comparison
      const testPassword = 'password123';
      const isMatch = await bcrypt.compare(testPassword, user.password);
      console.log(`   Password Match (password123): ${isMatch ? 'YES ✓' : 'NO ✗'}`);
    } else {
      console.log('❌ Test user NOT FOUND');
      console.log('\nCreating test user now...');
      
      const hashedPassword = await bcrypt.hash('password123', 10);
      const newUser = await prisma.user.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          password: hashedPassword,
          emailVerifiedAt: new Date(),
        }
      });
      
      console.log('✅ Test user created:');
      console.log(`   ID: ${newUser.id}`);
      console.log(`   Email: ${newUser.email}`);
      console.log(`   Password Hash: ${newUser.password.substring(0, 20)}...`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
