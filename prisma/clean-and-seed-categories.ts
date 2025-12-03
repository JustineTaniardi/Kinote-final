import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const newCategories = [
  {
    name: 'Kesehatan & Fitness',
    subCategories: [
      'Olahraga Kardio',
      'Latihan Kekuatan',
      'Yoga & Stretching',
      'Nutrisi & Diet',
      'Meditasi & Mindfulness'
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
      'Persiapan Interview',
      'Public Speaking',
      'Networking',
      'Membangun Resume',
      'Pengembangan Skill'
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
    name: 'Pengembangan Diri',
    subCategories: [
      'Produktivitas',
      'Manajemen Waktu',
      'Disiplin Diri',
      'Penetapan Tujuan',
      'Pembentukan Kebiasaan'
    ]
  }
];

async function main() {
  console.log('🌱 Starting category cleanup and seeding...\n');

  try {
    // Step 1: Delete all existing subcategories and categories
    console.log('🧹 Step 1: Cleaning up existing categories and subcategories...');
    
    // Order matters due to foreign key constraints:
    // 1. Delete AiVerification (references Streak and StreakHistory)
    const deletedAiVerifications = await prisma.aiVerification.deleteMany({});
    console.log(`   ✓ Deleted ${deletedAiVerifications.count} AI verifications`);

    // 2. Delete StreakExport (references Streak) 
    const deletedStreakExports = await prisma.streakExport.deleteMany({});
    console.log(`   ✓ Deleted ${deletedStreakExports.count} streak exports`);

    // 3. Delete StreakHistory (references Streak, has onDelete: Cascade)
    const deletedStreakHistories = await prisma.streakHistory.deleteMany({});
    console.log(`   ✓ Deleted ${deletedStreakHistories.count} streak histories`);

    // 4. Delete all streaks (they have categoryId, subCategoryId, dayId, userId)
    const deletedStreaks = await prisma.streak.deleteMany({});
    console.log(`   ✓ Deleted ${deletedStreaks.count} streaks`);

    // 5. Delete all subcategories
    const deletedSubCategories = await prisma.subCategory.deleteMany({});
    console.log(`   ✓ Deleted ${deletedSubCategories.count} subcategories`);

    // 6. Delete all categories
    const deletedCategories = await prisma.category.deleteMany({});
    console.log(`   ✓ Deleted ${deletedCategories.count} categories\n`);

    // Step 2: Create new categories with subcategories
    console.log('📁 Step 2: Creating new categories and subcategories...\n');

    let totalSubCategories = 0;

    for (const categoryData of newCategories) {
      console.log(`   📌 Creating category: "${categoryData.name}"`);
      
      const category = await prisma.category.create({
        data: {
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

      console.log(`      ✅ Category created (ID: ${category.id})`);
      console.log(`      📝 Subcategories added:`);
      
      category.subCategories.forEach((sub) => {
        console.log(`         • ${sub.name} (ID: ${sub.id})`);
        totalSubCategories++;
      });
      console.log();
    }

    // Step 3: Display summary
    const finalCategoryCount = await prisma.category.count();
    const finalSubCategoryCount = await prisma.subCategory.count();

    console.log('✨ Seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   • Total Categories: ${finalCategoryCount}`);
    console.log(`   • Total SubCategories: ${finalSubCategoryCount}`);
    console.log(`   • Average per category: ${(finalSubCategoryCount / finalCategoryCount).toFixed(1)}`);
    console.log(`   • AI Verifications deleted: ${deletedAiVerifications.count}`);
    console.log(`   • Streak Exports deleted: ${deletedStreakExports.count}`);
    console.log(`   • Streak Histories deleted: ${deletedStreakHistories.count}`);
    console.log(`   • Streaks deleted: ${deletedStreaks.count}`);

  } catch (error) {
    console.error('❌ Error during cleanup and seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
