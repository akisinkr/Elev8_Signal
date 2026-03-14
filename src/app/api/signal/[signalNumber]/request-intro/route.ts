import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/sendgrid";
import { getMemberSession } from "@/lib/member-auth";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  matchedMemberId: z.string(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ signalNumber: string }> }
) {
  try {
    const body = await req.json();
    const { email, matchedMemberId } = schema.parse(body);

    const { signalNumber } = await params;
    const num = parseInt(signalNumber, 10);

    // Try session-based auth first, fall back to email lookup for backward compat
    const sessionMember = await getMemberSession();
    const requester = sessionMember || await prisma.member.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!requester) {
      return NextResponse.json({ error: "Member not found" }, { status: 403 });
    }

    // Get the matched member
    const matchedMember = await prisma.member.findUnique({
      where: { id: matchedMemberId },
    });
    if (!matchedMember) {
      return NextResponse.json({ error: "Matched member not found" }, { status: 404 });
    }

    // Get signal context
    const signal = await prisma.signalQuestion.findUnique({
      where: { signalNumber: num },
    });

    // Get requester's vote
    let requesterVote = null;
    if (signal) {
      const vote = await prisma.signalVote.findUnique({
        where: { questionId_memberId: { questionId: signal.id, memberId: requester.id } },
      });
      if (vote) {
        const optionMap: Record<string, string> = {
          A: signal.optionA, B: signal.optionB, C: signal.optionC,
          D: signal.optionD, E: signal.optionE,
        };
        requesterVote = { answer: vote.answer, label: optionMap[vote.answer] };
      }
    }

    // Save to Match table for admin tracking
    const match = await prisma.match.create({
      data: {
        member1Id: requester.id,
        member2Id: matchedMemberId,
        status: "PROPOSED",
        curatorNote: JSON.stringify({
          source: "signal-intro",
          signalNumber: num,
          signalQuestion: signal?.question ?? null,
          requesterVote: requesterVote
            ? `${requesterVote.answer} — ${requesterVote.label}`
            : null,
          requestedAt: new Date().toISOString(),
        }),
      },
    });

    // Send email to Andrew
    const andrewEmail = process.env.INTRO_NOTIFICATION_EMAIL || "andrew@elev8x.io";

    await sendEmail({
      to: andrewEmail,
      subject: `🤝 Intro Request — ${requester.firstName} → ${matchedMember.firstName} (Signal #${num})`,
      html: buildIntroEmailHtml({
        requester,
        matchedMember,
        signalNumber: num,
        signalQuestion: signal?.question ?? "N/A",
        requesterVote,
      }),
    });

    return NextResponse.json({ sent: true, matchId: match.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("Request intro error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function buildIntroEmailHtml({
  requester,
  matchedMember,
  signalNumber,
  signalQuestion,
  requesterVote,
}: {
  requester: { firstName: string; lastName: string; email: string; company?: string | null; jobTitle?: string | null; challengeType1?: string | null; challengeSpec1?: string | null };
  matchedMember: { firstName: string; lastName: string; email: string; company?: string | null; jobTitle?: string | null; spDomain?: string | null; spAction?: string | null };
  signalNumber: number;
  signalQuestion: string;
  requesterVote: { answer: string; label: string } | null;
}) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #0A0A0A; color: #E8E4DD;">
      <div style="border-bottom: 1px solid #1F1F1F; padding-bottom: 16px; margin-bottom: 24px;">
        <span style="color: #C8A84E; font-size: 13px; font-weight: 600; letter-spacing: 0.3em;">ELEV8</span>
        <span style="color: #4A4640; font-size: 13px; margin-left: 8px;">Intro Request</span>
      </div>

      <h2 style="color: #C8A84E; font-size: 18px; margin-bottom: 24px;">New Introduction Request</h2>

      <div style="background: #141414; border: 1px solid #1F1F1F; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
        <h3 style="color: #E8E4DD; font-size: 14px; margin: 0 0 12px;">Requesting Member</h3>
        <p style="color: #B0AAA0; font-size: 13px; margin: 4px 0;"><strong>${requester.firstName} ${requester.lastName}</strong></p>
        <p style="color: #7A7670; font-size: 13px; margin: 4px 0;">${requester.jobTitle || ""} ${requester.company ? `at ${requester.company}` : ""}</p>
        <p style="color: #7A7670; font-size: 13px; margin: 4px 0;">${requester.email}</p>
        ${requester.challengeType1 ? `<p style="color: #7A7670; font-size: 13px; margin: 8px 0 0;">Challenge: ${requester.challengeType1}${requester.challengeSpec1 ? ` — ${requester.challengeSpec1}` : ""}</p>` : ""}
        ${requesterVote ? `<p style="color: #C8A84E; font-size: 13px; margin: 8px 0 0;">Voted: ${requesterVote.answer} — ${requesterVote.label}</p>` : ""}
      </div>

      <div style="background: #141414; border: 1px solid #1F1F1F; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
        <h3 style="color: #E8E4DD; font-size: 14px; margin: 0 0 12px;">Matched Superpower Holder</h3>
        <p style="color: #B0AAA0; font-size: 13px; margin: 4px 0;"><strong>${matchedMember.firstName} ${matchedMember.lastName}</strong></p>
        <p style="color: #7A7670; font-size: 13px; margin: 4px 0;">${matchedMember.jobTitle || ""} ${matchedMember.company ? `at ${matchedMember.company}` : ""}</p>
        <p style="color: #7A7670; font-size: 13px; margin: 4px 0;">${matchedMember.email}</p>
        ${matchedMember.spDomain ? `<p style="color: #C8A84E; font-size: 13px; margin: 8px 0 0;">Superpower: ${matchedMember.spDomain}${matchedMember.spAction ? ` · ${matchedMember.spAction}` : ""}</p>` : ""}
      </div>

      <div style="background: #141414; border: 1px solid #1F1F1F; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <h3 style="color: #E8E4DD; font-size: 14px; margin: 0 0 8px;">Signal Context</h3>
        <p style="color: #7A7670; font-size: 13px; margin: 0;">Signal #${signalNumber}: ${signalQuestion}</p>
      </div>

      <p style="color: #4A4640; font-size: 12px; text-align: center; margin-top: 32px;">
        Connect these two members via a warm intro email.
      </p>
    </div>
  `;
}
