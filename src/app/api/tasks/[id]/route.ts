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
 * /api/tasks/{id}:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: Get task details
 *     description: Get a specific task by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 deadline:
 *                   type: string
 *                   format: date-time
 *                 priority:
 *                   type: string
 *                 difficultyId:
 *                   type: number
 *                 statusId:
 *                   type: number
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not task owner
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 *   patch:
 *     tags:
 *       - Tasks
 *     summary: Update task
 *     description: Update a specific task
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
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               difficultyId:
 *                 type: number
 *               statusId:
 *                 type: number
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not task owner
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     tags:
 *       - Tasks
 *     summary: Delete task
 *     description: Delete a specific task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not task owner
 *       404:
 *         description: Task not found
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
    const taskId = parseInt(id);
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        difficulty: true,
        status: true,
        days: {
          include: {
            day: true,
          },
        },
      },
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

    return NextResponse.json(task);
  } catch (error) {
    console.error("Get task error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log(`[PATCH DEBUG] Request received`);
    
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const taskId = parseInt(id);
    console.log(`[PATCH DEBUG] Updating task ID: ${taskId}`);
    
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

    let body;
    try {
      // Clone request to get body
      const clonedReq = req.clone();
      const bodyText = await clonedReq.text();
      console.log(`[PATCH DEBUG] Body text: "${bodyText}"`);
      
      if (!bodyText || bodyText.trim() === '') {
        console.error("[PATCH DEBUG] Body is empty!");
        return NextResponse.json(
          { message: "Request body is empty" },
          { status: 400 }
        );
      }
      
      body = JSON.parse(bodyText);
      console.log(`[PATCH DEBUG] Parsed body:`, body);
    } catch (e) {
      console.error("Failed to parse JSON body:", e);
      console.error("Request headers:", Object.fromEntries(req.headers));
      return NextResponse.json(
        { message: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { title, description, deadline, priority, difficultyId, statusId, startTime, endTime } = body;
    console.log(`[PATCH DEBUG] Extracted statusId: ${statusId}`);
    console.log(`[PATCH DEBUG] Extracted startTime: ${startTime}, endTime: ${endTime}`);

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(deadline && { deadline: new Date(deadline) }),
        ...(priority && { priority }),
        ...(difficultyId && { difficultyId }),
        ...(statusId && { statusId }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
      },
      include: {
        difficulty: true,
        status: true,
        days: {
          include: {
            day: true,
          },
        },
      },
    });

    console.log(`[PATCH DEBUG] Task updated successfully, new status ID: ${updatedTask.statusId}`);
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Delete task days first (due to foreign key constraint)
    await prisma.taskDay.deleteMany({
      where: { taskId },
    });

    // Delete the task
    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
