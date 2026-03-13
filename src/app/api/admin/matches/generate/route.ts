import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { generateMatches, createMatchFromProposal } from "@/lib/match-algorithm";
import { z } from "zod";

const generateSchema = z.object({
  relevanceWeight: z.number().min(0).max(1).optional(),
  reciprocityWeight: z.number().min(0).max(1).optional(),
  contextWeight: z.number().min(0).max(1).optional(),
  autoCreate: z.boolean().optional(), // If true, auto-create PROPOSED matches for top results
  limit: z.number().min(1).max(100).optional(),
});

export async function POST(req: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { relevanceWeight, reciprocityWeight, contextWeight, autoCreate, limit } = generateSchema.parse(body);

    const proposals = await generateMatches({
      relevanceWeight,
      reciprocityWeight,
      contextWeight,
    });

    const topProposals = proposals.slice(0, limit || 20);

    // If autoCreate, persist the top matches as PROPOSED
    if (autoCreate) {
      const created = [];
      for (const proposal of topProposals) {
        const match = await createMatchFromProposal(proposal);
        created.push(match);
      }
      return NextResponse.json({ proposals: topProposals, created: created.length });
    }

    return NextResponse.json({ proposals: topProposals, total: proposals.length });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Match generation error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
