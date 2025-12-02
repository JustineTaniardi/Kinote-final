import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const statuses = await prisma.status.findMany();
    const tasks = await prisma.task.findMany({
      select: {
        id: true,
        title: true,
        statusId: true,
        status: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: 10,
    });

    return NextResponse.json({
      statuses,
      tasks,
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
