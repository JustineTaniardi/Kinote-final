import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('📊 Fetching categories from Railway DB...\n');

    const categories = await prisma.category.findMany({
      include: {
        subCategories: true
      },
      orderBy: {
        id: 'desc'
      },
      take: 5
    });

    console.log(`✅ Found ${categories.length} recent categories:\n`);

    categories.forEach((cat) => {
      console.log(`📁 ${cat.name} (ID: ${cat.id})`);
      cat.subCategories.forEach(sub => {
        console.log(`   • ${sub.name}`);
      });
      console.log();
    });

    // Get total counts
    const totalCategories = await prisma.category.count();
    const totalSubCategories = await prisma.subCategory.count();

    console.log('📈 Statistics:');
    console.log(`   • Total Categories: ${totalCategories}`);
    console.log(`   • Total SubCategories: ${totalSubCategories}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
