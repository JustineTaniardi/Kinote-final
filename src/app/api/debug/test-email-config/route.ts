import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailer";
import { getVerificationEmailTemplate } from "@/lib/emailTemplates";

/**
 * Test email configuration
 * Endpoint: POST /api/debug/test-email-config
 * 
 * Request body:
 * {
 *   "testEmail": "your-test-email@example.com"
 * }
 */
export async function POST(req: Request) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { message: "Test endpoint not available in production" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { testEmail } = body;

    if (!testEmail) {
      return NextResponse.json(
        { message: "testEmail is required" },
        { status: 400 }
      );
    }

    console.log("\n🧪 Starting Email Configuration Test...\n");

    // Check environment variables
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;
    const emailHost = process.env.EMAIL_HOST;
    const emailPort = process.env.EMAIL_PORT;

    console.log("📋 Environment Variables:");
    console.log(`   EMAIL_HOST: ${emailHost}`);
    console.log(`   EMAIL_PORT: ${emailPort}`);
    console.log(`   EMAIL_USER: ${emailUser ? "✅ Set" : "❌ NOT SET"}`);
    console.log(`   EMAIL_PASSWORD: ${emailPassword ? `✅ Set (${emailPassword.length} chars)` : "❌ NOT SET"}`);

    if (!emailUser || !emailPassword) {
      return NextResponse.json(
        {
          message: "Email configuration incomplete",
          details: {
            EMAIL_USER: emailUser ? "✅ Set" : "❌ NOT SET",
            EMAIL_PASSWORD: emailPassword ? "✅ Set" : "❌ NOT SET",
            EMAIL_HOST: emailHost,
            EMAIL_PORT: emailPort,
          },
          action: "Update .env file with EMAIL_USER and EMAIL_PASSWORD"
        },
        { status: 400 }
      );
    }

    // Prepare test email
    const testTemplate = getVerificationEmailTemplate("Test User", "123456");

    console.log(`\n📧 Sending test email to: ${testEmail}`);

    // Send test email
    await sendEmail({
      to: testEmail,
      subject: testTemplate.subject,
      html: testTemplate.html,
    });

    console.log("✅ Test email sent successfully!\n");

    return NextResponse.json(
      {
        message: "Test email sent successfully!",
        details: {
          sentTo: testEmail,
          subject: testTemplate.subject,
          timestamp: new Date().toISOString(),
        },
        action: "Check your email inbox (or spam folder) for the test email",
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("\n❌ Test email failed!\n");

    return NextResponse.json(
      {
        message: "Test email failed",
        error: error instanceof Error ? error.message : "Unknown error",
        troubleshooting: {
          "Authentication Error": "Check EMAIL_USER and EMAIL_PASSWORD in .env",
          "Connection Error": "Check firewall, EMAIL_HOST, and EMAIL_PORT",
          "Server Error": "Restart dev server after updating .env",
        }
      },
      { status: 500 }
    );
  }
}
