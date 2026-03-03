import { NextResponse } from "next/server";
import { requireMember } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const member = await requireMember();

    const matches = await prisma.match.findMany({
      where: {
        OR: [{ member1Id: member.id }, { member2Id: member.id }],
      },
      include: { member1: true, member2: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(matches);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
