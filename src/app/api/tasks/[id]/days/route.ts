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
 * /api/tasks/{id}/days:
 *   post:
 *     tags:
 *       - Tasks
 *     summary: Add a day to task
 *     description: Link a day to a task (for recurring tasks)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dayId
 *             properties:
 *               dayId:
 *                 type: number
 *                 description: Day ID (1-7)
 *     responses:
 *       201:
 *         description: Day added to task successfully
 *       400:
 *         description: Invalid request or day already linked
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not task owner
 *       404:
 *         description: Task or day not found
 *       500:
 *         description: Internal server error
 */

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
    const taskId = parseInt(id);
    const body = await req.json();
    const { dayId } = body;

    if (!dayId) {
      return NextResponse.json(
        { message: "dayId is required" },
        { status: 400 }
      );
    }

    // Verify task exists and belongs to user
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json(
        { message: "Task not found" },
        { status: 404 }
      );
    }

    if (task.userId !== userId) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    // Verify day exists
    const day = await prisma.day.findUnique({
      where: { id: dayId },
    });

    if (!day) {
      return NextResponse.json(
        { message: "Day not found" },
        { status: 404 }
      );
    }

    // Check if mapping already exists
    const existingMapping = await prisma.taskDay.findUnique({
      where: {
        taskId_dayId: {
          taskId,
          dayId,
        },
      },
    });

    if (existingMapping) {
      return NextResponse.json(
        { message: "Day is already linked to this task" },
        { status: 400 }
      );
    }

    // Create the mapping
    const taskDay = await prisma.taskDay.create({
      data: {
        taskId,
        dayId,
      },
      include: {
        day: true,
      },
    });

    return NextResponse.json(taskDay, { status: 201 });
  } catch (error) {
    console.error("Add task day error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
