import { NextResponse } from "next/server";
import { requireMember } from "@/lib/auth";
import { getUploadUrl } from "@/lib/s3";
import { z } from "zod";

const uploadSchema = z.object({
  fileName: z.string(),
  contentType: z.string(),
});

export async function POST(req: Request) {
  try {
    const member = await requireMember();
    const body = await req.json();
    const { fileName, contentType } = uploadSchema.parse(body);

    const key = `voice-notes/${member.id}/${Date.now()}-${fileName}`;
    const uploadUrl = await getUploadUrl(key, contentType);

    return NextResponse.json({ uploadUrl, key });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
