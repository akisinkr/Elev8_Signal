import { prisma } from "@/lib/db";
import { recalculateConfidence } from "@/lib/confidence";
import {
  fetchLinkedInProfile,
  assessLinkedInCompleteness,
  formatLinkedInForPrompt,
  type LinkedInProfile,
} from "@/lib/enrich-layer";
import Anthropic from "@anthropic-ai/sdk";

const BUCKETS = [
  "career_trajectory",
  "domain_expertise",
  "leadership",
  "innovation",
  "network",
  "growth_potential",
] as const;

const BUCKET_LABELS: Record<string, string> = {
  career_trajectory: "Career Trajectory",
  domain_expertise: "Domain Expertise",
  leadership: "Leadership & Influence",
  innovation: "Innovation & Problem-Solving",
  network: "Network & Community",
  growth_potential: "Growth Potential",
};

interface BucketAnalysis {
  bucket: string;
  score: number;
  evidence: string[];
  highlights: string[];
}

interface XrayResult {
  summary: string;
  summaryKr: string;
  buckets: BucketAnalysis[];
}

// 30-day cache window for LinkedIn data
const LINKEDIN_CACHE_DAYS = 30;

/**
 * Xray v2: 3-phase pipeline
 * Phase 1: Data collection (Enrich Layer API + member DB query) — parallel
 * Phase 2: Research (Claude + web_search) — company, industry, role context
 * Phase 3: Synthesis (Claude → structured JSON) — 6 bucket scores
 */
export async function runXrayAnalysis(memberId: string, linkedinUrl: string): Promise<void> {
  // Prevent duplicate concurrent runs
  const existing = await prisma.xrayProfile.findUnique({
    where: { id: `${memberId}-latest` },
    select: { status: true },
  });
  if (existing?.status === "PROCESSING") {
    console.log(`[Xray] Already processing for member ${memberId}, skipping`);
    return;
  }

  // Create or update XrayProfile as PROCESSING
  const xray = await prisma.xrayProfile.upsert({
    where: { id: `${memberId}-latest` },
    create: {
      id: `${memberId}-latest`,
      memberId,
      linkedinUrl,
      status: "PROCESSING",
    },
    update: {
      status: "PROCESSING",
      linkedinUrl,
    },
  });

  try {
    // ═══════════════════════════════════════════════════════════
    // PHASE 1: DATA COLLECTION (parallel)
    // ═══════════════════════════════════════════════════════════

    const [member, linkedinProfile] = await Promise.all([
      fetchMemberData(memberId),
      fetchOrCacheLinkedIn(xray.id, linkedinUrl),
    ]);

    if (!member) throw new Error("Member not found");

    const linkedinCompleteness = linkedinProfile
      ? assessLinkedInCompleteness(linkedinProfile)
      : null;

    console.log(
      `[Xray] Phase 1 complete — LinkedIn: ${linkedinCompleteness?.tier || "unavailable"} (${linkedinCompleteness?.score || 0}/100)`
    );

    // ═══════════════════════════════════════════════════════════
    // PHASE 2: RESEARCH (Claude + web_search)
    // ═══════════════════════════════════════════════════════════

    const researchFindings = await runResearchPhase(member, linkedinProfile);

    console.log(`[Xray] Phase 2 complete — research gathered (${researchFindings.length} chars)`);

    // Wait 60s to avoid rate limit (30K input tokens/min)
    console.log("[Xray] Waiting 60s for rate limit cooldown...");
    await new Promise((r) => setTimeout(r, 60000));

    // ═══════════════════════════════════════════════════════════
    // PHASE 3: SYNTHESIS (Claude → structured JSON)
    // ═══════════════════════════════════════════════════════════

    const result = await runSynthesisPhase(
      member,
      linkedinProfile,
      linkedinCompleteness?.tier || "minimal",
      researchFindings
    );

    console.log(`[Xray] Phase 3 complete — ${result.buckets.length} buckets scored`);

    // Save bucket scores
    for (const bucket of result.buckets) {
      await prisma.bucketScore.upsert({
        where: {
          xrayProfileId_bucket: {
            xrayProfileId: xray.id,
            bucket: bucket.bucket,
          },
        },
        create: {
          xrayProfileId: xray.id,
          bucket: bucket.bucket,
          score: bucket.score,
          evidence: bucket.evidence,
          highlights: bucket.highlights,
        },
        update: {
          score: bucket.score,
          evidence: bucket.evidence,
          highlights: bucket.highlights,
        },
      });
    }

    // Update XrayProfile as COMPLETED
    await prisma.xrayProfile.update({
      where: { id: xray.id },
      data: {
        status: "COMPLETED",
        summary: result.summary,
        summaryKr: result.summaryKr,
        rawData: JSON.parse(JSON.stringify(result)),
        analyzedAt: new Date(),
      },
    });

    // Recalculate full confidence score (all 3 layers)
    await recalculateConfidence(memberId);

    console.log(`[Xray] Analysis complete for member ${memberId}`);
  } catch (error) {
    console.error("[Xray] Analysis error:", error);
    await prisma.xrayProfile.update({
      where: { id: xray.id },
      data: { status: "FAILED" },
    });
    throw error;
  }
}

