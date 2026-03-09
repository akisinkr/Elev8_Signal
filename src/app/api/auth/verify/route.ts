import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyOtp, createMemberSession } from "@/lib/member-auth";

export async function POST(req: NextRequest) {
  try {
    const { token, code } = await req.json();

    if (!token || !code) {
      return NextResponse.json({ error: "Missing token or code" }, { status: 400 });
    }

    const email = await verifyOtp(token, code);

    if (!email) {
      return NextResponse.json(
        { error: "Invalid or expired code. Please try again." },
        { status: 401 }
      );
    }

    const member = await prisma.member.findUnique({
      where: { email },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 403 }
      );
    }

    // Set session cookie
    await createMemberSession(member.id, email);

    // Find current live signal for redirect
    const liveSignal = await prisma.signalQuestion.findFirst({
      where: { status: "LIVE" },
      select: { signalNumber: true },
    });

    const redirectTo = liveSignal
      ? `/signal/${liveSignal.signalNumber}/vote`
      : "/signal";

    return NextResponse.json({
      verified: true,
      redirectTo,
      memberName: member.firstName,
    });
  } catch (error) {
    console.error("OTP verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
