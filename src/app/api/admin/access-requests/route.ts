import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const requests = await prisma.accessRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    return NextResponse.json(requests);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
