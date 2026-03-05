import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { polishSignalQuestion } from "@/lib/anthropic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    const suggestion = await prisma.signalSuggestion.findUnique({
      where: { id },
    });

    if (!suggestion) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (suggestion.status !== "PENDING") {
      return NextResponse.json(
        { error: "Suggestion already processed" },
        { status: 409 }
      );
    }

    // Call AI to polish the question
    const polished = await polishSignalQuestion({
      rawQuestion: suggestion.rawQuestion,
      context: suggestion.context || undefined,
    });

    // Update suggestion with polished data
    const updated = await prisma.signalSuggestion.update({
      where: { id },
      data: {
        status: "APPROVED",
        polishedQuestion: polished.polishedQuestion,
        suggestedOptions: JSON.stringify(polished.options),
      },
    });

    return NextResponse.json({
      suggestion: updated,
      polishedQuestion: polished.polishedQuestion,
      options: polished.options,
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
