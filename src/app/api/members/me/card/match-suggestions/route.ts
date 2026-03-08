import { NextResponse } from "next/server";
import { requireMember } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function GET() {
  try {
    const member = await requireMember();

    // Fetch current member's card data
    const me = await prisma.member.findUnique({
      where: { id: member.id },
      select: {
        id: true,
        superpowers: true,
        superpowerDetails: true,
        challenges: true,
        challengeDetails: true,
        superpowersKr: true,
        superpowerDetailsKr: true,
        challengesKr: true,
        challengeDetailsKr: true,
      },
    });

    if (!me) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Fetch all other members who have completed their cards
    const candidates = await prisma.member.findMany({
      where: {
        id: { not: member.id },
        cardCompletedAt: { not: null },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
        customPhotoUrl: true,
        jobTitle: true,
        company: true,
        superpowers: true,
        superpowerDetails: true,
        challenges: true,
        challengeDetails: true,
        superpowersKr: true,
        superpowerDetailsKr: true,
        challengesKr: true,
        challengeDetailsKr: true,
      },
    });

    if (candidates.length === 0) {
      return NextResponse.json({ matches: [] });
    }

    // Build AI-safe candidate list (no PII — only IDs, superpowers, challenges, job titles)
    const candidatesForAI = candidates.map((c) => ({
      id: c.id,
      jobTitle: c.jobTitle || "Unknown",
      superpowers: [...c.superpowers, ...c.superpowersKr].filter(Boolean),
      superpowerDetails: [...c.superpowerDetails, ...c.superpowerDetailsKr].filter(Boolean),
      challenges: [...c.challenges, ...c.challengesKr].filter(Boolean),
      challengeDetails: [...c.challengeDetails, ...c.challengeDetailsKr].filter(Boolean),
    }));

    const myProfile = {
      superpowers: [...me.superpowers, ...me.superpowersKr].filter(Boolean),
      superpowerDetails: [...me.superpowerDetails, ...me.superpowerDetailsKr].filter(Boolean),
      challenges: [...me.challenges, ...me.challengesKr].filter(Boolean),
      challengeDetails: [...me.challengeDetails, ...me.challengeDetailsKr].filter(Boolean),
    };

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: `You are the matching engine for Elev8 — an invite-only community of senior tech leaders (Director to SVP level).

Your job: Find the 3 best member matches based on superpower-to-challenge alignment.

Matching rules:
- A great match means Member A's SUPERPOWER can help with Member B's CHALLENGE (or vice versa)
- Use SEMANTIC matching, not just keyword matching. "팀 스케일링" and "Team Scaling" are the same concept. "시니어 채용" and "Senior Hiring" are related.
- Consider both directions: their superpower matching my challenge AND my superpower matching their challenge
- Prefer matches where both directions align (mutual benefit)
- Quality over keyword overlap — understand the MEANING behind each superpower and challenge

CRITICAL: Return ONLY valid JSON — an array of exactly 3 objects (or fewer if less than 3 candidates):
[
  {
    "memberId": "the candidate's id",
    "matchReason": "1-2 sentence explanation of WHY they match (e.g. 'Their expertise in scaling engineering teams directly addresses your challenge in senior hiring and team growth')",
    "matchedSuperpower": "the specific superpower that creates the match (theirs or yours)",
    "matchedChallenge": "the specific challenge that the superpower addresses (yours or theirs)"
  }
]

Return the array sorted by match quality (best match first).`,
      messages: [
        {
          role: "user",
          content: `MY PROFILE:
Superpowers: ${myProfile.superpowers.join(", ")}
Superpower Details: ${myProfile.superpowerDetails.join(" | ")}
Challenges: ${myProfile.challenges.join(", ")}
Challenge Details: ${myProfile.challengeDetails.join(" | ")}

CANDIDATES:
${JSON.stringify(candidatesForAI, null, 2)}

Find the 3 best matches for me. Return ONLY the JSON array.`,
        },
      ],
    });

    const block = message.content[0];
    if (block.type !== "text") {
      throw new Error("Unexpected AI response type");
    }

    let jsonStr = block.text.trim();
    // Extract JSON array from response
    const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const aiMatches: Array<{
      memberId: string;
      matchReason: string;
      matchedSuperpower: string;
      matchedChallenge: string;
    }> = JSON.parse(jsonStr);

    // Build a lookup map for candidate profile data
    const candidateMap = new Map(candidates.map((c) => [c.id, c]));

    // Map AI results back to full member info
    const matches = aiMatches
      .filter((m) => candidateMap.has(m.memberId))
      .slice(0, 3)
      .map((m) => {
        const c = candidateMap.get(m.memberId)!;
        return {
          memberId: c.id,
          firstName: c.firstName,
          lastName: c.lastName,
          imageUrl: c.customPhotoUrl || c.imageUrl,
          jobTitle: c.jobTitle,
          company: c.company,
          matchReason: m.matchReason,
          matchedSuperpower: m.matchedSuperpower,
          matchedChallenge: m.matchedChallenge,
        };
      });

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Match suggestions error:", error);
    return NextResponse.json(
      { error: "Failed to generate match suggestions" },
      { status: 500 }
    );
  }
}
