#!/usr/bin/env node

/**
 * Test Email Configuration
 * 
 * This script verifies that your email configuration is correct
 * and that emails can be sent successfully.
 * 
 * Usage:
 *   node test-email-config.mjs
 */

import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env" });

console.log("🧪 Testing Email Configuration...\n");

// Check if all required variables are set
const requiredVars = [
  "EMAIL_USER",
  "EMAIL_PASSWORD",
  "EMAIL_HOST",
  "EMAIL_PORT",
];

console.log("📋 Checking Environment Variables:");
let allVarsSet = true;

requiredVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    // Mask sensitive values
    const masked =
      varName === "EMAIL_PASSWORD" ? value.substring(0, 4) + "****" : value;
    console.log(`  ✅ ${varName} = ${masked}`);
  } else {
    console.log(`  ❌ ${varName} is NOT set`);
    allVarsSet = false;
  }
});

if (!allVarsSet) {
  console.error(
    "\n❌ Some required variables are missing! Please check your .env file.\n"
  );
  process.exit(1);
}

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false, // TLS, not SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Test SMTP connection
console.log("\n🔌 Testing SMTP Connection...");

transporter
  .verify()
  .then(() => {
    console.log("✅ SMTP connection verified successfully!\n");

    // If connection is successful, show what to do next
    console.log("📧 Email Configuration is Ready!\n");
    console.log("Next steps:");
    console.log("1. Run the application: npm run dev");
    console.log("2. Register with your email: /register");
    console.log("3. Check your email inbox for verification code");
    console.log("4. Enter the 6-digit code to verify");
    console.log("5. Login to your account\n");

    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ SMTP connection failed!\n");
    console.error("Error:", error.message, "\n");

    // Provide helpful error messages
    if (
      error.message.includes("Invalid login") ||
      error.message.includes("Unauthorized")
    ) {
      console.error(
        "⚠️  Gmail Authentication Failed!\n" +
          "Please verify:\n" +
          "1. 2-Factor Authentication is enabled: https://myaccount.google.com/security\n" +
          "2. App password is generated: https://myaccount.google.com/apppasswords\n" +
          "3. EMAIL_PASSWORD in .env is the 16-character app password (not your Google password)\n" +
          "4. Dev server has been restarted after changing .env\n"
      );
    } else if (error.message.includes("connect")) {
      console.error(
        "⚠️  Connection Error!\n" +
          "Please verify:\n" +
          "1. EMAIL_HOST is correct (usually smtp.gmail.com)\n" +
          "2. EMAIL_PORT is correct (usually 587)\n" +
          "3. Your internet connection is working\n"
      );
    }

    console.error(
      "\n📖 For help, see EMAIL_VERIFICATION_FIX.md in the project root\n"
    );
    process.exit(1);
  });
