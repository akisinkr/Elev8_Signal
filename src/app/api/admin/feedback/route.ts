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
      include: { member: true, match: { include: { member1: true, member2: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(feedback);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
}
