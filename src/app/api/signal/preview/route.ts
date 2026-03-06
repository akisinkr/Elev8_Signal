import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SIGNAL_ANSWER_KEYS } from "@/lib/signal-constants";
import type { SignalAnswer } from "@/generated/prisma/client";

function getOptionLabel(
  question: { optionA: string; optionB: string; optionC: string; optionD: string; optionE: string },
  answer: SignalAnswer
): string {
  const map: Record<SignalAnswer, string> = {
    A: question.optionA,
    B: question.optionB,
    C: question.optionC,
    D: question.optionD,
    E: question.optionE,
  };
  return map[answer];
}

export async function GET() {
  try {
    const question = await prisma.signalQuestion.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: { signalNumber: "desc" },
      include: { votes: true },
    });

    if (!question) {
      return NextResponse.json({ error: "No published signal" }, { status: 404 });
    }

    const totalVotes = question.votes.length;

    const distribution = SIGNAL_ANSWER_KEYS.map((answer) => {
      const count = question.votes.filter((v) => v.answer === answer).length;
      return {
        answer,
        label: getOptionLabel(question, answer),
        percentage: totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0,
      };
    });

    // Top answer
    const sorted = [...distribution].sort((a, b) => b.percentage - a.percentage);
    const topAnswer = sorted[0].answer;
    const topAnswerLabel = sorted[0].label;
    const topPercentage = sorted[0].percentage;

    const quoteCount = question.votes.filter(
      (v) => v.why && v.why.trim().length > 0
    ).length;

    return NextResponse.json({
      signalNumber: question.signalNumber,
      question: question.question,
      category: question.category,
      distribution,
      topAnswer,
      topAnswerLabel,
      topPercentage,
      quoteCount,
      headlineInsight: question.headlineInsight,
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