// ─── Phase 1 Helpers ──────────────────────────────────────

interface MemberContext {
  firstName: string;
  lastName: string;
  company: string | null;
  jobTitle: string | null;
  linkedinUrl: string | null;
  bio: string | null;
  headline: string | null;
  knownFor: string | null;
  spDomain: string | null;
  spAction: string | null;
  spScale: string | null;
  spStage: string | null;
  spGeo: string | null;
  knownForDetail: string | null;
  adviceSeeking: string | null;
  passionTopic: string | null;
  superpowers: string[];
  challenges: string[];
}

async function fetchMemberData(memberId: string): Promise<MemberContext | null> {
  return prisma.member.findUnique({
    where: { id: memberId },
    select: {
      firstName: true,
      lastName: true,
      company: true,
      jobTitle: true,
      linkedinUrl: true,
      bio: true,
      headline: true,
      knownFor: true,
      spDomain: true,
      spAction: true,
      spScale: true,
      spStage: true,
      spGeo: true,
      knownForDetail: true,
      adviceSeeking: true,
      passionTopic: true,
      superpowers: true,
      challenges: true,
    },
  });
}

/**
 * Fetch LinkedIn data via Enrich Layer, with 30-day cache.
 * Stores raw data in XrayProfile.linkedinData for reuse.
 */
async function fetchOrCacheLinkedIn(
  xrayId: string,
  linkedinUrl: string
): Promise<LinkedInProfile | null> {
  // Check cache: existing XrayProfile with recent linkedinData
  const existing = await prisma.xrayProfile.findUnique({
    where: { id: xrayId },
    select: { linkedinData: true, linkedinFetchedAt: true },
  });

  if (existing?.linkedinData && existing.linkedinFetchedAt) {
    const daysSinceFetch =
      (Date.now() - existing.linkedinFetchedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceFetch < LINKEDIN_CACHE_DAYS) {
      console.log(`[Xray] Using cached LinkedIn data (${Math.round(daysSinceFetch)}d old)`);
      return existing.linkedinData as unknown as LinkedInProfile;
    }
  }

  // Fetch fresh data from Enrich Layer
  console.log(`[Xray] Fetching LinkedIn profile from Enrich Layer...`);
  const profile = await fetchLinkedInProfile(linkedinUrl);

  // Cache regardless of analysis outcome
  if (profile) {
    await prisma.xrayProfile.update({
      where: { id: xrayId },
      data: {
        linkedinData: JSON.parse(JSON.stringify(profile)),
        linkedinFetchedAt: new Date(),
      },
    });
  }

  return profile;
}

// ─── Phase 2: Research ────────────────────────────────────

async function runResearchPhase(
  member: MemberContext,
  linkedinProfile: LinkedInProfile | null
): Promise<string> {
  const anthropic = new Anthropic();

  const currentRole = linkedinProfile?.occupation || member.jobTitle || "Unknown";
  const currentCompany = linkedinProfile?.experiences?.[0]?.company || member.company || "Unknown";
  const industry = member.spDomain || "Technology";

  const systemPrompt = `You are a research analyst preparing intelligence on a senior professional for an executive networking community.

Your task: Research this person's professional context to inform a detailed profile analysis.

Research these 4 areas:
1. **Company** — What does ${currentCompany} do? Recent funding, news, competitors, growth stage, notable achievements.
2. **Industry** — What are the key trends in ${industry}? AI disruption, regulatory changes, market shifts.
3. **Role** — How is the role of "${currentRole}" evolving? What skills are becoming critical? Career ceilings?
4. **Market Context** — Any relevant macro-economic, geopolitical, or cultural dynamics affecting this person's domain?

Be specific and factual. Include numbers, dates, and sources where possible.
Output your findings as structured text with clear section headers.
Do NOT provide scores or ratings — just research findings.`;

  const userContent = buildResearchPrompt(member, linkedinProfile);

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      tools: [
        {
          type: "web_search_20250305" as const,
          name: "web_search",
        },
      ],
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
    });

    // Extract all text blocks from the response (Claude may interleave tool use and text)
    const textBlocks = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text);

    return textBlocks.join("\n\n") || "No research findings available.";
  } catch (error) {
    console.error("[Xray] Phase 2 research failed:", error);
    // Degraded mode: continue without research
    return "Research phase failed — analysis will proceed with available data only.";
  }
}

