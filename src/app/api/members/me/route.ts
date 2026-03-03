import { NextResponse } from "next/server";
import { requireMember } from "@/lib/auth";

export async function GET() {
  try {
    const member = await requireMember();
    return NextResponse.json(member);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
