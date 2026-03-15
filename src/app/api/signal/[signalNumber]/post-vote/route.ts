import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMemberSession } from "@/lib/member-auth";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ signalNumber: string }> }
) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    const { signalNumber } = await params;
    const num = parseInt(signalNumber, 10);
    if (isNaN(num)) {
      return NextResponse.json({ error: "Invalid signal number" }, { status: 400 });
    }

    // Get signal with vote count
    const signal = await prisma.signalQuestion.findUnique({
      where: { signalNumber: num },
      include: { votes: { select: { id: true } } },
    });
    if (!signal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    // Session-based auth required — email alone is not sufficient
    const sessionMember = await getMemberSession();
    if (!sessionMember) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }
    const member = sessionMember;
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 403 });
    }

    // Get the member's vote on this signal
    const memberVote = await prisma.signalVote.findUnique({
      where: { questionId_memberId: { questionId: signal.id, memberId: member.id } },
    });

    // Find superpower matches — up to 3 members whose expertise could help
    const matchedMembers = await findSuperpowerMatches(member.id, member.challengeType1 || member.adviceSeeking, 3);

    // Build response
    const voteCount = signal.votes.length;
    const deadline = signal.voteDeadline?.toISOString() ?? null;

    // Map the member's answer to option text
    let yourPickLabel: string | null = null;
    if (memberVote) {
      const optionMap: Record<string, string> = {
        A: signal.optionA,
        B: signal.optionB,
        C: signal.optionC,
        D: signal.optionD,
        E: signal.optionE,
      };
      yourPickLabel = optionMap[memberVote.answer] ?? null;
    }

    const matches = matchedMembers.map((m) => ({
      id: m.id,
      initial: m.firstName?.charAt(0)?.toUpperCase() ?? "?",
      headline: buildAnonymousHeadline(m),
      superpower: buildSuperpowerLine(m),
      canHelpWith: buildCanHelpWith(m),
      spScale: formatScale(m.spScale) ?? null,
      spStage: formatStage(m.spStage) ?? null,
      challengeSpec1: m.challengeSpec1 ?? null,
      elev8Titles: (m.elev8Titles as string[]) ?? [],
    }));

    return NextResponse.json({
      voteCount,
      deadline,
      yourPick: memberVote?.answer ?? null,
      yourPickLabel,
      signalStatus: signal.status,
      match: matches[0] ?? null,
      matches,
      cardCompleted: !!member.cardCompletedAt,
      memberFirstName: member.firstName ?? null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("Post-vote error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// --- Matching logic ---

async function findSuperpowerMatches(excludeMemberId: string, challengeType: string | null, limit: number) {
  // Find members with filled superpower data, excluding self
  const candidates = await prisma.member.findMany({
    where: {
      id: { not: excludeMemberId },
      spDomain: { not: null },
      spAction: { not: null },
    },
    select: {
      id: true,
      firstName: true,
      company: true,
      jobTitle: true,
      spDomain: true,
      spAction: true,
      spScale: true,
      spStage: true,
      spGeo: true,
      challengeType1: true,
      challengeSpec1: true,
      elev8Titles: true,
    },
  });

  if (candidates.length === 0) return [];

  // Shuffle candidates for variety
  const shuffled = candidates.sort(() => Math.random() - 0.5);

  // If the member has a challenge type, prioritize relevant matches
  if (challengeType) {
    const domainMap: Record<string, string[]> = {
      technical: ["AI & Machine Learning", "Engineering", "Cloud & Infrastructure", "Data & Analytics"],
      leadership: ["Scaling Teams", "Org Design", "Executive Leadership", "People Management"],
      org: ["Org Design", "Scaling Teams", "Change Management", "Culture"],
      career: ["Executive Leadership", "Career Transition", "Board & Advisory"],
      intro: ["Networking", "Business Development", "Partnerships"],
    };
    const relevantDomains = domainMap[challengeType] || [];
    const relevant = shuffled.filter(
      (c) => c.spDomain && relevantDomains.some((d) => c.spDomain!.toLowerCase().includes(d.toLowerCase()))
    );
    const others = shuffled.filter((c) => !relevant.includes(c));
    // Prioritize relevant, fill with others
    return [...relevant, ...others].slice(0, limit);
  }

  return shuffled.slice(0, limit);
}

// ── Display formatters ──
// Convert raw DB tags (comma-separated IDs) into human-readable labels.

const DOMAIN_LABELS: Record<string, string> = {
  "ai-ml": "AI & Machine Learning",
  data: "Data & Analytics",
  cloud: "Cloud & Infrastructure",
  security: "Cybersecurity",
  platform: "Platform Engineering",
  product: "Product & Growth",
  "eng-leadership": "Engineering Leadership",
  fintech: "FinTech & Payments",
  robotics: "Robotics & Physical AI",
  other: "Cross-functional",
};

const ACTION_LABELS: Record<string, string> = {
  scaling: "Scaling Teams",
  building: "Building from Zero",
  architecture: "Architecture & System Design",
  migrating: "Migrating & Modernizing",
  optimizing: "Optimizing & Improving",
  "org-design": "Org Design & Restructuring",
  gtm: "Launching & Go-to-Market",
  hiring: "Hiring & Talent Strategy",
  compliance: "Compliance & Regulation",
  mna: "M&A & Integration",
  crisis: "Crisis & Turnaround",
  strategy: "Strategy & Roadmapping",
};

const SCALE_LABELS: Record<string, string> = {
  small: "Small team (1-10)",
  mid: "Mid-size team (10-50)",
  large: "Large team (50-200)",
  org: "Organization (200-1000)",
  enterprise: "Enterprise (1000+)",
  portfolio: "Multi-entity / Portfolio",
};

const STAGE_LABELS: Record<string, string> = {
  seed: "Pre-seed / Seed",
  ab: "Series A-B",
  cd: "Series C-D",
  preipo: "Pre-IPO / Late stage",
  public: "Public company",
  conglomerate: "Enterprise / Conglomerate",
};

function formatTags(raw: string, labels: Record<string, string>): string {
  return raw
    .split(",")
    .map((tag) => labels[tag.trim()] || tag.trim())
    .join(" · ");
}

function buildAnonymousHeadline(member: { jobTitle?: string | null; company?: string | null }): string {
  if (member.jobTitle && member.company) {
    return `${member.jobTitle} at a leading tech company`;
  }
  if (member.jobTitle) return member.jobTitle;
  return "Senior Tech Leader";
}

function buildSuperpowerLine(member: { spDomain?: string | null; spAction?: string | null }): string {
  const domain = member.spDomain ? formatTags(member.spDomain, DOMAIN_LABELS) : null;
  const action = member.spAction ? formatTags(member.spAction, ACTION_LABELS) : null;
  const parts = [domain, action].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "Cross-functional Leadership";
}

function formatScale(raw: string | null): string | null {
  if (!raw) return null;
  return formatTags(raw, SCALE_LABELS);
}

function formatStage(raw: string | null): string | null {
  if (!raw) return null;
  return formatTags(raw, STAGE_LABELS);
}

function buildCanHelpWith(member: { spAction?: string | null; spDomain?: string | null }): string {
  if (member.spAction) return formatTags(member.spAction, ACTION_LABELS);
  if (member.spDomain) return formatTags(member.spDomain, DOMAIN_LABELS);
  return "Strategic leadership challenges";
}
