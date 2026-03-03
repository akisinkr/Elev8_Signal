import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin();

    const members = await prisma.member.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(members);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
}
