import { prisma } from "@/lib/db";
import { recalculateConfidence } from "@/lib/confidence";
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

export async function runXrayAnalysis(memberId: string, linkedinUrl: string): Promise<void> {
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
    // Get member context for enrichment
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: {
        firstName: true, lastName: true, company: true, jobTitle: true,
        spDomain: true, spAction: true, bio: true, headline: true,
      },
    });

    if (!member) throw new Error("Member not found");

    const anthropic = new Anthropic();

    const prompt = `Analyze this professional's profile and provide a 6-bucket analysis.

Profile:
- Name: ${member.firstName} ${member.lastName}
- Title: ${member.jobTitle || "Unknown"}
- Company: ${member.company || "Unknown"}
- LinkedIn: ${linkedinUrl}
- Self-declared domain: ${member.spDomain || "Not specified"}
- Self-declared action: ${member.spAction || "Not specified"}
- Bio: ${member.bio || member.headline || "Not provided"}

Analyze across these 6 buckets, scoring each 0-100 with evidence:

1. Career Trajectory - Career progression, role growth, impact of transitions
2. Domain Expertise - Depth and breadth of technical/domain knowledge
3. Leadership & Influence - Team leadership, thought leadership, industry influence
4. Innovation & Problem-Solving - Novel approaches, creative solutions, patents/publications
5. Network & Community - Professional network quality, community contributions, mentoring
6. Growth Potential - Trajectory direction, learning velocity, adaptability

Return JSON only:
{
  "summary": "2-3 sentence English summary of this person's professional profile",
  "summaryKr": "Same summary in Korean",
  "buckets": [
    {
      "bucket": "career_trajectory",
      "score": 75,
      "evidence": ["evidence point 1", "evidence point 2"],
      "highlights": ["key highlight 1"]
    }
  ]
}`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");

    const result: XrayResult = JSON.parse(jsonMatch[0]);

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

  } catch (error) {
    console.error("Xray analysis error:", error);
    await prisma.xrayProfile.update({
      where: { id: xray.id },
      data: { status: "FAILED" },
    });
    throw error;
  }
}

export { BUCKETS, BUCKET_LABELS };
