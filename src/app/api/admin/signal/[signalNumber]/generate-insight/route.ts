import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { generateSignalInsight, generateRelatedArticles } from "@/lib/anthropic";

async function requireAdminApi() {
  const { userId } = await auth();
  if (!userId) return null;

  const member = await prisma.member.findUnique({
    where: { clerkId: userId },
  });
  if (!member || member.role !== "ADMIN") return null;

  return member;
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ signalNumber: string }> }
) {
  try {
    const admin = await requireAdminApi();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { signalNumber } = await params;
    const num = parseInt(signalNumber, 10);
    if (isNaN(num)) {
      return NextResponse.json({ error: "Invalid signal number" }, { status: 400 });
    }

    const signal = await prisma.signalQuestion.findUnique({
      where: { signalNumber: num },
      include: {
        votes: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!signal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    const totalVotes = signal.votes.length;
    if (totalVotes === 0) {
      return NextResponse.json({ error: "No votes to analyze" }, { status: 400 });
    }

    const optionMap: Record<string, string> = {
      A: signal.optionA,
      B: signal.optionB,
      C: signal.optionC,
      D: signal.optionD,
      E: signal.optionE,
    };

    const options = Object.entries(optionMap).map(([answer, label]) => ({
      answer,
      label,
    }));

    const distribution = options.map(({ answer, label }) => {
      const count = signal.votes.filter((v) => v.answer === answer).length;
      return {
        answer,
        label,
        count,
        percentage: Math.round((count / totalVotes) * 100),
      };
    });

    const whyResponses = signal.votes
      .map((v) => v.why)
      .filter((w): w is string => !!w && w.trim().length > 0);

    const insight = await generateSignalInsight({
      question: signal.question,
      options,
      distribution,
      whyResponses,
      totalVotes,
    });

    // Fetch related articles in parallel (don't block on failure)
    let articles: Awaited<ReturnType<typeof generateRelatedArticles>> = [];
    try {
      articles = await generateRelatedArticles(signal.question, insight.en);
    } catch (err) {
      console.error("Failed to fetch related articles:", err);
    }

    return NextResponse.json({
      insight: { ...insight, articles },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to generate insight:", message);
    return NextResponse.json({ error: `Failed to generate insight: ${message}` }, { status: 500 });
  }
}
