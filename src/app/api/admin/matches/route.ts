import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createMatchSchema = z.object({
  member1Id: z.string(),
  member2Id: z.string(),
  curatorNote: z.string().optional(),
});

export async function GET() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const matches = await prisma.match.findMany({
      include: { member1: true, member2: true, matchScore: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(matches);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { member1Id, member2Id, curatorNote } = createMatchSchema.parse(body);

    const match = await prisma.match.create({
      data: {
        member1Id,
        member2Id,
        curatorNote,
        status: "PROPOSED",
      },
      include: { member1: true, member2: true },
    });

    return NextResponse.json(match, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
