import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const xrayProfiles = await prisma.xrayProfile.findMany({
    select: { memberId: true, status: true },
    orderBy: { createdAt: "desc" },
    distinct: ["memberId"],
  });

  const statuses: Record<string, string> = {};
  for (const xp of xrayProfiles) {
    statuses[xp.memberId] = xp.status;
  }

  return NextResponse.json(statuses);
}
