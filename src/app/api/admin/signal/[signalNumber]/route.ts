import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateSignalSchema = z.object({
  question: z.string().min(1).optional(),
  optionA: z.string().min(1).optional(),
  optionB: z.string().min(1).optional(),
  optionC: z.string().min(1).optional(),
  optionD: z.string().min(1).optional(),
  optionE: z.string().min(1).optional(),
  category: z
    .enum(["AI_STRATEGY", "KOREA_TACTICAL", "LEADERSHIP", "WILDCARD", "SYNTHESIS"])
    .optional(),
  status: z.enum(["DRAFT", "LIVE", "CLOSED", "PUBLISHED"]).optional(),
  headlineInsight: z.string().optional(),
  voteDeadline: z.string().datetime().nullable().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ signalNumber: string }> }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { signalNumber } = await params;
    const num = parseInt(signalNumber, 10);
    if (isNaN(num)) {
      return NextResponse.json({ error: "Invalid signal number" }, { status: 400 });
    }

    const signal = await prisma.signalQuestion.findUnique({
      where: { signalNumber: num },
      include: {
        votes: {
          include: { member: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!signal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    return NextResponse.json(signal);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ signalNumber: string }> }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { signalNumber } = await params;
    const num = parseInt(signalNumber, 10);
    if (isNaN(num)) {
      return NextResponse.json({ error: "Invalid signal number" }, { status: 400 });
    }

    const existing = await prisma.signalQuestion.findUnique({
      where: { signalNumber: num },
    });
    if (!existing) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    const body = await req.json();
    const data = updateSignalSchema.parse(body);

    // Build update payload
    const updateData: Record<string, unknown> = { ...data };

    // When transitioning to PUBLISHED, auto-set publishedAt
    if (data.status === "PUBLISHED" && existing.status !== "PUBLISHED") {
      updateData.publishedAt = new Date();
    }

    // When transitioning to LIVE, validate voteDeadline
    if (data.status === "LIVE" && existing.status !== "LIVE") {
      const deadline = data.voteDeadline !== undefined
        ? data.voteDeadline
        : existing.voteDeadline;
      if (!deadline) {
        return NextResponse.json(
          { error: "voteDeadline is required to go LIVE" },
          { status: 400 }
        );
      }
    }

    // Convert voteDeadline string to Date
    if (data.voteDeadline !== undefined) {
      updateData.voteDeadline = data.voteDeadline
        ? new Date(data.voteDeadline)
        : null;
    }

    const updated = await prisma.signalQuestion.update({
      where: { signalNumber: num },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
