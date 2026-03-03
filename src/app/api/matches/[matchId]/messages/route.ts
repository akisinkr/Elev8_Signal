import { NextResponse } from "next/server";
import { requireMember } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPusherServer } from "@/lib/pusher";
import { z } from "zod";

const messageSchema = z.object({
  content: z.string().min(1),
  type: z.enum(["TEXT", "VOICE_NOTE"]).default("TEXT"),
  voiceNoteUrl: z.string().url().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const member = await requireMember();
    const { matchId } = await params;

    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        OR: [{ member1Id: member.id }, { member2Id: member.id }],
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const messages = await prisma.message.findMany({
      where: { matchId },
      include: { sender: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const member = await requireMember();
    const { matchId } = await params;
    const body = await req.json();
    const { content, type, voiceNoteUrl } = messageSchema.parse(body);

    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        status: "ACTIVE",
        OR: [{ member1Id: member.id }, { member2Id: member.id }],
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found or not active" }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: {
        content,
        type,
        voiceNoteUrl,
        matchId,
        senderId: member.id,
      },
      include: { sender: true },
    });

    // Trigger real-time update
    await getPusherServer().trigger(`match-${matchId}`, "new-message", message);

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
