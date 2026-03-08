import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await req.json();
    const data = updateSchema.parse(body);

    const suggestion = await prisma.aiSignalSuggestion.findUnique({
      where: { id },
    });

    if (!suggestion) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.aiSignalSuggestion.update({
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
