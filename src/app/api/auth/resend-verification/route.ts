import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";
import {
  generateVerificationToken,
  getRegisterEmailTemplate,
} from "@/lib/emailTemplates";

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Resend email verification
 *     description: Resend verification email to user (for when code expires or email not received)
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
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Verification email sent successfully
 *       400:
 *         description: Email is required
 *       404:
 *         description: User not found
 *       409:
 *         description: Email already verified
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

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // ✅ Check if already verified
    if (user.emailVerifiedAt) {
      return NextResponse.json(
        { message: "Email already verified. You can login now." },
        { status: 409 }
      );
    }

    // Generate new verification token
    const newToken = generateVerificationToken();

    // Update user with new token
    await prisma.user.update({
      where: { email },
      data: {
        emailVerificationToken: newToken,
      },
    });

    // Send verification email
    const emailTemplate = getRegisterEmailTemplate(
      user.name,
      email,
      newToken
    );

    await sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    }).catch((error) => {
      console.error(`Failed to send verification email to ${email}:`, error);
    });

    return NextResponse.json(
      {
        message: "Verification email sent successfully. Check your inbox.",
        code: newToken, // Return code for testing/frontend display
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to resend verification email",
  });
}
