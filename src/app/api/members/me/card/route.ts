import { NextResponse } from "next/server";
import { requireMember } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const cardSchema = z.object({
  // 5 dimensions (comma-separated multi-select values)
  spDomain: z.string().max(500).optional(),
  spAction: z.string().max(500).optional(),
  spScale: z.string().max(500).optional(),
  spStage: z.string().max(500).optional(),
  spGeo: z.string().max(500).optional(),
  spDomainCustom: z.string().max(200).optional(),
  spActionCustom: z.string().max(200).optional(),
  spGeoCustom: z.string().max(200).optional(),
  // conversational questions (Q1-Q3)
  knownForDetail: z.string().max(1000).optional(),
  adviceSeeking: z.string().max(1000).optional(),
  passionTopic: z.string().max(1000).optional(),
  // typed challenges (deprecated)
  challengeType1: z.string().max(100).optional(),
  challengeSpec1: z.string().max(500).optional(),
  challengeType2: z.string().max(100).optional(),
  challengeSpec2: z.string().max(500).optional(),
  // legacy arrays
  superpowers: z.array(z.string().max(500)).optional(),
  superpowerDetails: z.array(z.string().max(2000)).optional(),
  challenges: z.array(z.string().max(500)).optional(),
  challengeDetails: z.array(z.string().max(2000)).optional(),
  dreamConnection: z.string().max(500).optional(),
  dreamConnectionRefined: z.string().max(1000).optional(),
  preferredLang: z.enum(["en", "kr"]).optional(),
  superpowersKr: z.array(z.string().max(500)).optional(),
  superpowerDetailsKr: z.array(z.string().max(2000)).optional(),
  challengesKr: z.array(z.string().max(500)).optional(),
  challengeDetailsKr: z.array(z.string().max(2000)).optional(),
  dreamConnectionKr: z.string().max(500).optional(),
  dreamConnectionRefinedKr: z.string().max(1000).optional(),
  knownFor: z.string().max(200).optional(),
  company: z.string().max(200).optional(),
  jobTitle: z.string().max(200).optional(),
  linkedinUrl: z.string().max(500).optional(),
  customPhotoUrl: z.string().max(500).optional(),
  bio: z.string().max(2000).optional(),
});

