import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";
import {
  generateResetToken,
  getResetPasswordEmailTemplate,
} from "@/lib/emailTemplates";

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Request password reset
 *     description: Send a password reset email to the specified email address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Password reset email sent (safe response regardless of email existence)
 *       400:
 *         description: Email is required
 *       500:
 *         description: Internal server error
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Find user by email
    let user;
    try {
      user = await prisma.user.findUnique({ where: { email } });
    } catch (dbError) {
      throw dbError;
    }

    if (!user) {
      return NextResponse.json(
        {
          message: "Email not registered. Please register first.",
          error: "Email not found",
        },
        { status: 404 }
      );
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const resetExpiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now

    // Update DB with reset token
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpiresAt: resetExpiresAt,
        },
      });
      } catch (updateError) {
      throw updateError;
    }

    // Prepare email using user name
    const emailTemplate = getResetPasswordEmailTemplate(user.name, resetToken);

    // Send reset email
    try {
      await sendEmail({
        to: email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
    } catch (emailError) {
      console.error("Email sending error in forgot-password:", emailError);
      return NextResponse.json(
        { 
          message: "Failed to send reset email. Please check email configuration.",
          error: emailError instanceof Error ? emailError.message : "Unknown error"
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Password reset link has been sent to your email. Please check your inbox and follow the link to reset your password.",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot-password error:", error);
    return NextResponse.json(
      { 
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use POST to request password reset" });
}
