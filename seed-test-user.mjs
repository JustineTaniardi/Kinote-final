import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

(async () => {
  try {
    const hashedPassword = await bcrypt.hash('test123456', 10);
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@kinote.local',
        password: hashedPassword,
        emailVerifiedAt: new Date()
      }
    });
    console.log('✓ User created:', user.email);
  } catch (e) {
    if (e.code === 'P2002') {
      console.log('✓ User already exists');
    } else {
      console.log('Error:', e.message);
    }
  } finally {
    await prisma.$disconnect();
  }
})();
