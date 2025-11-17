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
    const studyCategory = await prisma.category.create({
      data: { name: "Study" },
    });
    const workoutCategory = await prisma.category.create({
      data: { name: "Workout" },
    });
    const readingCategory = await prisma.category.create({
      data: { name: "Reading" },
    });
    const codingCategory = await prisma.category.create({
      data: { name: "Coding" },
    });

    // ============ SUBCATEGORIES ============
    console.log("📂 Seeding SubCategories...");
    
    // Study subcategories
    await prisma.subCategory.create({
      data: { name: "Math", categoryId: studyCategory.id },
    });
    await prisma.subCategory.create({
      data: { name: "Science", categoryId: studyCategory.id },
    });
    await prisma.subCategory.create({
      data: { name: "Programming Basics", categoryId: studyCategory.id },
    });

    // Workout subcategories
    await prisma.subCategory.create({
      data: { name: "Cardio", categoryId: workoutCategory.id },
    });
    await prisma.subCategory.create({
      data: { name: "Strength Training", categoryId: workoutCategory.id },
    });
    await prisma.subCategory.create({
      data: { name: "Yoga", categoryId: workoutCategory.id },
    });

    // Reading subcategories
    await prisma.subCategory.create({
      data: { name: "Novel", categoryId: readingCategory.id },
    });
    await prisma.subCategory.create({
      data: { name: "Self-Improvement", categoryId: readingCategory.id },
    });
    await prisma.subCategory.create({
      data: { name: "Textbook", categoryId: readingCategory.id },
    });

    // Coding subcategories
    await prisma.subCategory.create({
      data: { name: "Frontend", categoryId: codingCategory.id },
    });
    await prisma.subCategory.create({
      data: { name: "Backend", categoryId: codingCategory.id },
    });
    await prisma.subCategory.create({
      data: { name: "Algorithms", categoryId: codingCategory.id },
    });

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
