import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { validateEmail } from "@/lib/validation";
import { rateLimiter } from "@/lib/rateLimiter";
import { isDatabaseConnectionError, getDatabaseErrorResponse } from "@/lib/databaseErrorHandler";

const JWT_SECRET = process.env.JWT_SECRET!;

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login user
 *     description: Authenticate user with email and password, returns JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: securePassword123
 *     responses:
 *       200:
 *         description: Login successful
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
 *       400:
 *         description: Missing email or password
 *       401:
 *         description: Invalid email or password
 *       429:
 *         description: Too many login attempts, please try again later
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

    // Rate limit: 10 login attempts per 15 minutes per IP
    if (rateLimiter.isLimited(`login:${ip}`, 10, 15 * 60 * 1000)) {
      return NextResponse.json(
        {
          message: "Too many login attempts. Please try again later.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { message: "Email is not registered" },
        { status: 401 }
      );
    }

    // Find user by email
    let user;
    let isDevModeUser = false;
    try {
      user = await prisma.user.findUnique({ where: { email } });
    } catch (dbError) {
      
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

    if (!user) {
      return NextResponse.json(
        { message: "Email is not registered" },
        { status: 401 }
      );
    }

    // Check if email is verified
    if (!isDevModeUser && !user.emailVerifiedAt) {
      return NextResponse.json(
        {
          message: "Email not verified. Please check your email for the verification code.",
          email: user.email,
        },
        { status: 403 }
      );
    }

    // Verify password
    let match;
    if (isDevModeUser) {
      // In dev mode with mock user, just compare plain text passwords
      match = password === user.password;
    } else {
      // Normal mode - use bcrypt comparison
      try {
        match = await bcrypt.compare(password, user.password);
      } catch (bcryptError) {
        throw bcryptError;
      }
    }

    if (!match) {
      return NextResponse.json(
        { message: "Incorrect password" },
        { status: 401 }
      );
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        token,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use POST to login" });
}
