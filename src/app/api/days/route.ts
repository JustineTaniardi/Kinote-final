import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/days:
 *   get:
 *     tags:
 *       - Reference Data
 *     summary: Get all days of week
 *     description: Returns all days of the week
 *     responses:
 *       200:
 *         description: List of days
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   name:
 *                     type: string
 *       500:
 *         description: Internal server error
 */
export async function GET() {
  try {
    const days = await prisma.day.findMany();
    return NextResponse.json(days);
  } catch (error) {
    console.error("Get days error:", error);
    
    // In development mode, return mock data
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️  Database unavailable, returning mock days data");
      const mockDays = [
        { id: 1, name: "Monday" },
        { id: 2, name: "Tuesday" },
        { id: 3, name: "Wednesday" },
        { id: 4, name: "Thursday" },
        { id: 5, name: "Friday" },
        { id: 6, name: "Saturday" },
        { id: 7, name: "Sunday" },
      ];
      return NextResponse.json(mockDays);
    }
    
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
