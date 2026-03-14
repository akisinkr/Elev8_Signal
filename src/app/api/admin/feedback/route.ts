import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const feedback = await prisma.feedback.findMany({
      include: {
        member: { omit: { passwordHash: true } },
        match: { include: { member1: { omit: { passwordHash: true } }, member2: { omit: { passwordHash: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    return NextResponse.json(feedback);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
}
