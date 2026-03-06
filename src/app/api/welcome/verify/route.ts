import { NextResponse } from "next/server";
import { verifyApprovalToken } from "@/lib/approval-token";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const parsed = verifyApprovalToken(token);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const request = await prisma.accessRequest.findUnique({
    where: { id: parsed.requestId },
  });

  if (!request || request.status !== "APPROVED") {
    return NextResponse.json({ error: "Request not found or not approved" }, { status: 404 });
  }

  if (request.email !== parsed.email) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Check if already signed up
  const existingMember = await prisma.member.findUnique({
    where: { email: request.email },
  });

  return NextResponse.json({
    name: request.name,
    email: request.email,
    linkedinUrl: request.linkedinUrl,
    alreadyMember: !!existingMember,
  });
}