export async function PUT(req: Request) {
  try {
    const member = await requireMember();
    const body = await req.json();
    const data = cardSchema.parse(body);

    // Derive default Elev8 Title from superpower actions
    const actionToTitle: Record<string, string> = {
      architecture: "architect",
      building: "architect",
      migrating: "architect",
      optimizing: "architect",
      scaling: "advisor",
      "org-design": "advisor",
      hiring: "advisor",
      strategy: "advisor",
      compliance: "navigator",
      mna: "navigator",
      gtm: "catalyst",
      crisis: "catalyst",
    };
    const spActionValue = data.spAction || member.spAction || "";
    const actions = spActionValue.split(",").map((a: string) => a.trim()).filter(Boolean);
    const existingTitles = member.elev8Titles ?? [];
    const derivedTitles = new Set(existingTitles);
    for (const action of actions) {
      if (actionToTitle[action]) {
        derivedTitles.add(actionToTitle[action]);
      }
    }
    if (derivedTitles.size === 0 && actions.length > 0) {
      derivedTitles.add("connector");
    }
    const elev8Titles = Array.from(derivedTitles);

    // ── Superpower History: track when superpower changes ──
    const newSpDetails = data.superpowerDetails || [];
    let newTitle = "";
    if (newSpDetails.length > 0) {
      try {
        const parsed = JSON.parse(newSpDetails[0]);
        newTitle = parsed.title || "";
      } catch {
        newTitle = newSpDetails[0] || "";
      }
    }

    // Check if superpower title changed (for history tracking)
    let oldTitle = "";
    if (member.superpowerDetails && member.superpowerDetails.length > 0) {
      try {
        const parsed = JSON.parse(member.superpowerDetails[0]);
        oldTitle = parsed.title || "";
      } catch {
        oldTitle = member.superpowerDetails[0] || "";
      }
    }

    const superpowerHistory = [...(member.superpowerHistory || [])];
    const superpowerChanged = oldTitle && newTitle && oldTitle !== newTitle;
    if (superpowerChanged) {
      superpowerHistory.push(JSON.stringify({
        title: oldTitle,
        date: new Date().toISOString(),
      }));
    }

    const updated = await prisma.member.update({
      where: { id: member.id },
      data: {
        elev8Titles,
        // 5 dimensions — use ?? so empty strings can clear fields
        spDomain: data.spDomain !== undefined ? data.spDomain : member.spDomain,
        spAction: data.spAction !== undefined ? data.spAction : member.spAction,
        spScale: data.spScale !== undefined ? data.spScale : member.spScale,
        spStage: data.spStage !== undefined ? data.spStage : member.spStage,
        spGeo: data.spGeo !== undefined ? data.spGeo : member.spGeo,
        spDomainCustom: data.spDomainCustom ?? null,
        spActionCustom: data.spActionCustom ?? null,
        spGeoCustom: data.spGeoCustom ?? null,
        // conversational questions (Q1-Q3)
        knownForDetail: data.knownForDetail !== undefined ? data.knownForDetail : member.knownForDetail,
        adviceSeeking: data.adviceSeeking !== undefined ? data.adviceSeeking : member.adviceSeeking,
        passionTopic: data.passionTopic !== undefined ? data.passionTopic : member.passionTopic,
        // typed challenges (deprecated)
        challengeType1: data.challengeType1 ?? null,
        challengeSpec1: data.challengeSpec1 ?? null,
        challengeType2: data.challengeType2 ?? null,
        challengeSpec2: data.challengeSpec2 ?? null,
        // legacy arrays
        superpowers: data.superpowers ?? member.superpowers,
        superpowerDetails: data.superpowerDetails ?? [],
        challenges: data.challenges ?? member.challenges,
        challengeDetails: data.challengeDetails ?? [],
        dreamConnection: data.dreamConnection !== undefined ? data.dreamConnection : member.dreamConnection,
        dreamConnectionRefined: data.dreamConnectionRefined ?? null,
        preferredLang: data.preferredLang ?? member.preferredLang,
        superpowersKr: data.superpowersKr ?? [],
        superpowerDetailsKr: data.superpowerDetailsKr ?? [],
        challengesKr: data.challengesKr ?? [],
        challengeDetailsKr: data.challengeDetailsKr ?? [],
        dreamConnectionKr: data.dreamConnectionKr ?? null,
        dreamConnectionRefinedKr: data.dreamConnectionRefinedKr ?? null,
        knownFor: data.knownFor !== undefined ? data.knownFor : member.knownFor,
        bio: data.bio !== undefined ? data.bio : member.bio,
        company: data.company !== undefined ? data.company : member.company,
        jobTitle: data.jobTitle !== undefined ? data.jobTitle : member.jobTitle,
        linkedinUrl: data.linkedinUrl !== undefined ? data.linkedinUrl : member.linkedinUrl,
        customPhotoUrl: data.customPhotoUrl !== undefined ? data.customPhotoUrl : member.customPhotoUrl,
        // Only set cardCompletedAt on first completion
        cardCompletedAt: member.cardCompletedAt ?? new Date(),
        // Living credential fields
        superpowerUpdatedAt: new Date(),
        lastActiveAt: new Date(),
        superpowerHistory,
      },
    });

    // ── Return stats for post-completion screen ──
    const [totalMembers, domainPeerCount] = await Promise.all([
      prisma.member.count({ where: { cardCompletedAt: { not: null } } }),
      data.spDomain
        ? prisma.member.count({
            where: {
              cardCompletedAt: { not: null },
              spDomain: data.spDomain,
              id: { not: member.id },
            },
          })
        : Promise.resolve(0),
    ]);

    return NextResponse.json({
      ...updated,
      totalMembers,
      domainPeerCount,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Card save error:", errMsg, error);
    return NextResponse.json(
      { error: "Failed to save profile. Please try again." },
      { status: 500 }
    );
  }
}
