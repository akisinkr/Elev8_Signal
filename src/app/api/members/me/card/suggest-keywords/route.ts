import { NextResponse } from "next/server";
import { requireMember } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SUPERPOWER_KEYWORDS = [
  "AI / ML",
  "System Architecture",
  "Team Scaling",
  "Technical Hiring",
  "Data Infrastructure",
  "Cloud Migration",
  "Platform Engineering",
  "Developer Experience",
  "Product Strategy",
  "Engineering Culture",
  "Stakeholder Management",
  "M&A Due Diligence",
];

const CHALLENGE_KEYWORDS = [
  "AI Adoption",
  "Senior Hiring",
  "Talent Retention",
  "Org Restructuring",
  "Technical Debt",
  "Budget Optimization",
  "Remote / Hybrid Teams",
  "Career Growth",
  "Work-Life Balance",
  "Cross-team Alignment",
  "Innovation at Scale",
  "Korea Opportunities",
];

export async function POST(request: Request) {
  try {
    const member = await requireMember();

    const body = await request.json();
    const { type, currentSelections, jobTitle, company } = body as {
      type: "superpowers" | "challenges";
      currentSelections: string[];
      jobTitle?: string;
      company?: string;
    };

    if (!type || !["superpowers", "challenges"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be 'superpowers' or 'challenges'." },
        { status: 400 }
      );
    }

    // Fetch existing vocabulary from other members
    const otherMembers = await prisma.member.findMany({
      where: { id: { not: member.id } },
      select: {
        superpowers: true,
        challenges: true,
        jobTitle: true,
      },
    });

    const existingVocabulary = new Set<string>();
    for (const m of otherMembers) {
      const keywords = type === "superpowers" ? m.superpowers : m.challenges;
      for (const kw of keywords) {
        existingVocabulary.add(kw);
      }
    }

    const defaultGrid =
      type === "superpowers" ? SUPERPOWER_KEYWORDS : CHALLENGE_KEYWORDS;

    const excludeSet = new Set([
      ...currentSelections,
      ...defaultGrid,
    ]);

    // Filter vocabulary to only terms not already selected or in the default grid
    const communityTerms = [...existingVocabulary].filter(
      (term) => !excludeSet.has(term)
    );

    const memberTitle = jobTitle || member.jobTitle || "a professional";
    const memberCompany = company || "";

    const systemPrompt = `You are a keyword suggestion engine for a professional community platform called Elev8 Signal. Members tag their ${type} with short keyword phrases.

Your job: generate 4-6 personalized keyword suggestions for this member.

Rules:
- Each keyword should be 2-4 words (e.g. "AI / ML", "Team Scaling", "Cloud Migration")
- Be specific to the member's role and company when possible
- Look at what other community members already use and generate complementary/consistent keywords — use similar language patterns for better matching
- Do NOT duplicate any of the member's current selections
- Do NOT duplicate any keyword from the default grid
- Return ONLY a JSON array of strings, nothing else

Member's current selections: ${JSON.stringify(currentSelections)}

Default grid keywords to avoid: ${JSON.stringify(defaultGrid)}

Keywords already used by other community members (use similar style/patterns): ${JSON.stringify(communityTerms.slice(0, 50))}`;

    const userMessage = `Suggest ${type} keywords for a member who is "${memberTitle}"${memberCompany ? ` at "${memberCompany}"` : ""}. They currently have: ${currentSelections.length > 0 ? currentSelections.join(", ") : "nothing selected yet"}.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 256,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse the JSON array from the response
    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse AI response." },
        { status: 500 }
      );
    }

    const keywords: string[] = JSON.parse(jsonMatch[0]);

    // Final safety filter: remove any duplicates of current selections or default grid
    const filtered = keywords.filter((kw) => !excludeSet.has(kw));

    return NextResponse.json({ keywords: filtered });
  } catch (error) {
    console.error("[suggest-keywords] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate keyword suggestions." },
      { status: 500 }
    );
  }
}
