import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getCurrentSignal, getMemberVote } from "@/lib/signal";

export async function GET() {
  try {
    const signal = await getCurrentSignal();

    if (!signal) {
      return NextResponse.json({ signal: null });
    }

    // Check if authenticated member has voted
    let hasVoted = false;
    const { userId } = await auth();
    if (userId) {
      const member = await prisma.member.findUnique({
        where: { clerkId: userId },
      });
      if (member) {
        const vote = await getMemberVote(signal.id, member.id);
        hasVoted = !!vote;
      }
    }

    return NextResponse.json({ signal, hasVoted });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
