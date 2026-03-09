import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createOtp } from "@/lib/member-auth";
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

    const member = await prisma.member.findUnique({
      where: { email: normalizedEmail },
    });

    if (!member) {
      return NextResponse.json(
        { error: "This email is not registered as an Elev8 member." },
        { status: 403 }
      );
    }

    const { code, token } = await createOtp(normalizedEmail);

    await sendEmail({
      to: normalizedEmail,
      subject: `${code} — Your Elev8 Signal Code`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #0A0A0A; color: #E8E4DD;">
          <div style="text-align: center; margin-bottom: 32px;">
            <span style="font-size: 13px; font-weight: 600; letter-spacing: 0.3em; color: #C8A84E;">ELEV8</span>
          </div>

          <p style="font-size: 14px; text-align: center; color: #7A7670; margin-bottom: 24px;">
            Your verification code:
          </p>

          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 36px; font-weight: 700; letter-spacing: 0.3em; color: #E8E4DD;">${code}</span>
          </div>

          <p style="font-size: 12px; text-align: center; color: #4A4640;">
            Expires in 10 minutes. If you didn't request this, ignore this email.
          </p>
        </div>
      `,
    });

    // Return the signed token (contains the code hash) — client will send it back with the user's input
    return NextResponse.json({ sent: true, token });
  } catch (error) {
    console.error("OTP send error:", error);
    return NextResponse.json(
      { error: "Failed to send verification code" },
      { status: 500 }
    );
  }
}
