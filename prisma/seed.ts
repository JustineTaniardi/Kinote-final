import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🌱 Starting database seed...");

    // ============ CLEANUP: DELETE EXISTING REFERENCE DATA ============
    console.log("🧹 Cleaning existing reference data...");
    
    // Delete in dependency order (reverse of creation)
    // First delete dependent records
    await prisma.aiVerification.deleteMany({});
    console.log("  ✓ Cleared AiVerification");
    
    await prisma.streakExport.deleteMany({});
    console.log("  ✓ Cleared StreakExport");
    
    await prisma.streakHistory.deleteMany({});
    console.log("  ✓ Cleared StreakHistory");
    
    // Then delete streaks (depends on categories)
    await prisma.streak.deleteMany({});
    console.log("  ✓ Cleared Streak");
    
    // Then delete reference data
    await prisma.subCategory.deleteMany({});
    console.log("  ✓ Cleared SubCategory");
    
    await prisma.category.deleteMany({});
    console.log("  ✓ Cleared Category");
    
    await prisma.taskDay.deleteMany({});
    console.log("  ✓ Cleared TaskDay");
    
    await prisma.day.deleteMany({});
    console.log("  ✓ Cleared Day");
    
    await prisma.difficulty.deleteMany({});
    console.log("  ✓ Cleared Difficulty");
    
    await prisma.status.deleteMany({});
    console.log("  ✓ Cleared Status");

    // ============ CATEGORIES ============
    console.log("📚 Seeding Categories...");
    const categoriesData = [
      { name: "Study", subCategories: ["Math", "Science", "Programming Basics", "History", "Literature"] },
      { name: "Workout", subCategories: ["Cardio", "Strength Training", "Yoga", "Pilates", "Stretching"] },
      { name: "Reading", subCategories: ["Novel", "Self-Improvement", "Textbook", "Articles", "Comics"] },
      { name: "Coding", subCategories: ["Frontend", "Backend", "Algorithms", "Database", "DevOps"] },
      { name: "Work", subCategories: ["Projects", "Meetings", "Documentation", "Code Review", "Planning"] },
      { name: "Creative", subCategories: ["Drawing", "Music", "Writing", "Photography", "Design"] },
      { name: "Health", subCategories: ["Nutrition", "Mental Wellness", "Sleep", "Meditation", "Gym"] },
      { name: "Entertainment", subCategories: ["Movies", "Gaming", "TV Shows", "Podcasts", "Streaming"] },
      { name: "Learning", subCategories: ["Online Courses", "Languages", "Certifications", "Webinars", "Tutorials"] },
      { name: "Personal", subCategories: ["Goals", "Habits", "Hobbies", "Travel", "Social"] },
    ];

    const categories = [];
    for (const catData of categoriesData) {
      const category = await prisma.category.create({
        data: { name: catData.name },
      });
      categories.push(category);
    }

    // ============ SUBCATEGORIES ============
    console.log("📂 Seeding SubCategories...");
    
    for (let i = 0; i < categoriesData.length; i++) {
      for (const subCatName of categoriesData[i].subCategories) {
        await prisma.subCategory.create({
          data: { name: subCatName, categoryId: categories[i].id },
        });
      }
    }

    // ============ DAYS ============
    console.log("📅 Seeding Days...");
    await prisma.day.create({ data: { name: "Monday" } });
    await prisma.day.create({ data: { name: "Tuesday" } });
    await prisma.day.create({ data: { name: "Wednesday" } });
    await prisma.day.create({ data: { name: "Thursday" } });
    await prisma.day.create({ data: { name: "Friday" } });
    await prisma.day.create({ data: { name: "Saturday" } });
    await prisma.day.create({ data: { name: "Sunday" } });

    // ============ DIFFICULTY ============
    console.log("⚡ Seeding Difficulty Levels...");
    await prisma.difficulty.create({ data: { name: "Easy" } });
    await prisma.difficulty.create({ data: { name: "Medium" } });
    await prisma.difficulty.create({ data: { name: "Hard" } });

    // ============ STATUS ============
    console.log("✅ Seeding Status...");
    await prisma.status.create({ data: { name: "pending" } });
    await prisma.status.create({ data: { name: "in_progress" } });
    await prisma.status.create({ data: { name: "completed" } });

    console.log("✨ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding error:", error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
