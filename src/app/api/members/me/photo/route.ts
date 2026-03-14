import { NextResponse } from "next/server";
import { requireMember } from "@/lib/auth";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";

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
