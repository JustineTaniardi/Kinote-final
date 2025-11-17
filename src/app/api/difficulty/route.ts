import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/difficulty:
 *   get:
 *     tags:
 *       - Reference Data
 *     summary: Get all difficulty levels
 *     description: Returns all available difficulty levels
 *     responses:
 *       200:
 *         description: List of difficulty levels
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
    const difficulties = await prisma.difficulty.findMany();
    return NextResponse.json(difficulties);
  } catch (error) {
    console.error("Get difficulty error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
