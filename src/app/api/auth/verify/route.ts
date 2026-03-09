import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyMagicToken, createMemberSession } from "@/lib/member-auth";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const redirect = req.nextUrl.searchParams.get("redirect") || "/signal";

  if (!token) {
    return NextResponse.redirect(
      new URL("/sign-in?error=missing-token", req.url)
    );
  }

  const email = await verifyMagicToken(token);

  if (!email) {
    return NextResponse.redirect(
      new URL("/sign-in?error=expired", req.url)
    );
  }

  const member = await prisma.member.findUnique({
    where: { email },
  });

  if (!member) {
    return NextResponse.redirect(
      new URL("/sign-in?error=not-member", req.url)
    );
  }

  // Set session cookie
  await createMemberSession(member.id, email);

  // Redirect to the vote page
  return NextResponse.redirect(new URL(redirect, req.url));
}
