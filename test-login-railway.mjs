import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient({
  log: ["error"],
  errorFormat: "pretty",
});

async function testLogin() {
  try {
    console.log("🔍 Testing login with test user...");
    console.log("📧 Email: test@example.com");
    console.log("🔑 Password: password123");
    console.log("");

    console.log("⏳ Connecting to Railway database...");
    const user = await prisma.user.findUnique({
      where: { email: "test@example.com" },
    });

    if (!user) {
      console.log("❌ User not found!");
      process.exit(1);
    }

    console.log("✅ User found!");
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Email Verified: ${user.emailVerifiedAt ? "YES" : "NO"}`);

    console.log("");
    console.log("🔐 Verifying password...");
    const match = await bcrypt.compare("password123", user.password);

    if (!match) {
      console.log("❌ Password does not match!");
      process.exit(1);
    }

    console.log("✅ Password matches!");

    console.log("");
    console.log("🎫 Generating JWT token...");
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || "test", {
      expiresIn: "7d",
    });

    console.log("✅ Token generated!");
    console.log(`   Token (first 50 chars): ${token.substring(0, 50)}...`);

    console.log("");
    console.log("🎉 LOGIN TEST SUCCESSFUL!");
    console.log("");
    console.log("Response that would be returned:");
    console.log(JSON.stringify({ id: user.id, name: user.name, email: user.email, token }, null, 2));
  } catch (error) {
    console.error("❌ ERROR:", error.message);
    if (error.code === "ENOTFOUND") {
      console.error("   Cannot reach database server - check Railway connection");
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
