import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin();

    const feedback = await prisma.feedback.findMany({
      include: { member: true, match: { include: { member1: true, member2: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(feedback);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
}
