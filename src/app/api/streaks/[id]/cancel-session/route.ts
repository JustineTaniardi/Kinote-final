import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET!;

function getUserIdFromRequest(req: Request): number | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    return decoded.id;
  } catch {
    return null;
  }
}

/**
 * @swagger
 * /api/streaks/{id}/cancel-session:
 *   delete:
 *     tags:
 *       - Streak
 *     summary: Cancel a pending session
 *     description: Delete a temporary session history entry (without description and photo)
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
 *                 description: The ID of the history entry to delete
 *     responses:
 *       200:
 *         description: Session cancelled successfully
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
export async function DELETE(
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
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { historyId } = body;

    if (!historyId) {
      return NextResponse.json(
        { message: "historyId is required" },
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

    // Delete the temporary session entry
    await prisma.streakHistory.delete({
      where: { id: historyId },
    });

    return NextResponse.json({
      message: "Session cancelled successfully",
      deletedHistoryId: historyId,
    });
  } catch (error) {
    console.error("Cancel session error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: String(error) },
      { status: 500 }
    );
  }
}
