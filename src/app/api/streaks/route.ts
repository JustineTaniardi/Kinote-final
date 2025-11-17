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
 * /api/streaks:
 *   get:
 *     tags:
 *       - Streak
 *     summary: Get all streaks for authenticated user
 *     description: Retrieve all streaks belonging to the currently authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of streaks retrieved successfully
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
 *                   dayId:
 *                     type: number
 *                   totalTime:
 *                     type: number
 *                   breakTime:
 *                     type: number
 *                   breakCount:
 *                     type: number
 *                   description:
 *                     type: string
 *                   photoUrl:
 *                     type: string
 *                   verified:
 *                     type: boolean
 *                   userId:
 *                     type: number
 *                   categoryId:
 *                     type: number
 *                   subCategoryId:
 *                     type: number
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   post:
 *     tags:
 *       - Streak
 *     summary: Create a new streak
 *     description: Create a new streak record for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - categoryId
 *               - dayId
 *             properties:
 *               title:
 *                 type: string
 *               categoryId:
 *                 type: number
 *               subCategoryId:
 *                 type: number
 *               dayId:
 *                 type: number
 *               totalTime:
 *                 type: number
 *                 default: 0
 *               breakTime:
 *                 type: number
 *                 default: 0
 *               breakCount:
 *                 type: number
 *                 default: 0
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Streak created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function GET(req: Request) {
  try {
    // Temporary debug logging to help diagnose repeated calls from client
    // This will print a timestamp and a stack trace so we can see where requests originate
    console.log(
      `[DEBUG] GET /api/streaks invoked at ${new Date().toISOString()}`
    );
    console.trace("Trace /api/streaks GET");
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const streaks = await prisma.streak.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(streaks);
  } catch (error) {
    console.error("Get streaks error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      categoryId,
      subCategoryId,
      dayId,
      totalTime = 0,
      breakTime = 0,
      breakCount = 0,
      description,
    } = body;

    if (!title || !categoryId || !dayId) {
      return NextResponse.json(
        { message: "Missing required fields: title, categoryId, dayId" },
        { status: 400 }
      );
    }

    const streak = await prisma.streak.create({
      data: {
        title,
        userId,
        categoryId,
        subCategoryId: subCategoryId || null,
        dayId,
        totalTime,
        breakTime,
        breakCount,
        description: description || null,
      },
    });

    return NextResponse.json(streak, { status: 201 });
  } catch (error) {
    console.error("Create streak error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
