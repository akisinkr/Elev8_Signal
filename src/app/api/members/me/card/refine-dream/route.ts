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

    const rawDescription = (body.rawDescription || "").trim();
    const jobTitle = body.jobTitle || member.jobTitle || "";
    const company = body.company || member.company || "";

    if (!rawDescription) {
      return NextResponse.json(
        { error: "rawDescription is required" },
        { status: 400 }
      );
    }

    // Fetch real superpowers from other community members
    const otherMembers = await prisma.member.findMany({
      where: {
        id: { not: member.id },
        superpowers: { isEmpty: false },
      },
      select: {
        superpowers: true,
        superpowerDetails: true,
        jobTitle: true,
      },
    });

    // Build a deduplicated list of real superpowers in the community
    const superpowerContext = otherMembers
      .flatMap((m) =>
        m.superpowers.map((sp, i) => {
          const detail = m.superpowerDetails?.[i] || "";
          const title = m.jobTitle || "";
          return detail
            ? `- ${sp} (${detail})${title ? ` [${title}]` : ""}`
            : `- ${sp}${title ? ` [${title}]` : ""}`;
        })
      )
      .slice(0, 60)
      .join("\n");

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: `You are an expert matchmaker for Elev8 — an invite-only community of Director to SVP-level tech leaders.

Your job: Take a member's rough "looking to connect" description and do two things:

1. REFINE it into a polished, specific, matchable statement (1-2 sentences, max 280 characters). Fix ALL spelling errors silently (e.g. "Crossboarder" → "Cross-border", "implimentation" → "implementation", "Nvida" → "Nvidia"). Make it clear what kind of person they want to connect with and why, so other members reading it think "that's me — I should reach out."

2. SUGGEST 3 alternative "looking to connect" descriptions based on REAL superpowers that exist in this community. Each suggestion should reference a real capability that someone in the community actually has.

Rules:
- ALWAYS fix spelling and grammar errors in the refined text
- Keep refined text under 280 characters
- Use complete, structured phrases — not fragments. "Cross-border team management experts" NOT "Cross team scale"
- Suggestions should each be 1-2 sentences, max 280 characters
- Be specific and practical — avoid generic corporate language
- Suggestions must be grounded in the real superpowers listed below, not invented
- Write from the member's perspective ("Leaders who..." or "Someone who has...")

CRITICAL: Return ONLY valid JSON:
{
  "refined": "the polished description in English",
  "refinedKr": "한국어로 자연스럽게 작성 (번역 아님)",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`,
      messages: [
        {
          role: "user",
          content: `Member: ${member.firstName} ${member.lastName}
Title: ${jobTitle || "Not provided"}
Company: ${company || "Not provided"}

Their raw "looking to meet" description: "${rawDescription}"

Real superpowers that exist in our community:
${superpowerContext || "No superpowers available yet"}

Refine their description and suggest 3 alternatives based on real community superpowers.`,
        },
      ],
    });

    const block = message.content[0];
    if (block.type !== "text") {
      throw new Error("Unexpected response");
    }

    let jsonStr = block.text.trim();
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonStr);

    if (typeof parsed.refined !== "string" || !Array.isArray(parsed.suggestions)) {
      throw new Error("Invalid format");
    }

    return NextResponse.json({
      refined: parsed.refined.slice(0, 280),
      refinedKr: (parsed.refinedKr || "").slice(0, 280),
      suggestions: parsed.suggestions.slice(0, 3),
    });
  } catch (error) {
    console.error("Refine dream connection error:", error);
    return NextResponse.json(
      { error: "Failed to refine description" },
      { status: 500 }
    );
  }
}
