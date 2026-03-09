import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createMagicToken } from "@/lib/member-auth";
import { sendEmail } from "@/lib/sendgrid";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if member exists
    const member = await prisma.member.findUnique({
      where: { email: normalizedEmail },
    });

    if (!member) {
      return NextResponse.json(
        { error: "This email is not registered as an Elev8 member." },
        { status: 403 }
      );
    }

    // Generate magic link token
    const token = await createMagicToken(normalizedEmail);

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    // Find the current live signal to redirect to after verification
    const liveSignal = await prisma.signalQuestion.findFirst({
      where: { status: "LIVE" },
      select: { signalNumber: true },
    });

    const redirectPath = liveSignal
      ? `/signal/${liveSignal.signalNumber}/vote`
      : "/signal";

    const magicLink = `${baseUrl}/api/auth/verify?token=${token}&redirect=${encodeURIComponent(redirectPath)}`;

    // Send email
    await sendEmail({
      to: normalizedEmail,
      subject: "Your Elev8 Signal Login Link",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #0A0A0A; color: #E8E4DD;">
          <div style="text-align: center; margin-bottom: 32px;">
            <span style="font-size: 13px; font-weight: 600; letter-spacing: 0.3em; color: #C8A84E;">ELEV8</span>
          </div>

          <h2 style="font-size: 18px; font-weight: 600; text-align: center; margin-bottom: 8px; color: #E8E4DD;">
            Your login link
          </h2>

          <p style="font-size: 14px; text-align: center; color: #7A7670; margin-bottom: 32px;">
            Click the button below to sign in and vote on this week's Signal.
          </p>

          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${magicLink}" style="display: inline-block; padding: 12px 32px; background: #C8A84E; color: #0A0A0A; font-weight: 600; font-size: 14px; text-decoration: none; border-radius: 8px;">
              Sign in & Vote
            </a>
          </div>

          <p style="font-size: 12px; text-align: center; color: #4A4640;">
            This link expires in 15 minutes.<br/>
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error("Magic link error:", error);
    return NextResponse.json(
      { error: "Failed to send login link" },
      { status: 500 }
    );
  }
}
