import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { memberId } = await params;

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        imageUrl: true,
        company: true,
        jobTitle: true,
        linkedinUrl: true,
        bio: true,
        headline: true,
        knownFor: true,
        spDomain: true,
        spAction: true,
        spScale: true,
        spStage: true,
        spGeo: true,
        superpowers: true,
        challenges: true,
        knownForDetail: true,
        adviceSeeking: true,
        passionTopic: true,
        dreamConnection: true,
        cardCompletedAt: true,
        createdAt: true,
        xrayProfiles: {
          orderBy: { createdAt: "desc" as const },
          take: 1,
          include: { bucketScores: true },
        },
        confidenceScore: true,
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json(member);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
