import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeResults, getMemberVote, getSignalByNumber } from "@/lib/signal";
import { verifySignalToken } from "@/lib/signal-token";
import { z } from "zod";

const schema = z.object({
  email: z.string().email().optional(),
  token: z.string().optional(),
});

async function buildResultsResponse(num: number, memberId: string) {
  const signal = await getSignalByNumber(num);
  if (!signal) {
    return NextResponse.json({ error: "Signal not found" }, { status: 404 });
  }

  if (signal.status !== "PUBLISHED") {
    return NextResponse.json(
      { error: "Results not yet available", notPublished: true },
      { status: 403 }
    );
  }

  const vote = await getMemberVote(signal.id, memberId);

  const results = await computeResults(num, memberId);
  if (!results) {
    return NextResponse.json({ error: "Results not available" }, { status: 404 });
  }

  return NextResponse.json({
    distribution: results.distribution,
    totalVotes: results.totalVotes,
    memberAnswer: results.memberAnswer,
    topAnswer: results.topAnswer,
    topAnswerLabel: results.topAnswerLabel,
    anonymousQuotes: results.anonymousQuotes,
    headlineInsight: results.question.headlineInsight,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ signalNumber: string }> }
) {
  try {
    const body = await req.json();
    const { email, token } = schema.parse(body);

    const { signalNumber } = await params;
    const num = parseInt(signalNumber, 10);
    if (isNaN(num)) {
      return NextResponse.json({ error: "Invalid signal number" }, { status: 400 });
    }

    // Token-based auth (from email link)
    if (token) {
      const verified = verifySignalToken(token);
      if (!verified || verified.signalNumber !== num) {
        return NextResponse.json({ error: "Invalid or expired link" }, { status: 403 });
      }
      return buildResultsResponse(num, verified.memberId);
    }

    // Email-based auth (manual entry)
    if (!email) {
      return NextResponse.json({ error: "Email or token required" }, { status: 400 });
    }

    const member = await prisma.member.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!member) {
      return NextResponse.json(
        {
          error:
            "This survey is for Elev8 members. Request access at elev8-signal.com/request-access",
        },
        { status: 403 }
      );
    }

    return buildResultsResponse(num, member.id);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
