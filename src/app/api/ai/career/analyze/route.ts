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
    const decoded = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
    return (decoded.id as number) || null;
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
      console.error("OPENAI_API_KEY is not set in environment variables");
      return NextResponse.json(
        { error: "OpenAI key missing. Please set OPENAI_API_KEY in environment variables." },
        { status: 500 }
      );
    }

    // Validate API key format
    if (!OPENAI_API_KEY.startsWith("sk-")) {
      console.error("OPENAI_API_KEY has invalid format. Should start with 'sk-'");
      return NextResponse.json(
        { error: "OpenAI API key has invalid format. Please check your environment variables." },
        { status: 500 }
      );
    }

    const body = await req.json();
    let { streakIds, purpose } = body;

    if (!streakIds || !Array.isArray(streakIds) || streakIds.length === 0) {
      return NextResponse.json(
        { message: "streakIds array is required" },
        { status: 400 }
      );
    }

    // Default purpose to 'Pekerjaan' if not provided
    if (!purpose) {
      purpose = "Pekerjaan";
    }

    // Validate purpose if provided
    if (!["Lomba", "Pekerjaan", "Kursus"].includes(purpose)) {
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
            description: true,
            title: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10, // Get last 10 history records
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
        description: s.description,
        recentHistories: s.histories.map((h) => ({
          title: h.title,
          description: h.description,
          duration: h.duration,
          date: h.createdAt,
        })),
      })),
    };

    // Build prompt for OpenAI
    const streakTitles = sourceData.streaks.map((s) => s.title).join(", ");
    
    // Get recent history descriptions
    const recentHistoriesText = sourceData.streaks
      .flatMap((s) => 
        s.recentHistories.map((h) => `- ${h.title}: ${h.description || "No description"}`)
      )
      .join("\n");

    // Purpose-specific context for tips
    const purposeContext: { [key: string]: string } = {
      "Lomba": "Berikan tips SPESIFIK untuk kompetisi. Fokus: strategi menang, teknik kompetitor, psikologi kompetisi.",
      "Pekerjaan": "Berikan tips SPESIFIK untuk karir profesional. Fokus: soft skills, hard skills, strategi mendapat pekerjaan.",
      "Kursus": "Berikan tips SPESIFIK untuk pembelajaran. Fokus: belajar efektif, topik penting, sertifikasi."
    };

    const purposeContextText = purposeContext[purpose] || "Berikan tips praktis untuk bidang ini.";

    const promptString = `Analisis pembelajaran user berdasarkan 10 history terakhir.
Aktivitas: ${streakTitles}
Tujuan: ${purpose}
${purposeContextText}

Riwayat:
${recentHistoriesText}

OUTPUT HANYA JSON (tanpa teks lain):
{
  "learning_conclusion": "Kesimpulan singkat apa yang dipelajari",
  "strengths": ["strength 1", "strength 2", "strength 3", "strength 4"],
  "areas_to_improve": ["area 1", "area 2", "area 3"],
  "tips_and_tricks": ["tip 1 DETAIL untuk ${purpose}", "tip 2 DETAIL untuk ${purpose}", "tip 3 DETAIL untuk ${purpose}", "tip 4 DETAIL untuk ${purpose}", "tip 5 DETAIL untuk ${purpose}"],
  "recommended_resources": ["Nama - https://link1.com / https://link2.com / https://link3.com", "Nama2 - https://link1.com / https://link2.com / https://link3.com"]
}`;

    const systemPrompt = `Anda adalah AI Learning Coach. Analisis 10 history terakhir user dan berikan insight singkat tapi valuable.
Tips HARUS SPESIFIK untuk tujuan user (Lomba/Pekerjaan/Kursus), bukan tips umum.
OUTPUT HANYA JSON, TIDAK ADA TEKS LAIN.`;

    // Call OpenAI
    const client = new OpenAI({ apiKey: OPENAI_API_KEY });

    console.log("Calling OpenAI with model: gpt-3.5-turbo, purpose:", purpose);

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: promptString,
        },
      ],
      temperature: 0.5,
      max_tokens: 1500,
    });

    const aiText = completion.choices[0].message?.content;
    if (!aiText) {
      return NextResponse.json(
        { message: "No response from AI" },
        { status: 500 }
      );
    }

    // Parse JSON response
    let parsed: unknown;
    try {
      parsed = JSON.parse(aiText);
    } catch (error) {
      console.error("Failed to parse AI response:", aiText, error);
      return NextResponse.json(
        { message: "Invalid response format from AI" },
        { status: 500 }
      );
    }

    // Save analysis to database
    await prisma.aiAnalysis.create({
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
    
    // Check if error is an OpenAI API error
    const errorObj = error as Record<string, unknown>;
    if (errorObj.code === 'invalid_api_key' || errorObj.status === 401) {
      return NextResponse.json(
        { 
          message: "OpenAI API key is invalid or expired. Please check your environment variables.",
          code: "INVALID_API_KEY"
        },
        { status: 401 }
      );
    }
    
    if (errorObj.code === 'rate_limit_exceeded' || errorObj.status === 429) {
      return NextResponse.json(
        { 
          message: "OpenAI API rate limit exceeded. Please try again later.",
          code: "RATE_LIMIT"
        },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { 
        message: "Internal server error while analyzing. Please try again.",
        details: errorObj.message || String(error)
      },
      { status: 500 }
    );
  }
}

