import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createSignalSchema = z.object({
  question: z.string().min(1),
  optionA: z.string().min(1),
  optionB: z.string().min(1),
  optionC: z.string().min(1),
  optionD: z.string().min(1),
  optionE: z.string().min(1),
  category: z
    .enum(["AI_STRATEGY", "KOREA_TACTICAL", "LEADERSHIP", "WILDCARD", "SYNTHESIS"])
    .default("WILDCARD"),
  voteDeadline: z.string().datetime().optional(),
});

export async function GET() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const signals = await prisma.signalQuestion.findMany({
      orderBy: { signalNumber: "desc" },
      include: { votes: { select: { id: true } } },
    });

    const result = signals.map((signal) => ({
      ...signal,
      voteCount: signal.votes.length,
      votes: undefined,
    }));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const data = createSignalSchema.parse(body);

    // Auto-assign next signal number
    const maxSignal = await prisma.signalQuestion.findFirst({
      orderBy: { signalNumber: "desc" },
      select: { signalNumber: true },
    });
    const nextNumber = maxSignal ? maxSignal.signalNumber + 1 : 1;

    const signal = await prisma.signalQuestion.create({
      data: {
        signalNumber: nextNumber,
        question: data.question,
        optionA: data.optionA,
        optionB: data.optionB,
        optionC: data.optionC,
        optionD: data.optionD,
        optionE: data.optionE,
        category: data.category,
        voteDeadline: data.voteDeadline ? new Date(data.voteDeadline) : null,
      },
    });

    return NextResponse.json(signal, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
