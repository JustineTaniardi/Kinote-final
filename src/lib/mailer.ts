/**
 * Email sending service using Gmail SMTP
 * Sends emails directly from kinotecompany@gmail.com to any recipient
 */

import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (transporter) {
    return transporter;
  }

  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com";
  const emailPort = parseInt(process.env.EMAIL_PORT || "587");

  if (!emailUser || !emailPassword) {
    throw new Error("EMAIL_USER and EMAIL_PASSWORD must be configured in .env.local");
  }

  transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: false, // TLS, not SSL (false for port 587)
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });

  return transporter;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const { to, subject, html } = options;

  try {
    const emailFrom = process.env.EMAIL_FROM || "kinotecompany@gmail.com";
    const transporter = getTransporter();

    console.log(`📧 Sending email to: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   From: ${emailFrom}`);

    // Extract reset link from HTML if available (for logging/debugging)
    const resetLinkMatch = html.match(/href="([^"]*reset-password[^"]*)"/);
    if (resetLinkMatch) {
      console.log(`   Reset Link: ${resetLinkMatch[1]}`);
    }

    const info = await transporter.sendMail({
      from: emailFrom,
      to: to,
      subject: subject,
      html: html,
    });

    console.log(`✅ Email sent successfully!`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   To: ${to}`);

  } catch (error) {
    console.error(`❌ Email sending failed for ${to}`);

    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`);
      
      // Check for authentication errors
      if (error.message.includes("Invalid login") || error.message.includes("Unauthorized")) {
        console.error(`\n   ⚠️  Gmail authentication failed!`);
        console.error(`   Please verify your Gmail setup:`);
        console.error(`      1. 2-Factor Authentication is enabled`);
        console.error(`      2. App password is generated at: https://myaccount.google.com/apppasswords`);
        console.error(`      3. App password in .env has NO SPACES`);
        console.error(`      4. Dev server has been restarted after .env changes\n`);
        
        // In development mode, extract and log the reset link for manual testing
        if (process.env.NODE_ENV === "development") {
          const resetLinkMatch = html.match(/href="([^"]*reset-password[^"]*)"/);
          if (resetLinkMatch) {
            console.log(`\n   💡 Development Mode: Reset link extracted from email template:`);
            console.log(`   ${resetLinkMatch[1]}\n`);
          }
        }
      }
    } else {
      console.error(`   Error: ${JSON.stringify(error)}`);
    }

    // Always throw error to proper error handling in API routes
    throw error;
  }
}

export async function testEmailConnection(): Promise<boolean> {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    console.log("✅ Email connection verified successfully");
    return true;
  } catch (error) {
    console.error("❌ Email connection test failed:", error);
    return false;
  }
}
