import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🌱 Starting category and subcategory update...");

    // Delete existing subcategories first (due to foreign key constraint)
    console.log("🧹 Deleting existing subcategories...");
    await prisma.subCategory.deleteMany({});
    console.log("  ✓ Subcategories deleted");

    // Delete existing categories
    console.log("🧹 Deleting existing categories...");
    await prisma.category.deleteMany({});
    console.log("  ✓ Categories deleted");

    // Create new categories with subcategories
    const categories = [
      {
        name: "Study",
        subcategories: ["Reading", "Reviewing", "Solving", "Summarizing", "Memorizing"],
      },
      {
        name: "Code",
        subcategories: ["Debugging", "Refactoring", "Implementing", "Algorithm", "Learning"],
      },
      {
        name: "Workout",
        subcategories: ["Strength", "Cardio", "HIIT", "Core", "Yoga"],
      },
      {
        name: "Read",
        subcategories: ["Book", "Research", "Article", "Notes", "Analysis"],
      },
      {
        name: "Design",
        subcategories: ["UI Sketch", "Illustration", "Editing", "Layout", "Concepting"],
      },
      {
        name: "Learn",
        subcategories: ["Vocabulary", "Listening", "Practice", "Quiz", "Lecture"],
      },
      {
        name: "Write",
        subcategories: ["Drafting", "Journaling", "Notes", "Practice", "Ideas"],
      },
      {
        name: "Music",
        subcategories: ["Instrument", "Ear Training", "Composition", "Practice", "Repetition"],
      },
      {
        name: "Game",
        subcategories: ["Strategy", "Training", "Analysis", "Ranked", "Practice"],
      },
      {
        name: "Meditate",
        subcategories: ["Breathing", "Mindfulness", "Reflection", "Focus", "Calm"],
      },
    ];

    console.log("📚 Creating categories and subcategories...");

    for (const categoryData of categories) {
      const category = await prisma.category.create({
        data: {
          name: categoryData.name,
        },
      });

      console.log(`  ✓ Created category: ${category.name}`);

      for (const subcategoryName of categoryData.subcategories) {
        await prisma.subCategory.create({
          data: {
            name: subcategoryName,
            categoryId: category.id,
          },
        });
      }

      console.log(`    ✓ Created 5 subcategories for ${category.name}`);
    }

    console.log("✨ Category and subcategory update completed successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
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