function buildResearchPrompt(
  member: MemberContext,
  linkedinProfile: LinkedInProfile | null
): string {
  const parts: string[] = [];

  parts.push(`Research this professional's context:`);
  parts.push(`Name: ${member.firstName} ${member.lastName}`);
  parts.push(`Current Role: ${member.jobTitle || linkedinProfile?.occupation || "Unknown"}`);
  parts.push(
    `Company: ${member.company || linkedinProfile?.experiences?.[0]?.company || "Unknown"}`
  );

  if (linkedinProfile) {
    if (linkedinProfile.headline) parts.push(`LinkedIn Headline: ${linkedinProfile.headline}`);
    if (linkedinProfile.location_str) parts.push(`Location: ${linkedinProfile.location_str}`);
    if (linkedinProfile.experiences.length > 0) {
      parts.push(`\nCareer history (last ${Math.min(linkedinProfile.experiences.length, 5)} roles):`);
      for (const exp of linkedinProfile.experiences.slice(0, 5)) {
        parts.push(`  - ${exp.title} at ${exp.company}`);
      }
    }
  }

  if (member.spDomain) parts.push(`Self-declared domain: ${member.spDomain}`);
  if (member.spAction) parts.push(`Self-declared strength: ${member.spAction}`);

  parts.push(
    `\nSearch for recent information about this person, their company, and their industry. Focus on facts that would help assess their professional standing and trajectory.`
  );

  return parts.join("\n");
}

// ─── Phase 3: Synthesis ───────────────────────────────────

