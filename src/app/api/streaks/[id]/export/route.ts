import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

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
 * /api/streaks/{id}/export:
 *   get:
 *     tags:
 *       - Export
 *     summary: Get streak export data
 *     description: Get export data for a specific month
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Streak ID
 *       - in: query
 *         name: month
 *         schema:
 *           type: number
 *         description: Month (1-12)
 *       - in: query
 *         name: year
 *         schema:
 *           type: number
 *         description: Year (YYYY)
 *     responses:
 *       200:
 *         description: Export data retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not streak owner
 *       404:
 *         description: Streak not found
 *       500:
 *         description: Internal server error
 *   post:
 *     tags:
 *       - Export
 *     summary: Generate shareable export token
 *     description: Create a shareable token for viewing streak data
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Streak ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - month
 *               - year
 *             properties:
 *               month:
 *                 type: number
 *                 description: Month (1-12)
 *               year:
 *                 type: number
 *                 description: Year (YYYY)
 *     responses:
 *       201:
 *         description: Export token created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 shareUrl:
 *                   type: string
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not streak owner
 *       404:
 *         description: Streak not found
 *       500:
 *         description: Internal server error
 */

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const streakId = parseInt(id);
    const url = new URL(req.url);
    const month = url.searchParams.get("month");
    const year = url.searchParams.get("year");

    if (!month || !year) {
      return NextResponse.json(
        { message: "month and year query parameters are required" },
        { status: 400 }
      );
    }

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

    // Get histories for the specified month
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);

    const histories = await prisma.streakHistory.findMany({
      where: {
        streakId,
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
      streak,
      month: monthNum,
      year: yearNum,
      histories,
      totalSessions: histories.length,
      totalDuration: histories.reduce((sum, h) => sum + (h.duration || 0), 0),
    });
  } catch (error) {
    console.error("Get export error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const streakId = parseInt(id);
    const body = await req.json();
    const { month, year } = body;

    if (!month || !year) {
      return NextResponse.json(
        { message: "month and year are required" },
        { status: 400 }
      );
    }

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

    // Generate unique share token
    const shareToken = crypto.randomBytes(32).toString("hex");

    // Create export record
    const streakExport = await prisma.streakExport.create({
      data: {
        streakId,
        month: parseInt(month.toString()),
        year: parseInt(year.toString()),
        shareToken,
      },
    });

    const shareUrl = `/share/${shareToken}`;

    return NextResponse.json(
      {
        token: shareToken,
        shareUrl,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create export error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
