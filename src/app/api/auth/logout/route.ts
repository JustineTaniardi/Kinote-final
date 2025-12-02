import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Logout is primarily client-side (clearing localStorage)
    // This endpoint can be used for server-side cleanup if needed in the future
    // (e.g., blacklisting tokens, clearing sessions, etc.)

    return NextResponse.json(
      {
        success: true,
        message: "Logged out successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Logout failed",
      },
      { status: 500 }
    );
  }
}
