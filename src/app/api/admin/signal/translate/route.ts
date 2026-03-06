import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { translateSignalToKorean } from "@/lib/anthropic";
import { z } from "zod";

const schema = z.object({
  question: z.string().min(1),
  optionA: z.string().min(1),
  optionB: z.string().min(1),
  optionC: z.string().min(1),
  optionD: z.string().min(1),
  optionE: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const data = schema.parse(body);

    const translation = await translateSignalToKorean(data);

    return NextResponse.json(translation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
