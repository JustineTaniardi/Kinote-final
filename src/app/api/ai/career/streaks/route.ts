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
    const decoded = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
    return (decoded.id as number) || null;
  } catch {
    return null;
  }
}

/**
 * @swagger
 * /api/ai/career/streaks:
 *   get:
 *     tags:
 *       - AI Career Coach
 *     summary: Get user's streaks for career analysis
 *     description: Retrieve all streaks belonging to the authenticated user for career path analysis
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's streaks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   title:
 *                     type: string
 *                   category:
 *                     type: object
 *                   subCategory:
 *                     type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

export async function GET(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const streaks = await prisma.streak.findMany({
      where: { userId },
      include: {
        category: true,
        subCategory: true,
        histories: {
          select: {
            duration: true,
            description: true,
            createdAt: true,
            title: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter streaks with at least 10 history records
    const filteredStreaks = streaks.filter((streak) => streak.histories.length >= 10);

    // Add calculated stats
    const streaksWithStats = filteredStreaks.map((streak) => ({
      ...streak,
      totalSessions: streak.histories.length,
      totalDuration: streak.histories.reduce((sum, h) => sum + (h.duration || 0), 0),
      historyCount: streak.histories.length,
    }));

    return NextResponse.json(streaksWithStats);
  } catch (error) {
    console.error("Get career streaks error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
