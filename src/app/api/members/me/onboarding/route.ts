import { NextResponse } from "next/server";
import { requireMember } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const onboardingSchema = z.object({
  step: z.number().min(0).max(7),
  data: z.record(z.string(), z.unknown()),
});

export async function PATCH(req: Request) {
  try {
    const member = await requireMember();
    const body = await req.json();
    const { step, data } = onboardingSchema.parse(body);

    const updated = await prisma.member.update({
      where: { id: member.id },
      data: {
        onboardingStep: step,
        ...data,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
