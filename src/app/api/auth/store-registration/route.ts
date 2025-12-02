import { NextRequest, NextResponse } from "next/server";
import {
  storePendingRegistration,
  getPendingRegistration,
  removePendingRegistration,
} from "@/lib/pendingRegistrationsStore";

export async function POST(req: NextRequest) {
  try {
    const { email, name, password, token } = await req.json();

    if (!email || !name || !password || !token) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    storePendingRegistration(email, {
      name,
      email,
      password,
      token,
      expiresAt,
    });

    return NextResponse.json(
      { message: "Registration data stored" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to store registration data" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use POST to store registration data" });
}
