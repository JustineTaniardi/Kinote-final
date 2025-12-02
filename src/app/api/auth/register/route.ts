import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { validateEmail, validatePassword, validateName } from "@/lib/validation";
import { rateLimiter } from "@/lib/rateLimiter";
import { sendEmail } from "@/lib/mailer";
import { generateResetToken, generateVerificationCode, getVerificationEmailTemplate } from "@/lib/emailTemplates";
import { storePendingRegistration } from "@/lib/pendingRegistrationsStore";
import { storeVerificationCode } from "@/lib/verificationCodeStore";
import { isDatabaseConnectionError, getDatabaseErrorResponse } from "@/lib/databaseErrorHandler";

const JWT_SECRET = process.env.JWT_SECRET!;

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register new user
 *     description: Create a new user account and receive auth token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: securePassword123
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 token:
 *                   type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input or validation error
 *       409:
 *         description: Email already registered
 *       429:
 *         description: Too many registration attempts
 *       500:
 *         description: Internal server error
 */
export async function POST(req: Request) {
  try {
    // Get client IP for rate limiting
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Rate limit: 5 registrations per 15 minutes per IP
    if (rateLimiter.isLimited(`register:${ip}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { message: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate name
    if (!validateName(name)) {
      return NextResponse.json(
        { message: "Invalid name format" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { message: passwordValidation.error },
        { status: 400 }
      );
    }

    // Try to check if email exists
    let existing = null;
    try {
      existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        // Email already exists in database
        if (existing.emailVerifiedAt) {
          // Email is verified - cannot register
          return NextResponse.json(
            { message: "Email already registered. Please log in instead." },
            { status: 409 }
          );
        } else {
          // Email exists but not verified - allow re-registration with new code
          // Continue to send new verification code
          }
      }
    } catch (dbError) {
      console.warn("Database unavailable for duplicate check");
      // Check if it's a connection error
      if (isDatabaseConnectionError(dbError)) {
        const errorData = getDatabaseErrorResponse();
        return NextResponse.json(
          { message: errorData.message, hint: errorData.hint },
          { status: errorData.status }
        );
      }
      // Other database errors
      throw dbError;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = generateResetToken();

    // Store temporary registration data (user not yet created in DB)
    await storePendingRegistration(email, {
      name,
      email,
      password: hashedPassword,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // Send verification email with 6-digit code
    try {
      const verificationCode = generateVerificationCode();
      
      // Store verification code in memory
      storeVerificationCode(email, verificationCode, 10); // 10 minutes
      
      const emailTemplate = getVerificationEmailTemplate(name, verificationCode);
      
      await sendEmail({
        to: email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
      
      return NextResponse.json(
        {
          message: "Registration successful. Please check your email to verify your account.",
          email,
          verificationToken,
          verificationCode, // For development/testing only - remove in production
          expiresIn: "10 minutes",
        },
        { status: 201 }
      );
    } catch (emailError) {
      return NextResponse.json(
        { message: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Registration failed. Please try again later." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use POST to register" });
}
