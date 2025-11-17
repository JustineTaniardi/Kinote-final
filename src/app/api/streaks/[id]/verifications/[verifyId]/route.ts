import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET!;

// Helper to get userId from JWT
function getUserIdFromRequest(req: Request): number | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  try {
    const token = authHeader.substring(7);
    const decoded: any = jwt.verify(token, JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
}

/**
 * @swagger
 * /api/streaks/{id}/verifications/{verifyId}:
 *   get:
 *     tags:
 *       - AI Verification
 *     summary: Get single verification
 *     description: Retrieve details of a specific verification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Streak ID
 *       - in: path
 *         name: verifyId
 *         required: true
 *         schema:
 *           type: number
 *         description: Verification ID
 *     responses:
 *       200:
 *         description: Verification details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not streak owner
 *       404:
 *         description: Verification or streak not found
 *       500:
 *         description: Internal server error
 */

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; verifyId: string }> }
) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, verifyId } = await params;
    const streakId = parseInt(id);
    const verifyIdNum = parseInt(verifyId);

    // Verify streak exists and belongs to user
    const streak = await prisma.streak.findUnique({
      where: { id: streakId },
    });

    if (!streak) {
      return NextResponse.json(
        { message: "Streak not found" },
        { status: 404 }
      );
    }

    if (streak.userId !== userId) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    // Get verification
    const verification = await prisma.aiVerification.findUnique({
      where: { id: verifyIdNum },
      include: {
        history: true,
      },
    });

    if (!verification || verification.streakId !== streakId) {
      return NextResponse.json(
        { message: "Verification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(verification);
  } catch (error) {
    console.error("Get verification error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
