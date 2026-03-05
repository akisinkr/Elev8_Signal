import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/sendgrid";
import { generateSignalToken } from "@/lib/signal-token";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ signalNumber: string }> }
) {
  try {
    const admin = await getAdminSession();
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
          include: { member: true },
        },
      },
    });

    if (!signal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    if (signal.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Signal must be published before sending results" },
        { status: 400 }
      );
    }

    const allVoters = signal.votes
      .map((v) => ({
        voteId: v.id,
        memberId: v.member.id,
        email: v.member.email,
        firstName: v.member.firstName,
        alreadySent: !!v.resultEmailSentAt,
      }))
      .filter((v) => v.email);

    const voters = allVoters.filter((v) => !v.alreadySent);
    const skipped = allVoters.length - voters.length;

    if (voters.length === 0) {
      return NextResponse.json(
        { error: "All voters have already received results", sent: 0, skipped, total: allVoters.length },
        { status: 200 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://elev8community.com";

    // Parse insight — extract English bullet points from JSON or use plain text
    let insightPoints: string[] = [];
    const raw = signal.headlineInsight || "";
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.en)) {
        insightPoints = parsed.en;
      } else if (typeof parsed.en === "string") {
        insightPoints = [parsed.en];
      }
    } catch {
      if (raw.trim()) insightPoints = [raw];
    }

    const insightHtml = insightPoints.length > 0
      ? insightPoints
          .map(
            (point) =>
              `<tr><td style="padding: 0 0 16px 0; vertical-align: top; width: 24px; color: #6366f1; font-size: 18px; line-height: 1.5;">•</td><td style="padding: 0 0 16px 8px; font-size: 15px; color: #333; line-height: 1.6;">${point}</td></tr>`
          )
          .join("")
      : `<tr><td style="font-size: 15px; color: #333; line-height: 1.6;">Results are now available.</td></tr>`;

    const subject = `Elev8 Signal #${num} — Results Are In`;

    let sent = 0;
    const errorDetails: { email: string; reason: string }[] = [];

    for (const voter of voters) {
      try {
        const token = generateSignalToken(voter.memberId, num);
        const resultsUrl = `${baseUrl}/signal/${num}?token=${token}`;

        const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 16px;">
        <div style="margin-bottom: 32px;">
          <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #6366f1;">Signal #${num}</span>
        </div>
        <h2 style="font-size: 22px; font-weight: 700; margin: 0 0 8px; color: #111; line-height: 1.3;">
          ${signal.question}
        </h2>
        <p style="font-size: 13px; color: #888; margin: 0 0 28px;">
          Exclusive insights from the Elev8 community
        </p>
        <div style="background: #fafafa; border-radius: 12px; padding: 24px; margin-bottom: 28px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
            ${insightHtml}
          </table>
        </div>
        <div style="text-align: center; margin-bottom: 40px;">
          <a href="${resultsUrl}" style="display: inline-block; background: #111; color: #fff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600;">
            View Full Results →
          </a>
        </div>
        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
          <p style="font-size: 12px; color: #aaa; margin: 0;">
            Elev8 — Where leaders exchange superpowers
          </p>
        </div>
      </div>
        `;

        await sendEmail({ to: voter.email, subject, html });
        await prisma.signalVote.update({
          where: { id: voter.voteId },
          data: { resultEmailSentAt: new Date() },
        });
        sent++;
      } catch (err: unknown) {
        const sgError = err as { response?: { body?: unknown }; message?: string };
        const reason = JSON.stringify(sgError.response?.body ?? sgError.message ?? "Unknown error");
        errorDetails.push({ email: voter.email, reason });
      }
    }

    return NextResponse.json({
      sent,
      skipped,
      total: allVoters.length,
      errors: errorDetails,
    });
  } catch (error) {
    console.error("Failed to send results:", error);
    return NextResponse.json({ error: "Failed to send results" }, { status: 500 });
  }
}
