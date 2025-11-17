import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/share/{token}:
 *   get:
 *     tags:
 *       - Export
 *     summary: View shared streak export
 *     description: Public read-only view of a shared streak export (no authentication required)
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Share token
 *     responses:
 *       200:
 *         description: Shared data retrieved successfully
 *       404:
 *         description: Invalid or expired token
 *       500:
 *         description: Internal server error
 */

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find the export record
    const streakExport = await prisma.streakExport.findUnique({
      where: { shareToken: token },
      include: {
        streak: {
          include: {
            category: true,
            subCategory: true,
          },
        },
      },
    });

    if (!streakExport) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 404 }
      );
    }

    // Get histories for the specified month
    const startDate = new Date(streakExport.year, streakExport.month - 1, 1);
    const endDate = new Date(streakExport.year, streakExport.month, 0, 23, 59, 59, 999);

    const histories = await prisma.streakHistory.findMany({
      where: {
        streakId: streakExport.streakId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        verifications: true,
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json({
      streak: {
        id: streakExport.streak.id,
        title: streakExport.streak.title,
        description: streakExport.streak.description,
        category: streakExport.streak.category,
        subCategory: streakExport.streak.subCategory,
      },
      month: streakExport.month,
      year: streakExport.year,
      histories,
      totalSessions: histories.length,
      totalDuration: histories.reduce((sum, h) => sum + (h.duration || 0), 0),
      createdAt: streakExport.createdAt,
    });
  } catch (error) {
    console.error("Get shared export error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
