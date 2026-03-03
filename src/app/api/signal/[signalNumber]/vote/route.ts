import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getSignalByNumber, getMemberVote, castVote } from "@/lib/signal";
import { z } from "zod";

const voteSchema = z.object({
  answer: z.enum(["A", "B", "C", "D", "E"]),
  why: z.string().max(280).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ signalNumber: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const member = await prisma.member.findUnique({
      where: { clerkId: userId },
    });
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 401 });
    }

    const { signalNumber } = await params;
    const num = parseInt(signalNumber, 10);
    if (isNaN(num)) {
      return NextResponse.json({ error: "Invalid signal number" }, { status: 400 });
    }

    const signal = await getSignalByNumber(num);
    if (!signal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    if (signal.status !== "LIVE") {
      return NextResponse.json({ error: "Signal is not open for voting" }, { status: 400 });
    }

    const existingVote = await getMemberVote(signal.id, member.id);
    if (existingVote) {
      return NextResponse.json({ error: "Already voted" }, { status: 409 });
    }

    const body = await req.json();
    const { answer, why } = voteSchema.parse(body);

    const vote = await castVote(signal.id, member.id, answer, why);
    return NextResponse.json(vote, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
