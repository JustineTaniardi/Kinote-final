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
 * /api/streaks/{id}/verify:
 *   post:
 *     tags:
 *       - AI Verification
 *     summary: Verify a streak session with AI
 *     description: Perform AI verification on a streak session using GPT vision
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Streak ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *             properties:
 *               description:
 *                 type: string
 *                 description: Description of the activity
 *                 example: "Finished workout"
 *               photoUrl:
 *                 type: string
 *                 description: URL of the activity photo
 *                 example: "/uploads/image123.png"
 *     responses:
 *       201:
 *         description: Verification completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 verified:
 *                   type: boolean
 *                 confidence:
 *                   type: number
 *                 resultText:
 *                   type: object
 *       400:
 *         description: Invalid request or missing OpenAI key
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not streak owner
 *       404:
 *         description: Streak not found
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

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI key missing" },
        { status: 500 }
      );
    }

    const { id } = await params;
    const streakId = parseInt(id);
    const body = await req.json();
    const { description, photoUrl } = body;

    if (!description) {
      return NextResponse.json(
        { message: "description is required" },
        { status: 400 }
      );
    }

    // Verify streak exists and belongs to user
    const streak = await prisma.streak.findUnique({
      where: { id: streakId },
    });

    if (!streak) {
      return NextResponse.json(
        { message: "Streak not found" },
        { status: 404 }
      );
    }

    if (streak.userId !== userId) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    // Build prompt for OpenAI with proper escaping to prevent prompt injection
    const escapedDescription = String(description).replace(/[`\\${}]/g, (char) => `\\${char}`);
    const escapedPhotoUrl = String(photoUrl || "No photo provided").replace(/[`\\${}]/g, (char) => `\\${char}`);
    
    const promptString = `You are an AI activity verification system. Analyze the following session:
Description: "${escapedDescription}"
Photo URL: "${escapedPhotoUrl}"

Determine:
1) Does the photo appear authentic (if provided)?
2) Does it match the description?
3) Confidence score (0-1)
4) Reasoning

Return STRICT valid JSON ONLY (no other text) with fields:
{
  "authentic": boolean,
  "matches_description": boolean,
  "confidence": number (0-1),
  "verified": boolean,
  "reasoning": string
}`;

    // Call OpenAI
    const client = new OpenAI({ apiKey: OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert AI verification system. ALWAYS return ONLY valid JSON, nothing else.",
        },
        {
          role: "user",
          content: promptString,
        },
      ],
      temperature: 0.5,
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

    // Create verification record
    const verification = await prisma.aiVerification.create({
      data: {
        streakId,
        description: description || null,
        imageUrl: photoUrl || null,
        verified: parsed.verified ?? false,
        confidence: parsed.confidence ?? null,
        resultText: JSON.stringify(parsed),
      },
    });

    return NextResponse.json(verification, { status: 201 });
  } catch (error) {
    console.error("Verify streak error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
