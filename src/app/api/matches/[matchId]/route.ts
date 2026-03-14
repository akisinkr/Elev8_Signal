import { NextResponse } from "next/server";
import { requireMember } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateMatchSchema = z.object({
  status: z.enum(["ACCEPTED", "DECLINED", "ACTIVE", "COMPLETED"]).optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const member = await requireMember();
    const { matchId } = await params;

    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [{ member1Id: member.id }, { member2Id: member.id }],
      },
      include: {
        member1: { omit: { passwordHash: true } },
        member2: { omit: { passwordHash: true } },
        messages: true,
        feedback: true,
        matchScore: true,
        exchangeFeedback: true,
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    return NextResponse.json(match);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const member = await requireMember();
    const { matchId } = await params;
    const body = await req.json();
    const { status } = updateMatchSchema.parse(body);

    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [{ member1Id: member.id }, { member2Id: member.id }],
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const updated = await prisma.match.update({
      where: { id: matchId },
      data: {
        ...(status && { status }),
        ...(status === "ACCEPTED" && { acceptedAt: new Date() }),
        ...(status === "ACTIVE" && { matchedAt: new Date() }),
        ...(status === "COMPLETED" && { completedAt: new Date() }),
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
