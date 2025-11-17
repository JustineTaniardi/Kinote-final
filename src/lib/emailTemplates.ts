import crypto from "crypto";

const APP_URL = process.env.APP_URL || "http://localhost:3000";

/**
 * Generate a verification token for email confirmation
 * Returns a random 32-byte hex string
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Generate a reset password token
 * Returns a random 32-byte hex string
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Registration confirmation email template
 */
export function getRegisterEmailTemplate(
  name: string,
  email: string,
  verificationToken: string
): {
  subject: string;
  html: string;
} {
  const verificationUrl = `${APP_URL}/verify-email?token=${verificationToken}`;

  return {
    subject: "Welcome to Kinote - Verify Your Email",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Kinote</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9fafb;
            border-radius: 8px;
            padding: 32px;
            margin: 20px 0;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #1f2937;
            font-size: 24px;
            margin: 0 0 10px 0;
          }
          .content {
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            text-align: center;
          }
          .button:hover {
            background-color: #2563eb;
          }
          .footer {
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            margin-top: 30px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          .code {
            background-color: #f3f4f6;
            padding: 10px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Kinote! 🎯</h1>
            <p>Thank you for signing up</p>
          </div>

          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            
            <p>We're excited to have you join Kinote! To get started and activate your account, please verify your email address by clicking the button below:</p>

            <a href="${verificationUrl}" class="button">Verify Email Address</a>

            <p>Or copy and paste this link in your browser:</p>
            <p class="code">${verificationUrl}</p>

            <p>This verification link will expire in 24 hours. After that, you'll need to register again.</p>

            <p>If you didn't create this account, you can ignore this email.</p>
          </div>

          <div class="footer">
            <p>&copy; 2025 Kinote. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

/**
 * Reset password email template
 */
export function getResetPasswordEmailTemplate(
  name: string,
  resetToken: string
): {
  subject: string;
  html: string;
} {
  const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;

  return {
    subject: "Reset Your Kinote Password",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9fafb;
            border-radius: 8px;
            padding: 32px;
            margin: 20px 0;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #1f2937;
            font-size: 24px;
            margin: 0 0 10px 0;
          }
          .alert {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .content {
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            background-color: #ef4444;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            text-align: center;
          }
          .button:hover {
            background-color: #dc2626;
          }
          .footer {
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            margin-top: 30px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          .code {
            background-color: #f3f4f6;
            padding: 10px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>

          <div class="alert">
            <strong>⚠️ Security Notice:</strong> If you didn't request a password reset, please ignore this email or contact support immediately.
          </div>

          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            
            <p>We received a request to reset your Kinote password. Click the button below to create a new password:</p>

            <a href="${resetUrl}" class="button">Reset Password</a>

            <p>Or copy and paste this link in your browser:</p>
            <p class="code">${resetUrl}</p>

            <p><strong>Important:</strong> This password reset link will expire in 1 hour for security reasons.</p>

            <h3>Security Tips:</h3>
            <ul>
              <li>Never share your password with anyone</li>
              <li>Use a strong password with mix of upper, lower, numbers, and symbols</li>
              <li>Enable two-factor authentication if available</li>
            </ul>

            <p>If you didn't request this, you can safely ignore this email.</p>
          </div>

          <div class="footer">
            <p>&copy; 2025 Kinote. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

/**
 * Generic notification email template
 */
export function getGenericEmailTemplate(
  subject: string,
  title: string,
  content: string,
  ctaText?: string,
  ctaUrl?: string
): {
  subject: string;
  html: string;
} {
  return {
    subject,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9fafb;
            border-radius: 8px;
            padding: 32px;
            margin: 20px 0;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #1f2937;
            font-size: 24px;
            margin: 0 0 10px 0;
          }
          .content {
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            text-align: center;
          }
          .button:hover {
            background-color: #2563eb;
          }
          .footer {
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            margin-top: 30px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title}</h1>
          </div>

          <div class="content">
            ${content}
            ${
              ctaUrl && ctaText
                ? `<a href="${ctaUrl}" class="button">${ctaText}</a>`
                : ""
            }
          </div>

          <div class="footer">
            <p>&copy; 2025 Kinote. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}