async function runSynthesisPhase(
  member: MemberContext,
  linkedinProfile: LinkedInProfile | null,
  linkedinTier: "rich" | "basic" | "minimal",
  researchFindings: string
): Promise<XrayResult> {
  const anthropic = new Anthropic();

  // Dynamic weighting based on LinkedIn completeness
  const weights =
    linkedinTier === "rich"
      ? { linkedin: 40, selfDeclared: 30, research: 30 }
      : linkedinTier === "basic"
        ? { linkedin: 30, selfDeclared: 35, research: 35 }
        : { linkedin: 15, selfDeclared: 50, research: 35 };

  const systemPrompt = `You are an expert analyst for Elev8, an invite-only community of senior tech executives bridging the US and Korea.

Your task: Analyze this member and produce scores for 6 professional buckets.

## Data Sources & Weighting
You have 3 data sources. Weight them as follows:
- LinkedIn data: ${weights.linkedin}% (tier: ${linkedinTier})
- Self-declared data: ${weights.selfDeclared}%
- Web research: ${weights.research}%

## Critical Rules
1. **Never penalize thin LinkedIn** — absence of data ≠ evidence against. If LinkedIn is minimal, rely more heavily on self-declared data and research.
2. **Tag evidence sources** — prefix each evidence point with [LinkedIn], [Self-declared], or [Research].
3. **Aim for Level 2-3 insights** — don't state the obvious. Connect dots between data sources.
   - Level 1 (BAD): "They work in tech"
   - Level 2 (OK): "Their transition from consulting to product leadership shows strategic pivot capability"
   - Level 3 (GREAT): "The combination of McKinsey rigor + startup scaling at a Korean unicorn positions them uniquely to bridge operational gaps that most US-Korea tech partnerships struggle with"
4. **Score fairly** — 50 is average for a senior professional. 70+ means genuinely impressive. 85+ means exceptional.
5. **Be bilingual** — summary in English, summaryKr in Korean.

## The 6 Buckets (score each 0-100)
1. **career_trajectory** — Career progression, role growth, impact of transitions, velocity
2. **domain_expertise** — Depth and breadth of technical/domain knowledge
3. **leadership** — Team leadership, thought leadership, industry influence
4. **innovation** — Novel approaches, creative solutions, patents/publications, problem-solving
5. **network** — Professional network quality, community contributions, cross-border reach
6. **growth_potential** — Trajectory direction, learning velocity, adaptability, future ceiling

## Output Format (JSON only, no other text)
{
  "summary": "2-3 sentence English summary capturing this person's unique professional identity and value to the community",
  "summaryKr": "Same summary in Korean (natural, not Google Translate quality)",
  "buckets": [
    {
      "bucket": "career_trajectory",
      "score": 75,
      "evidence": ["[LinkedIn] evidence point 1", "[Research] evidence point 2", "[Self-declared] evidence point 3"],
      "highlights": ["key highlight that makes this person stand out"]
    }
  ]
}`;

  const userContent = buildSynthesisPrompt(member, linkedinProfile, researchFindings);

  // Retry up to 3 times on rate limit errors
  let response;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 3000,
        messages: [{ role: "user", content: userContent }],
        system: systemPrompt,
      });
      break;
    } catch (error: unknown) {
      const isRateLimit = (error instanceof Error && error.message.includes("429")) ||
        (error && typeof error === "object" && "status" in error && (error as { status: number }).status === 429);
      if (isRateLimit && attempt < 2) {
        const wait = 60000 * (attempt + 1);
        console.log(`[Xray] Phase 3 rate limited, waiting ${wait / 1000}s (attempt ${attempt + 1}/3)...`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      throw error;
    }
  }

  if (!response) throw new Error("Phase 3 failed after retries");

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Invalid AI response — no JSON found");

  let result: XrayResult;
  try {
    result = JSON.parse(jsonMatch[0]);
  } catch (parseError) {
    throw new Error(`Failed to parse AI response as JSON: ${(parseError as Error).message}`);
  }

  // Validate all 6 buckets are present
  const resultBuckets = new Set(result.buckets.map((b) => b.bucket));
  for (const bucket of BUCKETS) {
    if (!resultBuckets.has(bucket)) {
      result.buckets.push({
        bucket,
        score: 50,
        evidence: ["[System] Insufficient data for detailed scoring"],
        highlights: [],
      });
    }
  }

  return result;
}

function buildSynthesisPrompt(
  member: MemberContext,
  linkedinProfile: LinkedInProfile | null,
  researchFindings: string
): string {
  const sections: string[] = [];

  // Self-declared data
  sections.push("═══ SELF-DECLARED DATA ═══");
  sections.push(`Name: ${member.firstName} ${member.lastName}`);
  if (member.company) sections.push(`Company: ${member.company}`);
  if (member.jobTitle) sections.push(`Title: ${member.jobTitle}`);
  if (member.bio || member.headline) sections.push(`Bio: ${member.bio || member.headline}`);
  if (member.knownFor) sections.push(`Known For: ${member.knownFor}`);

  // 5D Superpower
  const sp = [member.spDomain, member.spAction, member.spScale, member.spStage, member.spGeo].filter(Boolean);
  if (sp.length > 0) sections.push(`5D Superpower: ${sp.join(" · ")}`);

  // Q1-Q3
  if (member.knownForDetail) sections.push(`Q1 (Known for at work): ${member.knownForDetail}`);
  if (member.adviceSeeking) sections.push(`Q2 (Advice seeking): ${member.adviceSeeking}`);
  if (member.passionTopic) sections.push(`Q3 (Passion topic): ${member.passionTopic}`);

  if (member.superpowers.length > 0) sections.push(`Superpowers: ${member.superpowers.join(", ")}`);
  if (member.challenges.length > 0) sections.push(`Challenges: ${member.challenges.join(", ")}`);

  // LinkedIn data
  sections.push("\n═══ LINKEDIN DATA ═══");
  if (linkedinProfile) {
    sections.push(formatLinkedInForPrompt(linkedinProfile));
  } else {
    sections.push("No LinkedIn data available — do NOT penalize for this.");
  }

  // Research findings
  sections.push("\n═══ WEB RESEARCH FINDINGS ═══");
  sections.push(researchFindings);

  sections.push(
    "\n═══ INSTRUCTIONS ═══\nAnalyze this member across all 6 buckets. Return ONLY the JSON output as specified in the system prompt."
  );

  return sections.join("\n");
}

export { BUCKETS, BUCKET_LABELS };
