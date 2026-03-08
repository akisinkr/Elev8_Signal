import { NextResponse } from "next/server";
import { requireMember } from "@/lib/auth";
import { getUploadUrl, getCloudFrontUrl } from "@/lib/s3";
import { z } from "zod";

const uploadSchema = z.object({
  fileName: z.string(),
  contentType: z.string(),
  folder: z.enum(["voice-notes", "profile-photos"]).optional(),
});

export async function POST(req: Request) {
  try {
    const member = await requireMember();
    const body = await req.json();
    const { fileName, contentType, folder } = uploadSchema.parse(body);

    const dir = folder || "voice-notes";
    const key = `${dir}/${member.id}/${Date.now()}-${fileName}`;
    const uploadUrl = await getUploadUrl(key, contentType);
    const publicUrl = process.env.AWS_CLOUDFRONT_DOMAIN
      ? getCloudFrontUrl(key)
      : `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return NextResponse.json({ uploadUrl, key, publicUrl });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
