import { NextResponse } from "next/server";
import { requireMember } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendSlackNotification } from "@/lib/slack";
import { runXrayAnalysis } from "@/lib/xray";
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

    // When onboarding is completed, create initial confidence score
    if (data.onboardingState === "COMPLETED") {
      const fields = [
        updated.company, updated.jobTitle, updated.linkedinUrl,
        updated.spDomain, updated.spAction, updated.spScale, updated.spStage, updated.spGeo,
        updated.challengeType1, updated.challengeSpec1,
      ];
      const filledCount = fields.filter(Boolean).length;
      const completeness = Math.round((filledCount / fields.length) * 100);
      const selfDeclared = completeness * 0.3; // max 30 points

      await prisma.confidenceScore.upsert({
        where: { memberId: member.id },
        create: {
          memberId: member.id,
          selfDeclared,
          composite: selfDeclared,
        },
        update: {
          selfDeclared,
          composite: selfDeclared,
        },
      });

      const name = [updated.firstName, updated.lastName].filter(Boolean).join(" ") || "Unknown";
      sendSlackNotification(
        "newMembers",
        `🆕 *New Member Onboarded*\n• *Name:* ${name}\n• *Company:* ${updated.company || "—"}\n• *Title:* ${updated.jobTitle || "—"}\n• *Superpower:* ${updated.spDomain || "—"} / ${updated.spAction || "—"}\n• *LinkedIn:* ${updated.linkedinUrl || "—"}`
      );

      // Auto-trigger Xray analysis in background (fire-and-forget)
      if (updated.linkedinUrl) {
        runXrayAnalysis(member.id, updated.linkedinUrl).catch((err) =>
          console.error("Background Xray failed:", err)
        );
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
