import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSignalByNumber, getMemberVote } from "@/lib/signal";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ signalNumber: string }> }
) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    const member = await prisma.member.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!member) {
      return NextResponse.json(
        {
          error:
            "This survey is for Elev8 members. Interested? Reach out at andrewkim@elev8here.com",
        },
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

    const existingVote = await getMemberVote(signal.id, member.id);

    return NextResponse.json({
      valid: true,
      alreadyVoted: !!existingVote,
      memberName: member.firstName,
      signalStatus: signal.status,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
