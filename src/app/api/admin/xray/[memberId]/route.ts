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
  linkedinUrl: z.string().url(),
});

// POST: Trigger Xray analysis
export async function POST(
  req: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { memberId } = await params;
    const body = await req.json();
    const { linkedinUrl } = analyzeSchema.parse(body);

    // Run analysis (this may take a while)
    await runXrayAnalysis(memberId, linkedinUrl);

    const xray = await prisma.xrayProfile.findFirst({
      where: { memberId },
      include: { bucketScores: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(xray);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Xray API error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
