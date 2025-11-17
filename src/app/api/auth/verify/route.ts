import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET!;

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Verify email address via link
 *     description: Verify user email address using token from email link
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Token is required
 *       401:
 *         description: Token expired or invalid
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *   post:
 *     tags:
 *       - Auth
 *     summary: Verify email with code
 *     description: Verify user email using verification code (for in-app verification)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               code:
 *                 type: string
 *                 example: abc123
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired code
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { message: "Token is required" },
        { status: 400 }
      );
    }

    // Find user by email verification token
    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email verification link" },
        { status: 401 }
      );
    }

    // Check if email is already verified
    if (user.emailVerifiedAt) {
      return NextResponse.json(
        {
          message: "Email already verified.",
          id: user.id,
          email: user.email,
          name: user.name,
        },
        { status: 200 }
      );
    }

    // Mark email as verified
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        emailVerificationToken: null,
      },
    });

    return NextResponse.json(
      {
        message: "Email verified successfully. You can now login.",
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { message: "Email and verification code are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // ✅ Check if token matches (code = token)
    if (user.emailVerificationToken !== code) {
      return NextResponse.json(
        { message: "Invalid verification code" },
        { status: 400 }
      );
    }

    // ✅ Mark email as verified
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        emailVerifiedAt: new Date(),
        emailVerificationToken: null, // Clear token after verification
      },
    });

    // Generate JWT token for login
    const jwtToken = jwt.sign(
      { id: updatedUser.id, email: updatedUser.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return NextResponse.json(
      {
        message: "Email verified successfully",
        token: jwtToken,
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
