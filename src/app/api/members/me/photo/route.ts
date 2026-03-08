import { NextResponse } from "next/server";
import { requireMember } from "@/lib/auth";

const SUPABASE_URL = "https://mvpwrwxxtxsmdoufsaos.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12cHdyd3h4dHhzbWRvdWZzYW9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0OTY1NTAsImV4cCI6MjA4ODA3MjU1MH0.mF6c5DCslDuXn92SO3BcF_xVv1ErPdEesP5AEVZKFSA";

export async function POST(req: Request) {
  try {
    const member = await requireMember();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Must be an image" }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File must be under 5MB" },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${member.id}/${Date.now()}.${ext}`;

    // Upload to Supabase Storage
    const buffer = await file.arrayBuffer();
    const uploadRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/profile-photos/${path}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
          "Content-Type": file.type,
        },
        body: buffer,
      }
    );

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      console.error("Supabase storage error:", err);
      return NextResponse.json(
        { error: "Upload failed" },
        { status: 500 }
      );
    }

    // Public URL
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/profile-photos/${path}`;

    // Save to member record
    const { prisma } = await import("@/lib/db");
    await prisma.member.update({
      where: { id: member.id },
      data: { customPhotoUrl: publicUrl },
    });

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Photo upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}
