import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { runXrayAnalysis } from "@/lib/xray";
import { z } from "zod";

// GET: Retrieve Xray results for a member
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { memberId } = await params;

    const xray = await prisma.xrayProfile.findFirst({
      where: { memberId },
      include: { bucketScores: true },
      orderBy: { createdAt: "desc" },
    });

    if (!xray) {
      return NextResponse.json({ error: "No Xray analysis found" }, { status: 404 });
    }

    return NextResponse.json(xray);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

const analyzeSchema = z.object({
  linkedinUrl: z.string().url().optional(),
});

// POST: Trigger Xray analysis (fire-and-forget to avoid Vercel timeout)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { memberId } = await params;

    // Accept linkedinUrl from body, or look it up from the member record
    let linkedinUrl: string | undefined;
    try {
      const body = await req.json();
      const parsed = analyzeSchema.parse(body);
      linkedinUrl = parsed.linkedinUrl;
    } catch {
      // Empty body is OK — we'll look up from member
    }

    if (!linkedinUrl) {
      const member = await prisma.member.findUnique({
        where: { id: memberId },
        select: { linkedinUrl: true },
      });
      linkedinUrl = member?.linkedinUrl ?? undefined;
    }

    if (!linkedinUrl) {
      return NextResponse.json({ error: "No LinkedIn URL available" }, { status: 400 });
    }

    // Fire-and-forget — frontend polls GET for status
    runXrayAnalysis(memberId, linkedinUrl).catch((err) =>
      console.error("Background Xray failed:", err)
    );

    return NextResponse.json({ status: "PROCESSING", memberId });
  } catch (error) {
    console.error("Xray API error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
