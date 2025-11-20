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

    // Create 10 new categories with 5 subcategories each
    const categories = [
      {
        name: "Work",
        subcategories: ["Meetings", "Projects", "Presentations", "Reports", "Deadlines"],
      },
      {
        name: "Learning",
        subcategories: ["Online Courses", "Reading", "Practice", "Tutorials", "Certification"],
      },
      {
        name: "Personal",
        subcategories: ["Goals", "Habits", "Reflection", "Planning", "Journal"],
      },
      {
        name: "Health",
        subcategories: ["Exercise", "Nutrition", "Sleep", "Mental Health", "Check-ups"],
      },
      {
        name: "Entertainment",
        subcategories: ["Movies", "Gaming", "Music", "Reading", "Hobbies"],
      },
      {
        name: "Finance",
        subcategories: ["Budgeting", "Investing", "Savings", "Bills", "Planning"],
      },
      {
        name: "Household",
        subcategories: ["Cleaning", "Repairs", "Cooking", "Shopping", "Organization"],
      },
      {
        name: "Social",
        subcategories: ["Friends", "Family", "Events", "Networking", "Community"],
      },
      {
        name: "Travel",
        subcategories: ["Planning", "Booking", "Packing", "Itinerary", "Documentation"],
      },
      {
        name: "Creative",
        subcategories: ["Writing", "Design", "Art", "Music", "Photography"],
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
