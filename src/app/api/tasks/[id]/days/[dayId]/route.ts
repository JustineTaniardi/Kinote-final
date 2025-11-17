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
 * /api/tasks/{id}/days/{dayId}:
 *   delete:
 *     tags:
 *       - Tasks
 *     summary: Remove a day from task
 *     description: Unlink a day from a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Task ID
 *       - in: path
 *         name: dayId
 *         required: true
 *         schema:
 *           type: number
 *         description: Day ID
 *     responses:
 *       200:
 *         description: Day removed from task successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not task owner
 *       404:
 *         description: Task, day, or mapping not found
 *       500:
 *         description: Internal server error
 */

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; dayId: string }> }
) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, dayId } = await params;
    const taskId = parseInt(id);
    const dayIdNum = parseInt(dayId);

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

    // Check if mapping exists
    const taskDay = await prisma.taskDay.findUnique({
      where: {
        taskId_dayId: {
          taskId,
          dayId: dayIdNum,
        },
      },
    });

    if (!taskDay) {
      return NextResponse.json(
        { message: "Task-Day mapping not found" },
        { status: 404 }
      );
    }

    // Delete the mapping
    await prisma.taskDay.delete({
      where: {
        taskId_dayId: {
          taskId,
          dayId: dayIdNum,
        },
      },
    });

    return NextResponse.json({ message: "Day removed from task successfully" });
  } catch (error) {
    console.error("Remove task day error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
