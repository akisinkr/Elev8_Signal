import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET() {
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

    const signals = await prisma.signalQuestion.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { signalNumber: "desc" },
      include: {
        votes: { select: { id: true, memberId: true } },
      },
    });

    const archive = signals.map((signal) => ({
      signalNumber: signal.signalNumber,
      question: signal.question,
      category: signal.category,
      totalVotes: signal.votes.length,
      memberVoted: signal.votes.some((v) => v.memberId === member.id),
      headlineInsight: signal.headlineInsight,
      publishedAt: signal.publishedAt,
    }));

    return NextResponse.json(archive);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
