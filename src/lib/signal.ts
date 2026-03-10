import { prisma } from "@/lib/db";
import type { SignalAnswer } from "@/generated/prisma/client";
import type { SignalResults, SignalResultDistribution } from "@/types/signal";
import { SIGNAL_ANSWER_KEYS } from "@/lib/signal-constants";

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

function getOptionLabelKr(
  question: { optionAKr?: string | null; optionBKr?: string | null; optionCKr?: string | null; optionDKr?: string | null; optionEKr?: string | null },
  answer: SignalAnswer
): string | null {
  const map: Record<SignalAnswer, string | null | undefined> = {
    A: question.optionAKr,
    B: question.optionBKr,
    C: question.optionCKr,
    D: question.optionDKr,
    E: question.optionEKr,
  };
  return map[answer] ?? null;
}

export async function getCurrentSignal() {
  return prisma.signalQuestion.findFirst({
    where: { status: "LIVE" },
    orderBy: { signalNumber: "desc" },
  });
}

export async function getSignalByNumber(signalNumber: number) {
  return prisma.signalQuestion.findUnique({
    where: { signalNumber },
    include: { votes: true },
  });
}

export async function getMemberVote(questionId: string, memberId: string) {
  return prisma.signalVote.findUnique({
    where: { questionId_memberId: { questionId, memberId } },
  });
}

export async function castVote(questionId: string, memberId: string, answer: SignalAnswer, why?: string) {
  return prisma.signalVote.create({
    data: { questionId, memberId, answer, why: why || null },
  });
}

export async function computeResults(
  signalNumber: number,
  memberId: string | null
): Promise<SignalResults | null> {
  const question = await prisma.signalQuestion.findUnique({
    where: { signalNumber },
    include: { votes: true },
  });

  if (!question) return null;

  // Temporal gate: only show results for PUBLISHED signals
  if (question.status !== "PUBLISHED") return null;

  const totalVotes = question.votes.length;
  if (totalVotes === 0) return null;

  // Calculate distribution
  const distribution: SignalResultDistribution[] = SIGNAL_ANSWER_KEYS.map((answer) => {
    const count = question.votes.filter((v) => v.answer === answer).length;
    return {
      answer,
      label: getOptionLabel(question, answer),
      labelKr: getOptionLabelKr(question, answer),
      count,
      percentage: Math.round((count / totalVotes) * 100),
    };
  });

  // Top answer
  const sorted = [...distribution].sort((a, b) => b.count - a.count);
  const topAnswer = sorted[0].answer;
  const topAnswerLabel = sorted[0].label;
  const topAnswerLabelKr = sorted[0].labelKr ?? null;

  // Member's answer
  let memberAnswer: SignalAnswer | null = null;
  if (memberId) {
    const vote = question.votes.find((v) => v.memberId === memberId);
    memberAnswer = vote?.answer ?? null;
  }

  // Random anonymous quotes (up to 5, excluding empty)
  const allQuotes = question.votes
    .filter((v) => v.why && v.why.trim().length > 0)
    .map((v) => v.why!);
  const shuffled = allQuotes.sort(() => Math.random() - 0.5);
  const anonymousQuotes = shuffled.slice(0, 5);

  return {
    question,
    totalVotes,
    distribution,
    topAnswer,
    topAnswerLabel,
    topAnswerLabelKr,
    memberAnswer,
    anonymousQuotes,
  };
}

export async function canViewResults(signalNumber: number, memberId: string): Promise<boolean> {
  const question = await prisma.signalQuestion.findUnique({
    where: { signalNumber },
  });

  if (!question) return false;
  if (question.status !== "PUBLISHED") return false;

  // Vote gate: must have voted to see results
  const vote = await getMemberVote(question.id, memberId);
  return !!vote;
}
