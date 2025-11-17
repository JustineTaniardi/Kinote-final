import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/status:
 *   get:
 *     tags:
 *       - Reference Data
 *     summary: Get all status options
 *     description: Returns all available status options for tasks
 *     responses:
 *       200:
 *         description: List of status options
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
    const statuses = await prisma.status.findMany();
    return NextResponse.json(statuses);
  } catch (error) {
    console.error("Get status error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
