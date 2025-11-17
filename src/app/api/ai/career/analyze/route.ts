import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const JWT_SECRET = process.env.JWT_SECRET!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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
 * /api/ai/career/analyze:
 *   post:
 *     tags:
 *       - AI Career Coach
 *     summary: Analyze streaks for career path
 *     description: Generate AI-powered career path recommendation based on selected streaks and purpose using GPT
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - streakIds
 *               - purpose
 *             properties:
 *               streakIds:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: Array of streak IDs to analyze
 *                 example: [1, 2, 3]
 *               purpose:
 *                 type: string
 *                 enum: ["Lomba", "Pekerjaan", "Kursus"]
 *                 description: Career purpose
 *                 example: "Pekerjaan"
 *     responses:
 *       201:
 *         description: Analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 analysis:
 *                   type: object
 *                   properties:
 *                     personality_tendencies:
 *                       type: string
 *                     strengths:
 *                       type: array
 *                       items:
 *                         type: string
 *                     weaknesses:
 *                       type: array
 *                       items:
 *                         type: string
 *                     recommended_careers:
 *                       type: array
 *                       items:
 *                         type: string
 *                     roadmap:
 *                       type: array
 *                       items:
 *                         type: string
 *                     recommended_learning:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Invalid request or missing OpenAI key
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI key missing" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { streakIds, purpose } = body;

    if (!streakIds || !Array.isArray(streakIds) || streakIds.length === 0) {
      return NextResponse.json(
        { message: "streakIds array is required" },
        { status: 400 }
      );
    }

    if (!purpose || !["Lomba", "Pekerjaan", "Kursus"].includes(purpose)) {
      return NextResponse.json(
        { message: "purpose must be one of: Lomba, Pekerjaan, Kursus" },
        { status: 400 }
      );
    }

    // Fetch streaks and histories
    const streaks = await prisma.streak.findMany({
      where: {
        id: { in: streakIds },
        userId, // Ensure user owns all streaks
      },
      include: {
        histories: {
          select: {
            duration: true,
            createdAt: true,
          },
        },
        category: true,
        subCategory: true,
      },
    });

    if (streaks.length === 0) {
      return NextResponse.json(
        { message: "No valid streaks found" },
        { status: 400 }
      );
    }

    // Build source data
    const sourceData = {
      streakCount: streaks.length,
      totalSessions: streaks.reduce((sum, s) => sum + s.histories.length, 0),
      totalDuration: streaks.reduce(
        (sum, s) => sum + s.histories.reduce((sSum, h) => sSum + (h.duration || 0), 0),
        0
      ),
      streaks: streaks.map((s) => ({
        title: s.title,
        category: s.category?.name,
        subCategory: s.subCategory?.name,
        sessions: s.histories.length,
      })),
    };

    // Build prompt for OpenAI
    const promptString = `You are an AI Career Coach. Analyze the user's activity patterns from these streaks and generate deep insights. Purpose: ${purpose}. Streak data: ${JSON.stringify(sourceData)}.

Produce STRICT valid JSON ONLY (no other text) containing:
1) personality_tendencies: string describing personality traits based on activities
2) strengths: array of 3-4 key strengths
3) weaknesses: array of 2-3 areas for improvement
4) recommended_careers: array of 3-4 suitable career paths for "${purpose}"
5) roadmap: array of 3 concrete steps to achieve the goal
6) recommended_learning: array of 3-4 courses/resources to pursue

CRITICAL: Return ONLY valid JSON, no other text, no markdown.`;

    // Call OpenAI
    const client = new OpenAI({ apiKey: OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert career coach AI. ALWAYS return ONLY valid JSON, nothing else.",
        },
        {
          role: "user",
          content: promptString,
        },
      ],
      temperature: 0.7,
    });

    const aiText = completion.choices[0].message?.content;
    if (!aiText) {
      return NextResponse.json(
        { message: "No response from AI" },
        { status: 500 }
      );
    }

    // Parse JSON response
    let parsed;
    try {
      parsed = JSON.parse(aiText);
    } catch (e) {
      console.error("Failed to parse AI response:", aiText);
      return NextResponse.json(
        { message: "Invalid response format from AI" },
        { status: 500 }
      );
    }

    // Save analysis to database
    const analysis = await prisma.aiAnalysis.create({
      data: {
        userId,
        purpose,
        sourceData: sourceData as any,
        promptUsed: promptString,
        result: parsed as any,
      },
    });

    return NextResponse.json(
      {
        success: true,
        analysis: parsed,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Analyze career error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

