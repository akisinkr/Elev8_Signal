import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function GET() {
  try {
    await requireAdmin();

    const suggestions = await prisma.aiSignalSuggestion.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(suggestions);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST() {
  try {
    await requireAdmin();

    // 1. Fetch all members with completed cards
    const members = await prisma.member.findMany({
      where: { cardCompletedAt: { not: null } },
      select: {
        challenges: true,
        challengeDetails: true,
      },
    });

    if (members.length === 0) {
      return NextResponse.json(
        { error: "No members with completed cards found" },
        { status: 400 }
      );
    }

    // 2. Aggregate challenge data
    const allChallenges: string[] = [];
    const allChallengeDetails: string[] = [];

    for (const member of members) {
      allChallenges.push(...member.challenges);
      allChallengeDetails.push(...member.challengeDetails);
    }

    // 3. Fetch existing AI suggestions to avoid duplicates
    const existingSuggestions = await prisma.aiSignalSuggestion.findMany({
      select: { question: true },
    });
    const existingQuestions = existingSuggestions.map((s) => s.question);

    // 4. Call Claude AI to generate 3 new poll questions
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `Here are the challenges and details from ${members.length} members:\n\nChallenges: ${JSON.stringify(allChallenges)}\n\nChallenge Details: ${JSON.stringify(allChallengeDetails)}\n\nExisting questions to avoid duplicating:\n${existingQuestions.map((q) => `- ${q}`).join("\n")}\n\nGenerate 3 new Signal poll questions based on common challenge themes.`,
        },
      ],
      system: `You are the AI question designer for Elev8, an invite-only community of Director to SVP-level tech leaders based in or connected to the Korean tech ecosystem.

Your job is to analyze the challenge themes across all members and generate Signal poll questions that would spark insightful discussion about those challenges.

Each question must:
- Be relevant to senior tech leadership challenges
- Have exactly 5 answer options (A through E) that represent distinct, thoughtful perspectives
- Include a rationale explaining why this question matters based on the member data
- Include sourceThemes (which challenge keywords informed this question)
- NOT duplicate any existing questions provided

Return ONLY valid JSON in this exact format:
{
  "suggestions": [
    {
      "question": "...",
      "optionA": "...",
      "optionB": "...",
      "optionC": "...",
      "optionD": "...",
      "optionE": "...",
      "rationale": "...",
      "sourceThemes": ["theme1", "theme2"]
    }
  ]
}`,
    });

    // 5. Parse AI response
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Extract JSON from response (handle potential markdown code blocks)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      suggestions: Array<{
        question: string;
        optionA: string;
        optionB: string;
        optionC: string;
        optionD: string;
        optionE: string;
        rationale: string;
        sourceThemes: string[];
      }>;
    };

    if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
      return NextResponse.json(
        { error: "Invalid AI response format" },
        { status: 500 }
      );
    }

    // 6. Save suggestions to database
    const created = await prisma.$transaction(
      parsed.suggestions.map((s) =>
        prisma.aiSignalSuggestion.create({
          data: {
            question: s.question,
            optionA: s.optionA,
            optionB: s.optionB,
            optionC: s.optionC,
            optionD: s.optionD,
            optionE: s.optionE,
            rationale: s.rationale,
            sourceThemes: s.sourceThemes,
          },
        })
      )
    );

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("AI suggestion generation error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
