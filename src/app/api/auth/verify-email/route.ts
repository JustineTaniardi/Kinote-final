import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getPendingRegistration, removePendingRegistration } from "@/lib/pendingRegistrationsStore";
import { verifyCode, removeVerificationCode } from "@/lib/verificationCodeStore";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

export async function POST(req: NextRequest) {
  try {
    const { email, verificationCode } = await req.json();

    if (!email || !verificationCode) {
      return NextResponse.json(
        { error: "Email and verification code are required" },
        { status: 400 }
      );
    }

    // Get pending registration
    const pending = getPendingRegistration(email);
    if (!pending) {
      return NextResponse.json(
        { error: "No pending registration found. Please register first." },
        { status: 404 }
      );
    }

    // Check if token expired
    if (pending.expiresAt < new Date()) {
      removePendingRegistration(email);
      return NextResponse.json(
        { error: "Verification code has expired. Please register again." },
        { status: 401 }
      );
    }

    // Verify the code
    if (!verifyCode(email, verificationCode)) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 401 }
      );
    }

    let userId: number | string;

    // Try to create user in database
    try {
      const user = await prisma.user.create({
        data: {
          name: pending.name,
          email: pending.email,
          password: pending.password,
          emailVerifiedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      userId = user.id;
    } catch (dbError: any) {
      // Check if email already exists
      if (dbError.code === "P2002") {
        // Email already exists, update the verification status
        try {
          const updatedUser = await prisma.user.update({
            where: { email: pending.email },
            data: { emailVerifiedAt: new Date() },
            select: {
              id: true,
              name: true,
              email: true,
            },
          });
          userId = updatedUser.id;
          } catch (updateError) {
          removePendingRegistration(email);
          return NextResponse.json(
            { error: "Failed to verify email" },
            { status: 500 }
          );
        }
      } else {
        // Database error - throw it
        throw dbError;
      }
    }

    // Remove from pending registrations
    removePendingRegistration(email);
    
    // Remove verification code from store
    removeVerificationCode(email);

    // Generate JWT token
    const jwtToken = jwt.sign(
      {
        userId,
        email: pending.email,
        name: pending.name,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json(
      {
        message: "Email verified successfully. You can now log in.",
        token: jwtToken,
        user: {
          id: userId,
          name: pending.name,
          email: pending.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Email verification failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use POST to verify email" });
}
