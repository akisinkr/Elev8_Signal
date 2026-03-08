import { NextResponse } from "next/server";
import { requireMember } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    const member = await requireMember();
    const body = await req.json();

    // 5-dimension inputs
    const spDomain = (body.spDomain || "").trim();
    const spAction = (body.spAction || "").trim();
    const spScale = (body.spScale || "").trim();
    const spStage = (body.spStage || "").trim();
    const spGeo = (body.spGeo || "").trim();
    const challengeHint = (body.challengeHint || "").trim();
    const title = body.jobTitle || member.jobTitle || "";
    const company = body.company || member.company || "";

    // Fetch existing members' descriptions for cross-member vocabulary
    const otherMembers = await prisma.member.findMany({
      where: {
        id: { not: member.id },
        cardCompletedAt: { not: null },
      },
      select: {
        superpowerDetails: true,
        challengeDetails: true,
      },
    });

    const existingSuperpowers = otherMembers
      .flatMap((m) => m.superpowerDetails)
      .filter(Boolean);
    const existingChallenges = otherMembers
      .flatMap((m) => m.challengeDetails)
      .filter(Boolean);

    const vocabContext = existingSuperpowers.length > 0 || existingChallenges.length > 0
      ? `\n\nEXISTING COMMUNITY VOCABULARY — Use similar language patterns for better matching:
${[...new Set(existingSuperpowers)].slice(0, 10).map((s) => `- "${s}"`).join("\n")}
${[...new Set(existingChallenges)].slice(0, 10).map((c) => `- "${c}"`).join("\n")}`
      : "";

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: `You generate Superpower profiles for Elev8 — an invite-only community of Director to SVP-level tech leaders.

You receive 5 DIMENSIONS that precisely define a member's expertise:
1. DOMAIN — their tech area
2. ACTION — what specifically they do
3. SCALE — team/org size
4. STAGE — company stage
5. GEOGRAPHY — where they operate

Your job: Use all 5 dimensions to generate a sharp, specific, bragable Superpower profile.

## THE 3-LAYER STRUCTURE

### Layer 1 — TITLE (5-8 words)
Formula: [Action] + [Domain] + [Scale/Context qualifier]
The title should combine the 5 dimensions into one scannable phrase.

GOOD (dimension-driven):
- "Scaling AI Teams (10→200) Across US-Korea"
- "Cloud Cost Optimization at Fortune 500 Scale"
- "Building Platform Teams from Scratch (Seed → Series B)"

BAD (generic):
- "Technical Leadership and Strategy"
- "Building Scalable Systems"

### Layer 2 — "I CAN HELP YOU WITH" (exactly 3 bullets)
Each bullet: action verb + specific problem + max 12 words.
Written from the SEEKER's perspective. Informed by the member's scale, stage, and geography.

### Layer 3 — PROOF LINE (1 sentence)
One concrete fact with numbers. Infer realistic specifics from title/company/scale.
If you can't infer numbers, use company context ("at [Company]'s scale").

## CHALLENGES ("Currently Exploring")
Frame as PROACTIVE EXPLORATION, not weakness. Private — shown only to matched peers.
Start with "Exploring...", "Building...", "Figuring out...", "Evaluating..."
Write 1-2 sentences that make a peer think "I can help" or "me too."

## STRICT RULES
1. Be specific to THIS person's title + company + 5 dimensions
2. NO corporate buzzwords: "leverage", "synergize", "drive value"
3. NO resume language: "Built...", "Architected..." — use present-tense for bullets
4. Fix spelling errors silently
5. Korean versions: recreate naturally in Korean, don't translate. Use 비격식 존댓말. Keep English tech terms as-is${vocabContext}

Return ONLY valid JSON — no markdown fences:
{
  "superpowers": [
    {
      "title": "5-8 Word Title Here",
      "bullets": ["bullet 1 (max 12 words)", "bullet 2", "bullet 3"],
      "proof": "One sentence with concrete numbers"
    }
  ],
  "challenges": ["Proactive exploration sentence 1", "Proactive exploration sentence 2"],
  "superpowersKr": [
    {
      "title": "한국어 타이틀",
      "bullets": ["한국어 불릿 1", "한국어 불릿 2", "한국어 불릿 3"],
      "proof": "한국어 증명 라인"
    }
  ],
  "challengesKr": ["한국어 챌린지 1", "한국어 챌린지 2"]
}`,
      messages: [
        {
          role: "user",
          content: `Member: ${member.firstName} ${member.lastName}
Title: ${title || "Not provided"}
Company: ${company || "Not provided"}

5 DIMENSIONS:
1. Domain: ${spDomain || "Not provided"}
2. Action: ${spAction || "Not provided"}
3. Scale: ${spScale || "Not provided"}
4. Stage: ${spStage || "Not provided"}
5. Geography: ${spGeo || "Not provided"}

Currently exploring (private challenges): "${challengeHint || "No hint given"}"

Generate the 3-layer Superpower profile using all 5 dimensions. Make the title combine these dimensions into something specific and bragable. Generate exploration-framed descriptions for each challenge. Both English and Korean.`,
        },
      ],
    });

    const block = message.content[0];
    if (block.type !== "text") {
      throw new Error("Unexpected response");
    }

    let jsonStr = block.text.trim();
    jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonStr);

    if (!Array.isArray(parsed.superpowers) || !Array.isArray(parsed.challenges)) {
      throw new Error("Invalid format");
    }

    return NextResponse.json({
      superpowers: parsed.superpowers,
      challenges: parsed.challenges,
      superpowersKr: parsed.superpowersKr || [],
      challengesKr: parsed.challengesKr || [],
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("AI suggestion error:", errMsg, error);
    return NextResponse.json(
      { error: "Failed to generate suggestions", detail: errMsg },
      { status: 500 }
    );
  }
}
