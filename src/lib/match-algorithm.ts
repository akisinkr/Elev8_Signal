import { prisma } from "@/lib/db";
import type { MatchTier } from "@/generated/prisma/client";

interface MemberProfile {
  id: string;
  spDomain: string | null;
  spAction: string | null;
  spScale: string | null;
  spStage: string | null;
  spGeo: string | null;
  challengeType1: string | null;
  challengeSpec1: string | null;
  challengeType2: string | null;
  challengeSpec2: string | null;
}

interface MatchProposal {
  member1Id: string;
  member2Id: string;
  relevanceScore: number;
  reciprocityScore: number;
  contextScore: number;
  totalScore: number;
  tier: MatchTier;
  reasoning: string;
}

// ─── Relevance (45%): superpower-to-challenge alignment ───

function computeRelevance(a: MemberProfile, b: MemberProfile): number {
  let score = 0;
  let checks = 0;

  // A's superpower domain → B's challenge types
  if (a.spDomain && b.challengeType1) {
    checks++;
    if (domainMatchesChallenge(a.spDomain, b.challengeType1)) score += 1;
  }
  if (a.spDomain && b.challengeType2) {
    checks++;
    if (domainMatchesChallenge(a.spDomain, b.challengeType2)) score += 1;
  }

  // A's superpower action → B's challenge spec (fuzzy keyword match)
  if (a.spAction && b.challengeSpec1) {
    checks++;
    score += fuzzyMatch(a.spAction, b.challengeSpec1);
  }
  if (a.spAction && b.challengeSpec2) {
    checks++;
    score += fuzzyMatch(a.spAction, b.challengeSpec2);
  }

  if (checks === 0) return 30; // baseline if no data
  return Math.round((score / checks) * 100);
}

// ─── Reciprocity (30%): mutual value ───

function computeReciprocity(a: MemberProfile, b: MemberProfile): number {
  // Check both directions: can A help B AND can B help A?
  const aHelpsB = computeRelevance(a, b);
  const bHelpsA = computeRelevance(b, a);

  // Reciprocity rewards bidirectional value
  return Math.round((aHelpsB + bHelpsA) / 2);
}

// ─── Context (25%): stage, geo, availability ───

function computeContext(a: MemberProfile, b: MemberProfile): number {
  let score = 0;
  let weight = 0;

  // Stage compatibility (same or adjacent = good)
  if (a.spStage && b.spStage) {
    weight += 1;
    const stageOrder = ["seed", "ab", "cd", "preipo", "public", "conglomerate"];
    const aStages = a.spStage.split(",").map(s => s.trim());
    const bStages = b.spStage.split(",").map(s => s.trim());
    const aIdx = Math.min(...aStages.map(s => stageOrder.indexOf(s)).filter(i => i >= 0));
    const bIdx = Math.min(...bStages.map(s => stageOrder.indexOf(s)).filter(i => i >= 0));
    if (aIdx >= 0 && bIdx >= 0) {
      const diff = Math.abs(aIdx - bIdx);
      if (diff === 0) score += 1;
      else if (diff === 1) score += 0.8;
      else if (diff === 2) score += 0.5;
      else score += 0.2;
    } else {
      score += 0.5; // unknown stage
    }
  }

  // Geo overlap
  if (a.spGeo && b.spGeo) {
    weight += 1;
    const aGeos = a.spGeo.split(",").map(g => g.trim());
    const bGeos = b.spGeo.split(",").map(g => g.trim());
    const overlap = aGeos.some(g => bGeos.includes(g));
    const eitherGlobal = aGeos.includes("global") || bGeos.includes("global");
    if (overlap) score += 1;
    else if (eitherGlobal) score += 0.7;
    else score += 0.3;
  }

  // Scale compatibility
  if (a.spScale && b.spScale) {
    weight += 1;
    const scaleOrder = ["small", "mid", "large", "org", "enterprise", "portfolio"];
    const aScales = a.spScale.split(",").map(s => s.trim());
    const bScales = b.spScale.split(",").map(s => s.trim());
    const aIdx = Math.min(...aScales.map(s => scaleOrder.indexOf(s)).filter(i => i >= 0));
    const bIdx = Math.min(...bScales.map(s => scaleOrder.indexOf(s)).filter(i => i >= 0));
    if (aIdx >= 0 && bIdx >= 0) {
      const diff = Math.abs(aIdx - bIdx);
      score += diff <= 1 ? 1 : diff <= 2 ? 0.6 : 0.3;
    } else {
      score += 0.5;
    }
  }

  if (weight === 0) return 50; // baseline
  return Math.round((score / weight) * 100);
}

