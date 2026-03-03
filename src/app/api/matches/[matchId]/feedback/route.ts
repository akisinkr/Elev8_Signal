import { NextResponse } from "next/server";
import { requireMember } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const feedbackSchema = z.object({
  rating: z.enum(["POSITIVE", "NEGATIVE"]),
  comment: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const member = await requireMember();
    const { matchId } = await params;
    const body = await req.json();
    const { rating, comment } = feedbackSchema.parse(body);

    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [{ member1Id: member.id }, { member2Id: member.id }],
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const feedback = await prisma.feedback.upsert({
      where: {
        matchId_memberId: { matchId, memberId: member.id },
      },
      create: {
        rating,
        comment,
        matchId,
        memberId: member.id,
      },
      update: {
        rating,
        comment,
      },
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
