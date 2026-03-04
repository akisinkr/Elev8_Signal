import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }

  const member = await prisma.member.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  return NextResponse.json({ isAdmin: member?.role === "ADMIN" });
}
