import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

async function requireAdminApi() {
  const { userId } = await auth();
  if (!userId) return null;

  const member = await prisma.member.findUnique({
    where: { clerkId: userId },
  });
  if (!member || member.role !== "ADMIN") return null;

  return member;
}

const updateSchema = z.object({
  status: z.enum(["REJECTED"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminApi();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const data = updateSchema.parse(body);

    const suggestion = await prisma.signalSuggestion.findUnique({
      where: { id },
    });

    if (!suggestion) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.signalSuggestion.update({
      where: { id },
      data: { status: data.status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
