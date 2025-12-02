import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Adding missing email verification columns...');
    
    // Add emailVerifiedAt column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE User ADD COLUMN emailVerifiedAt DATETIME(3) NULL;
    `);
    console.log('✓ Added emailVerifiedAt column');
    
    // Add emailVerificationToken column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE User ADD COLUMN emailVerificationToken VARCHAR(191) NULL UNIQUE;
    `);
    console.log('✓ Added emailVerificationToken column');
    
    console.log('\n✅ Database schema updated successfully!');
  } catch (error) {
    if (error.message.includes('Duplicate column')) {
      console.log('✓ Columns already exist, skipping...');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