// ─── Helpers ───

function domainMatchesChallenge(domain: string, challengeType: string): boolean {
  const map: Record<string, string[]> = {
    "technical": ["ai-ml", "data", "cloud", "security", "platform", "fintech", "robotics"],
    "leadership": ["eng-leadership", "product"],
    "org": ["eng-leadership", "product"],
    "career": ["eng-leadership", "product", "ai-ml", "data"],
    "intro": ["eng-leadership", "product"],
  };
  const domains = domain.split(",").map(d => d.trim());
  const matchingDomains = map[challengeType] || [];
  return domains.some(d => matchingDomains.includes(d));
}

function fuzzyMatch(action: string, challengeSpec: string): number {
  const actionWords = action.toLowerCase().split(/[\s,]+/).filter(Boolean);
  const challengeWords = challengeSpec.toLowerCase().split(/[\s,]+/).filter(Boolean);
  const overlap = actionWords.filter(w => challengeWords.some(cw => cw.includes(w) || w.includes(cw)));
  if (overlap.length === 0) return 0.2; // some baseline
  return Math.min(overlap.length / Math.max(actionWords.length, 1), 1);
}

function getTier(score: number): MatchTier {
  if (score >= 92) return "PLATINUM";
  if (score >= 80) return "GOLD";
  if (score >= 68) return "SILVER";
  if (score >= 55) return "CURIOUS";
  return "SKIP";
}

// ─── Main algorithm ───

export async function generateMatches(options?: {
  relevanceWeight?: number;
  reciprocityWeight?: number;
  contextWeight?: number;
}): Promise<MatchProposal[]> {
  const weights = {
    relevance: options?.relevanceWeight ?? 0.45,
    reciprocity: options?.reciprocityWeight ?? 0.30,
    context: options?.contextWeight ?? 0.25,
  };

  // Get all active, onboarded members with superpower data
  const members = await prisma.member.findMany({
    where: {
      onboardingState: "COMPLETED",
      spDomain: { not: null },
    },
    select: {
      id: true, spDomain: true, spAction: true, spScale: true, spStage: true, spGeo: true,
      challengeType1: true, challengeSpec1: true, challengeType2: true, challengeSpec2: true,
    },
  });

  // Get existing matches to avoid duplicates
  const existingMatches = await prisma.match.findMany({
    where: { status: { notIn: ["DECLINED"] } },
    select: { member1Id: true, member2Id: true },
  });
  const existingPairs = new Set(
    existingMatches.map(m => [m.member1Id, m.member2Id].sort().join(":"))
  );

  const proposals: MatchProposal[] = [];

  // Score all possible pairs
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const a = members[i];
      const b = members[j];

      // Skip existing pairs
      const pairKey = [a.id, b.id].sort().join(":");
      if (existingPairs.has(pairKey)) continue;

      const relevance = computeRelevance(a, b);
      const reciprocity = computeReciprocity(a, b);
      const context = computeContext(a, b);

      const total = Math.round(
        relevance * weights.relevance +
        reciprocity * weights.reciprocity +
        context * weights.context
      );

      const tier = getTier(total);
      if (tier === "SKIP") continue;

      const reasoning = `Relevance: ${relevance}/100, Reciprocity: ${reciprocity}/100, Context: ${context}/100`;

      proposals.push({
        member1Id: a.id,
        member2Id: b.id,
        relevanceScore: relevance,
        reciprocityScore: reciprocity,
        contextScore: context,
        totalScore: total,
        tier,
        reasoning,
      });
    }
  }

  // Sort by total score descending
  proposals.sort((a, b) => b.totalScore - a.totalScore);

  return proposals;
}

export async function createMatchFromProposal(proposal: MatchProposal, curatorNote?: string) {
  const match = await prisma.match.create({
    data: {
      member1Id: proposal.member1Id,
      member2Id: proposal.member2Id,
      status: "PROPOSED",
      curatorNote,
      matchReason: proposal.reasoning,
    },
  });

  await prisma.matchScore.create({
    data: {
      matchId: match.id,
      relevanceScore: proposal.relevanceScore,
      reciprocityScore: proposal.reciprocityScore,
      contextScore: proposal.contextScore,
      totalScore: proposal.totalScore,
      tier: proposal.tier,
      reasoning: proposal.reasoning,
    },
  });

  return match;
}
