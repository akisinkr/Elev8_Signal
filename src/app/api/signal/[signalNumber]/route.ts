import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getSignalByNumber, getMemberVote, computeResults } from "@/lib/signal";

export async function GET(
  _req: Request,
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

    const vote = await getMemberVote(signal.id, member.id);
    const hasVoted = !!vote;

    if (signal.status === "PUBLISHED") {
      if (hasVoted) {
        const results = await computeResults(num, member.id);
        return NextResponse.json({ signal, hasVoted, results });
      }
      // Member hasn't voted — lock results
      const { votes: _, ...signalWithoutVotes } = signal;
      return NextResponse.json({ signal: signalWithoutVotes, hasVoted, locked: true });
    }

    if (signal.status === "LIVE") {
      const { votes: _, ...signalWithoutVotes } = signal;
      return NextResponse.json({ signal: signalWithoutVotes, hasVoted });
    }

    // DRAFT or CLOSED — just return basic info
    const { votes: _, ...signalWithoutVotes } = signal;
    return NextResponse.json({ signal: signalWithoutVotes, hasVoted });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
