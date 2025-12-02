import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('📋 Checking database...\n');

    const userCount = await prisma.user.count();
    const categoryCount = await prisma.category.count();
    const dayCount = await prisma.day.count();
    const difficultyCount = await prisma.difficulty.count();
    const statusCount = await prisma.status.count();

    console.log('User Count:', userCount);
    console.log('Category Count:', categoryCount);
    console.log('Day Count:', dayCount);
    console.log('Difficulty Count:', difficultyCount);
    console.log('Status Count:', statusCount);

    if (dayCount === 0) {
      console.log('\n⚠️  Days table is empty. Creating days...');
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      for (const day of days) {
        await prisma.day.create({ data: { name: day } });
      }
      console.log('✅ Days created!');
    }

    if (difficultyCount === 0) {
      console.log('\n⚠️  Difficulty table is empty. Creating difficulties...');
      const difficulties = ['Easy', 'Medium', 'Hard'];
      for (const difficulty of difficulties) {
        await prisma.difficulty.create({ data: { name: difficulty } });
      }
      console.log('✅ Difficulties created!');
    }

    if (statusCount === 0) {
      console.log('\n⚠️  Status table is empty. Creating statuses...');
      const statuses = ['Active', 'Completed', 'Paused'];
      for (const status of statuses) {
        await prisma.status.create({ data: { name: status } });
      }
      console.log('✅ Statuses created!');
    }

    if (categoryCount === 0) {
      console.log('\n⚠️  Category table is empty. Creating categories...');
      const categories = [
        'Work',
        'Health',
        'Learning',
        'Personal',
        'Hobbies',
        'Exercise',
        'Reading'
      ];
      for (const category of categories) {
        await prisma.category.create({ data: { name: category } });
      }
      console.log('✅ Categories created!');
    }

    console.log('\n✅ Database setup complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
