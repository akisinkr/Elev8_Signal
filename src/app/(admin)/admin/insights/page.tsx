import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { InsightGallery } from "@/components/admin/signal/insight-gallery";

export default async function AdminInsightsPage() {
  await requireAdmin();

  const publishedSignals = await prisma.signalQuestion.findMany({
    where: { status: "PUBLISHED", headlineInsight: { not: null } },
    orderBy: { signalNumber: "desc" },
    select: {
      signalNumber: true,
      question: true,
      headlineInsight: true,
      publishedAt: true,
      _count: { select: { votes: true } },
    },
  });

  const signals = publishedSignals.map((s) => ({
    signalNumber: s.signalNumber,
    question: s.question,
    headlineInsight: s.headlineInsight!,
    publishedAt: s.publishedAt?.toISOString() ?? null,
    voteCount: s._count.votes,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Saved Insights</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All published Signal insights in one place
        </p>
      </div>

      {signals.length === 0 ? (
        <div className="rounded-lg border bg-card py-16 text-center">
          <p className="text-muted-foreground">
            No published insights yet. Publish a Signal to see it here.
          </p>
        </div>
      ) : (
        <InsightGallery signals={signals} />
      )}
    </div>
  );
}
