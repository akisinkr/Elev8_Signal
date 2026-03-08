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
  // typed challenges
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

    const updated = await prisma.member.update({
      where: { id: member.id },
      data: {
        // 5 dimensions
        spDomain: data.spDomain || member.spDomain,
        spAction: data.spAction || member.spAction,
        spScale: data.spScale || member.spScale,
        spStage: data.spStage || member.spStage,
        spGeo: data.spGeo || member.spGeo,
        spDomainCustom: data.spDomainCustom || null,
        spActionCustom: data.spActionCustom || null,
        // typed challenges
        challengeType1: data.challengeType1 || null,
        challengeSpec1: data.challengeSpec1 || null,
        challengeType2: data.challengeType2 || null,
        challengeSpec2: data.challengeSpec2 || null,
        // legacy arrays
        superpowers: data.superpowers || member.superpowers,
        superpowerDetails: data.superpowerDetails || [],
        challenges: data.challenges || member.challenges,
        challengeDetails: data.challengeDetails || [],
        dreamConnection: data.dreamConnection || member.dreamConnection,
        dreamConnectionRefined: data.dreamConnectionRefined || null,
        preferredLang: data.preferredLang || member.preferredLang,
        superpowersKr: data.superpowersKr || [],
        superpowerDetailsKr: data.superpowerDetailsKr || [],
        challengesKr: data.challengesKr || [],
        challengeDetailsKr: data.challengeDetailsKr || [],
        dreamConnectionKr: data.dreamConnectionKr || null,
        dreamConnectionRefinedKr: data.dreamConnectionRefinedKr || null,
        knownFor: data.knownFor || member.knownFor,
        bio: data.bio || member.bio,
        company: data.company || member.company,
        jobTitle: data.jobTitle || member.jobTitle,
        linkedinUrl: data.linkedinUrl || member.linkedinUrl,
        customPhotoUrl: data.customPhotoUrl || member.customPhotoUrl,
        cardCompletedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Card save error:", error);
    return NextResponse.json(
      { error: "Failed to save profile. Please try again." },
      { status: 500 }
    );
  }
}
