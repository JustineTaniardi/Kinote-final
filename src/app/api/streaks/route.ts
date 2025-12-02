import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET!;

// Simple in-memory idempotency cache
// Maps idempotency key -> { timestamp, response }
const idempotencyCache = new Map<string, { timestamp: number; response: any }>();

// Clean up old cache entries every 5 minutes (keep them for 5 minutes)
const CACHE_TTL = 5 * 60 * 1000;
const CLEANUP_INTERVAL = 5 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of idempotencyCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      idempotencyCache.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

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
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const streaks = await prisma.streak.findMany({
      where: { userId },
      include: {
        day: true,
        category: true,
        subCategory: true,
        histories: {
          select: {
            id: true,
            verifiedAI: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate streak count from verified histories
    const streaksWithCount = streaks.map((streak: any) => ({
      ...streak,
      streakCount: streak.histories.filter((h: any) => h.verifiedAI).length,
    }));

    return NextResponse.json(streaksWithCount);
  } catch (error) {
    console.error("Get streaks error:", error);
    
    // In development mode, return empty array (database unavailable)
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️  Database unavailable, returning empty streaks array");
      return NextResponse.json([]);
    }
    
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
    console.log("Create streak payload:", body);

    const {
      title,
      categoryId,
      subCategoryId,
      dayIds = [],
      totalTime = 0,
      breakTime = 0,
      breakCount = 0,
      description,
      idempotencyKey,
    } = body;

    // Check idempotency cache to prevent duplicate submissions
    if (idempotencyKey) {
      const cacheKey = `${userId}-${idempotencyKey}`;
      if (idempotencyCache.has(cacheKey)) {
        const cached = idempotencyCache.get(cacheKey);
        console.log("Returning cached response for idempotency key:", idempotencyKey);
        return NextResponse.json(cached!.response, { status: 201 });
      }
    }

    if (!title || !categoryId) {
      return NextResponse.json(
        { message: "Missing required fields: title, categoryId" },
        { status: 400 }
      );
    }

    // Validate totalTime - must be at least 1 minute if provided
    const parsedTotalTime = parseInt(String(totalTime)) || 0;
    if (totalTime && parsedTotalTime < 1) {
      return NextResponse.json(
        { message: "Total time must be at least 1 minute" },
        { status: 400 }
      );
    }

    // Validate breakTime - must be at least 1 minute if provided
    const parsedBreakTime = parseInt(String(breakTime)) || 0;
    if (breakTime && parsedBreakTime < 1) {
      return NextResponse.json(
        { message: "Break time must be at least 1 minute" },
        { status: 400 }
      );
    }

    // Ensure dayIds is an array and parse to integers
    const dayIdsArray = Array.isArray(dayIds) 
      ? dayIds.map(id => typeof id === 'string' ? parseInt(id) : id).filter(id => !isNaN(id))
      : dayIds ? [typeof dayIds === 'string' ? parseInt(dayIds) : dayIds].filter(id => !isNaN(id)) : [];

    // Parse categoryId as integer
    const parsedCategoryId = typeof categoryId === 'string' ? parseInt(categoryId) : categoryId;
    const parsedSubCategoryId = subCategoryId ? (typeof subCategoryId === 'string' ? parseInt(subCategoryId) : subCategoryId) : null;

    console.log("Parsed values - userId:", userId, "categoryId:", parsedCategoryId, "dayIds:", dayIdsArray);

    // Validate category exists
    const category = await prisma.category.findUnique({
      where: { id: parsedCategoryId },
    });

    if (!category) {
      console.error("Category not found:", parsedCategoryId);
      return NextResponse.json(
        { message: "Category not found" },
        { status: 400 }
      );
    }

    // Validate subcategory if provided
    if (parsedSubCategoryId) {
      const subCategory = await prisma.subCategory.findUnique({
        where: { id: parsedSubCategoryId },
      });

      if (!subCategory) {
        console.error("SubCategory not found:", parsedSubCategoryId);
        return NextResponse.json(
          { message: "SubCategory not found" },
          { status: 400 }
        );
      }
    }

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.error("User not found:", userId);
      return NextResponse.json(
        { message: "User not found. Please log in again." },
        { status: 401 }
      );
    }

    // Validate days exist if provided
    if (dayIdsArray.length > 0) {
      const days = await prisma.day.findMany({
        where: { id: { in: dayIdsArray } },
      });

      if (days.length !== dayIdsArray.length) {
        console.error("Some days not found. Requested:", dayIdsArray, "Found:", days.map(d => d.id));
        return NextResponse.json(
          { message: "Some days not found in database" },
          { status: 400 }
        );
      }
    }

    const streak = await prisma.streak.create({
      data: {
        title,
        userId,
        categoryId: parsedCategoryId,
        subCategoryId: parsedSubCategoryId,
        dayId: dayIdsArray.length > 0 ? dayIdsArray[0] : null,
        dayIds: dayIdsArray.length > 0 ? JSON.stringify(dayIdsArray) : "[]",
        totalTime: parsedTotalTime,
        breakTime: parsedBreakTime,
        breakCount: parseInt(String(breakCount)) || 0,
        streakCount: 0,
        description: description || null,
      },
      include: {
        category: true,
        subCategory: true,
        day: true,
      },
    });

    // Store in idempotency cache
    if (idempotencyKey) {
      const cacheKey = `${userId}-${idempotencyKey}`;
      idempotencyCache.set(cacheKey, {
        timestamp: Date.now(),
        response: streak,
      });
      console.log("Cached response for idempotency key:", idempotencyKey);
    }

    console.log("Streak created successfully:", streak.id);
    return NextResponse.json(streak, { status: 201 });
  } catch (error) {
    console.error("Create streak error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { message: "Internal server error", error: errorMessage },
      { status: 500 }
    );
  }
}
