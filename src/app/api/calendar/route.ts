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
 * /api/calendar:
 *   get:
 *     tags:
 *       - Calendar
 *     summary: Get calendar view of tasks
 *     description: Get tasks for calendar view with optional filters by date, month, or difficulty
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by specific date (YYYY-MM-DD)
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *         description: Filter by month (YYYY-MM)
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard]
 *         description: Filter by difficulty level
 *     responses:
 *       200:
 *         description: Calendar tasks retrieved successfully
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
 *                   deadline:
 *                     type: string
 *                     format: date-time
 *                   priority:
 *                     type: string
 *                   difficulty:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       name:
 *                         type: string
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

    const url = new URL(req.url);
    const date = url.searchParams.get("date");
    const month = url.searchParams.get("month");
    const difficulty = url.searchParams.get("difficulty");

    const where: any = { userId };

    if (date) {
      // Filter by specific date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.deadline = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else if (month) {
      // Filter by month (YYYY-MM)
      const [year, monthNum] = month.split("-");
      const startOfMonth = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const endOfMonth = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59, 999);

      where.deadline = {
        gte: startOfMonth,
        lte: endOfMonth,
      };
    }

    // Build query with filters
    let query = prisma.task.findMany({
      where,
      include: {
        difficulty: true,
        status: true,
        days: {
          include: {
            day: true,
          },
        },
      },
      orderBy: { deadline: "asc" },
    });

    const tasks = await query;

    // Apply difficulty filter in memory if specified
    let filteredTasks = tasks;
    if (difficulty) {
      filteredTasks = tasks.filter(
        (task) => task.difficulty.name.toLowerCase() === difficulty.toLowerCase()
      );
    }

    return NextResponse.json(filteredTasks);
  } catch (error) {
    console.error("Get calendar error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
