import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMemberSession } from "@/lib/member-auth";
import { z } from "zod";

const suggestSchema = z.object({
  email: z.string().email(),
  rawQuestion: z.string().min(1).max(500),
  context: z.string().max(300).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = suggestSchema.parse(body);

    // Try session-based auth first, fall back to email lookup for backward compat
    const sessionMember = await getMemberSession();
    const member = sessionMember || await prisma.member.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 403 });
    }

    await prisma.signalSuggestion.create({
      data: {
        rawQuestion: data.rawQuestion,
        context: data.context || null,
        memberId: member.id,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
