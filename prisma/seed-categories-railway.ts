import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  {
    name: 'Kesehatan & Fitness',
    subCategories: [
      'Olahraga Kardio',
      'Latihan Kekuatan',
      'Yoga & Stretching',
      'Nutrisi & Diet',
      'Meditation & Mindfulness'
    ]
  },
  {
    name: 'Pendidikan & Pembelajaran',
    subCategories: [
      'Bahasa Asing',
      'Pemrograman',
      'Matematika',
      'Sains',
      'Sejarah & Budaya'
    ]
  },
  {
    name: 'Karir & Profesional',
    subCategories: [
      'Interview Preparation',
      'Public Speaking',
      'Networking',
      'Resume Building',
      'Skill Development'
    ]
  },
  {
    name: 'Hobi & Kreativitas',
    subCategories: [
      'Seni & Lukis',
      'Musik',
      'Fotografi',
      'Video Editing',
      'Menulis & Blogging'
    ]
  },
  {
    name: 'Personal Development',
    subCategories: [
      'Produktivitas',
      'Time Management',
      'Self-Discipline',
      'Goal Setting',
      'Habit Building'
    ]
  }
];

async function main() {
  console.log('🌱 Seeding categories and subcategories...\n');

  try {
    for (const categoryData of categories) {
      console.log(`📁 Creating category: "${categoryData.name}"`);
      
      const category = await prisma.category.upsert({
        where: { name: categoryData.name },
        update: {},
        create: {
          name: categoryData.name,
          subCategories: {
            create: categoryData.subCategories.map((subName) => ({
              name: subName
            }))
          }
        },
        include: {
          subCategories: true
        }
      });

      console.log(`   ✅ Category created with ID: ${category.id}`);
      console.log(`   📝 Subcategories added:`);
      category.subCategories.forEach((sub) => {
        console.log(`      • ${sub.name} (ID: ${sub.id})`);
      });
      console.log();
    }

    // Display summary
    const categoryCount = await prisma.category.count();
    const subCategoryCount = await prisma.subCategory.count();

    console.log('✨ Seeding completed!\n');
    console.log('📊 Summary:');
    console.log(`   • Total Categories: ${categoryCount}`);
    console.log(`   • Total SubCategories: ${subCategoryCount}`);
    console.log(`   • Average per category: ${(subCategoryCount / categoryCount).toFixed(1)}`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
