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
 * /api/streaks/{id}/submit:
 *   post:
 *     tags:
 *       - Streak
 *     summary: Submit session details
 *     description: Update a session with description and photo URL
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
 *               - historyId
 *             properties:
 *               historyId:
 *                 type: number
 *               description:
 *                 type: string
 *               photoUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Session submitted successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Session not found
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
    const { historyId, description, photoUrl } = body;

    if (!historyId) {
      return NextResponse.json(
        { message: "historyId is required" },
        { status: 400 }
      );
    }

    // Validate that description and photoUrl are required
    if (!description || description.trim() === "") {
      return NextResponse.json(
        { message: "Description is required" },
        { status: 400 }
      );
    }

    if (!photoUrl || photoUrl.trim() === "") {
      return NextResponse.json(
        { message: "Photo URL is required" },
        { status: 400 }
      );
    }

    const history = await prisma.streakHistory.findUnique({
      where: { id: historyId },
    });

    if (!history || history.streakId !== streakId) {
      return NextResponse.json(
        { message: "Session not found" },
        { status: 404 }
      );
    }

    const updatedHistory = await prisma.streakHistory.update({
      where: { id: historyId },
      data: {
        description: description.trim(),
        photoUrl: photoUrl.trim(),
      },
    });

    return NextResponse.json(updatedHistory);
  } catch (error) {
    console.error("Submit streak error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
