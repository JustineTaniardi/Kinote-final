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
 * /api/streaks/{id}/end:
 *   post:
 *     tags:
 *       - Streak
 *     summary: End a streak session
 *     description: Finish an active session and calculate duration in minutes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - confirm
 *             properties:
 *               confirm:
 *                 type: string
 *                 enum: ["END"]
 *     responses:
 *       200:
 *         description: Session ended successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 historyId:
 *                   type: number
 *                 duration:
 *                   type: number
 *                   description: Duration in minutes
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Streak not found or no active session
 *       500:
 *         description: Internal server error
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const streakId = parseInt(id);
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

    const body = await req.json();
    if (body.confirm !== "END") {
      return NextResponse.json(
        { message: "Invalid confirm value, must be 'END'" },
        { status: 400 }
      );
    }

    // Find the latest history record without endTime (active session)
    const lastHistory = await prisma.streakHistory.findFirst({
      where: {
        streakId,
        endTime: {
          equals: new Date(0), // Placeholder endTime indicates active session
        },
      },
      orderBy: { startTime: "desc" },
    });

    if (!lastHistory) {
      return NextResponse.json(
        { message: "No active session found" },
        { status: 404 }
      );
    }

    const now = new Date();
    const durationMs = now.getTime() - lastHistory.startTime.getTime();
    const durationMinutes = Math.round(durationMs / 60000);

    const updatedHistory = await prisma.streakHistory.update({
      where: { id: lastHistory.id },
      data: {
        endTime: now,
        duration: durationMinutes,
      },
    });

    return NextResponse.json({
      historyId: updatedHistory.id,
      duration: durationMinutes,
    });
  } catch (error) {
    console.error("End streak error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
