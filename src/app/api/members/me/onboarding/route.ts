import { NextResponse } from "next/server";
import { requireMember } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Explicit whitelist — only fields safe to set during onboarding.
// Never allow: id, clerkId, email, memberNumber, role, passwordHash,
// peerRecognitionCount, elev8Titles, cardCompletedAt, createdAt, updatedAt.
const allowedDataSchema = z.object({
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  bio: z.string().max(2000).optional(),
  headline: z.string().max(300).optional(),
  company: z.string().max(200).optional(),
  jobTitle: z.string().max(200).optional(),
  linkedinUrl: z.string().url().max(500).optional(),
  knownFor: z.string().max(500).optional(),
  preferredLang: z.enum(["en", "kr"]).optional(),
  onboardingState: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]).optional(),
  superpowers: z.array(z.string().max(200)).max(10).optional(),
  superpowerDetails: z.array(z.string().max(500)).max(10).optional(),
  challenges: z.array(z.string().max(200)).max(10).optional(),
  challengeDetails: z.array(z.string().max(500)).max(10).optional(),
  dreamConnection: z.string().max(1000).optional(),
  spDomain: z.string().max(100).optional(),
  spAction: z.string().max(100).optional(),
  spScale: z.string().max(100).optional(),
  spStage: z.string().max(100).optional(),
  spGeo: z.string().max(100).optional(),
  spDomainCustom: z.string().max(200).optional(),
  spActionCustom: z.string().max(200).optional(),
  superpowersKr: z.array(z.string().max(200)).max(10).optional(),
  superpowerDetailsKr: z.array(z.string().max(500)).max(10).optional(),
  challengesKr: z.array(z.string().max(200)).max(10).optional(),
  challengeDetailsKr: z.array(z.string().max(500)).max(10).optional(),
  dreamConnectionKr: z.string().max(1000).optional(),
});

const onboardingSchema = z.object({
  step: z.number().min(0).max(7),
  data: allowedDataSchema,
});

export async function PATCH(req: Request) {
  try {
    const member = await requireMember();
    const body = await req.json();
    const { step, data } = onboardingSchema.parse(body);

    const updated = await prisma.member.update({
      where: { id: member.id },
      data: {
        onboardingStep: step,
        ...data,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
