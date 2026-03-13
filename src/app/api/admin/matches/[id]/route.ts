import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["PROPOSED", "PRESENTED", "ACCEPTED", "ACTIVE", "COMPLETED", "DECLINED"]),
  curatorNote: z.string().optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, curatorNote } = updateSchema.parse(body);

    const data: Record<string, unknown> = { status };
    if (curatorNote !== undefined) data.curatorNote = curatorNote;
    if (status === "PRESENTED") data.presentedAt = new Date();
    if (status === "ACCEPTED") data.acceptedAt = new Date();
    if (status === "ACCEPTED" || status === "ACTIVE") data.matchedAt = new Date();
    if (status === "COMPLETED") data.completedAt = new Date();

    const match = await prisma.match.update({
      where: { id },
      data,
      include: { member1: true, member2: true },
    });

    return NextResponse.json(match);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
