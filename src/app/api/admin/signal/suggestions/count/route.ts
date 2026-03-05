import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const count = await prisma.signalSuggestion.count({
      where: { status: "PENDING" },
    });

    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
