import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSignalByNumber, getMemberVote, castVote } from "@/lib/signal";
import { sendSlackNotification } from "@/lib/slack";
import { z } from "zod";

const voteSchema = z.object({
  answer: z.enum(["A", "B", "C", "D", "E"]),
  why: z.string().max(280).optional(),
  email: z.string().email(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ signalNumber: string }> }
) {
  try {
    const body = await req.json();
    const { answer, why, email } = voteSchema.parse(body);

    const member = await prisma.member.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!member) {
      return NextResponse.json(
        { error: "This survey is for Elev8 members." },
        { status: 403 }
      );
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

    const vote = await castVote(signal.id, member.id, answer, why);

    // Slack notification (fire-and-forget — don't block the response)
    sendSlackNotification(
      "signalVotes",
      `📊 *New Signal Vote*\n` +
      `• *Member:* ${member.name || member.email}\n` +
      `• *Signal #${num}:* ${signal.question}\n` +
      `• *Answer:* ${answer}` +
      (why ? `\n• *Why:* "${why}"` : "")
    );

    return NextResponse.json(vote, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
