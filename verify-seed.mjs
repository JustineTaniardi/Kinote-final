import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verify() {
  try {
    console.log("📊 Verifying Seed Data...\n");

    // Count categories
    const categoryCount = await prisma.category.count();
    console.log(`✓ Total Categories: ${categoryCount}`);

    // Count subcategories
    const subcategoryCount = await prisma.subCategory.count();
    console.log(`✓ Total SubCategories: ${subcategoryCount}`);

    // Get categories with subcategory count
    const categories = await prisma.category.findMany({
      include: {
        subCategories: true,
      },
      orderBy: { name: "asc" },
    });

    console.log("\n📋 Categories with SubCategories:");
    categories.forEach((cat) => {
      console.log(`  • ${cat.name}: ${cat.subCategories.length} subcategories`);
      cat.subCategories.forEach((subcat) => {
        console.log(`    - ${subcat.name}`);
      });
    });

    console.log("\n✨ Verification completed!");
  } catch (error) {
    console.error("❌ Error during verification:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
