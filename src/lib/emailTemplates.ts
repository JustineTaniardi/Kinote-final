/**
 * Email templates for password reset and verification
 */

import crypto from "crypto";

interface EmailTemplate {
  subject: string;
  html: string;
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function generateVerificationCode(): string {
  // Generate 6-digit random code
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getResetPasswordEmailTemplate(
  userName: string,
  resetToken: string
): EmailTemplate {
  const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;
  
  return {
    subject: "Reset Your Password - Kinote",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f5f5f5;
              margin: 0;
              padding: 0;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .email-header {
              background: linear-gradient(135deg, #0f1a31 0%, #1a2847 100%);
              color: #ffffff;
              padding: 40px 30px;
              text-align: center;
            }
            .email-header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .email-body {
              padding: 40px 30px;
            }
            .email-body h2 {
              color: #0f1a31;
              font-size: 20px;
              margin: 0 0 20px 0;
            }
            .email-body p {
              margin: 0 0 15px 0;
              font-size: 14px;
              color: #555;
            }
            .reset-button {
              display: inline-block;
              background-color: #ffffff;
              color: #0f1a31;
              padding: 14px 32px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              font-size: 14px;
              margin: 30px 0;
              border: 2px solid #ffffff;
              transition: all 0.3s ease;
            }
            .reset-button:hover {
              background-color: #f5f5f5;
              color: #0f1a31;
            }
            .email-footer {
              background-color: #f9f9f9;
              padding: 20px 30px;
              text-align: center;
              border-top: 1px solid #e0e0e0;
              font-size: 12px;
              color: #999;
            }
            .warning-box {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px 20px;
              margin: 20px 0;
              border-radius: 4px;
              font-size: 13px;
              color: #856404;
            }
            .security-info {
              background-color: #e7f3ff;
              border-left: 4px solid #007bff;
              padding: 15px 20px;
              margin: 20px 0;
              border-radius: 4px;
              font-size: 13px;
              color: #004085;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <!-- Header -->
            <div class="email-header">
              <h1>🔐 Reset Your Password</h1>
            </div>

            <!-- Body -->
            <div class="email-body">
              <h2>Hello ${userName},</h2>
              
              <p>We received a request to reset your Kinote account password. If you didn't make this request, you can ignore this email and your password will remain unchanged.</p>

              <p style="text-align: center; margin-top: 30px;">
                <a href="${resetLink}" class="reset-button">Reset Password</a>
              </p>

              <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
                Or copy and paste this link in your browser:<br>
                <span style="word-break: break-all; color: #666;">${resetLink}</span>
              </p>

              <div class="security-info">
                <strong>⏱️ Important:</strong> This password reset link will expire in 24 hours for security reasons. If you need another reset link after that, please request a new one.
              </div>

              <div class="warning-box">
                <strong>⚠️ Security Notice:</strong> Never share this link with anyone. Kinote staff will never ask for your password reset link via email or any other means.
              </div>
            </div>

            <!-- Footer -->
            <div class="email-footer">
              <p style="margin: 0;">© 2024 Kinote. All rights reserved.</p>
              <p style="margin: 5px 0 0 0;">If you have questions, contact our support team.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

export function getVerificationEmailTemplate(
  userName: string,
  verificationCode: string
): EmailTemplate {
  return {
    subject: "Verify Your Email - Kinote",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f5f5f5;
              margin: 0;
              padding: 0;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .email-header {
              background: linear-gradient(135deg, #0f1a31 0%, #1a2847 100%);
              color: #ffffff;
              padding: 40px 30px;
              text-align: center;
            }
            .email-body {
              padding: 30px;
            }
            .verification-code {
              background-color: #f0f0f0;
              border: 2px solid #0f1a31;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              color: #0f1a31;
              font-family: 'Courier New', monospace;
            }
            .footer {
              background-color: #f5f5f5;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h1>Kinote</h1>
            </div>
            <div class="email-body">
              <h2>Verify Your Email</h2>
              <p>Hi ${userName},</p>
              <p>Thank you for signing up with Kinote! To complete your registration, please verify your email address using the code below:</p>
              <div class="verification-code">${verificationCode}</div>
              <p>This code will expire in 10 minutes. If you didn't create an account, please ignore this email.</p>
              <p>Best regards,<br>Kinote Team</p>
            </div>
            <div class="footer">
              <p>© 2025 Kinote. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}
