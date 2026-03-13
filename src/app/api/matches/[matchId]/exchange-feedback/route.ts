import { NextResponse } from "next/server";
import { requireMember } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const feedbackSchema = z.object({
  responses: z.array(z.object({
    questionKey: z.enum(["THE_GIFT", "THE_SPARK", "THE_FORWARD", "THE_COFFEE", "THE_BRIDGE"]),
    response: z.string().min(1).max(2000),
  })).length(5),
  recommend: z.boolean().nullable(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const member = await requireMember();
    const { matchId } = await params;
    const body = await req.json();
    const { responses, recommend } = feedbackSchema.parse(body);

    // Verify member belongs to this match
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [{ member1Id: member.id }, { member2Id: member.id }],
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Check if feedback already exists
    const existing = await prisma.exchangeFeedback.findFirst({
      where: { matchId, memberId: member.id },
    });

    if (existing) {
      return NextResponse.json({ error: "Feedback already submitted" }, { status: 409 });
    }

    // Create all 5 feedback entries
    await prisma.exchangeFeedback.createMany({
      data: responses.map(r => ({
        matchId,
        memberId: member.id,
        questionKey: r.questionKey,
        response: r.response,
      })),
    });

    // If recommended ("The Coffee" = Yes), increment partner's peer recognition
    if (recommend) {
      const partnerId = match.member1Id === member.id ? match.member2Id : match.member1Id;
      await prisma.member.update({
        where: { id: partnerId },
        data: { peerRecognitionCount: { increment: 1 } },
      });

      // Update partner's confidence score (peer-validated layer)
      const partnerMember = await prisma.member.findUnique({
        where: { id: partnerId },
        select: { peerRecognitionCount: true },
      });

      if (partnerMember) {
        const peerValidated = Math.min(partnerMember.peerRecognitionCount * 5, 30);
        await prisma.confidenceScore.upsert({
          where: { memberId: partnerId },
          create: {
            memberId: partnerId,
            peerValidated,
            composite: peerValidated,
          },
          update: {
            peerValidated,
          },
        });

        // Recalculate composite
        const cs = await prisma.confidenceScore.findUnique({ where: { memberId: partnerId } });
        if (cs) {
          await prisma.confidenceScore.update({
            where: { memberId: partnerId },
            data: { composite: cs.selfDeclared + cs.xrayVerified + cs.peerValidated },
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Exchange feedback error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
