import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { requireMember } from "@/lib/auth";
import { getCurrentSignal, getMemberVote, computeResults } from "@/lib/signal";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { SignalHeadline } from "@/components/signal/signal-headline";
import { SignalResultBars } from "@/components/signal/signal-result-bars";
import { SignalCountdown } from "@/components/signal/signal-countdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SIGNAL_CATEGORY_LABELS } from "@/lib/signal-constants";

export default async function SignalPage() {
  const member = await requireMember();
  const liveSignal = await getCurrentSignal();

  // If there's a LIVE signal
  if (liveSignal) {
    const vote = await getMemberVote(liveSignal.id, member.id);
    const hasVoted = !!vote;

    return (
      <div className="space-y-8">
        <PageHeader
          title="Signal"
          description="The pulse of Elev8 leadership — one question at a time."
        />

        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
              <BarChart3 className="size-4" />
              Signal #{liveSignal.signalNumber} — Live Now
            </div>
            <h2 className="text-lg font-semibold leading-snug">
              {liveSignal.question}
            </h2>
            <p className="text-sm text-muted-foreground">
              {SIGNAL_CATEGORY_LABELS[liveSignal.category]}
            </p>
            {liveSignal.voteDeadline && (
              <SignalCountdown
                deadline={liveSignal.voteDeadline.toISOString()}
              />
            )}

            {hasVoted ? (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
                <p className="font-medium text-primary">
                  You&apos;ve voted!
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Results will be available once voting closes and results are
                  published.
                </p>
              </div>
            ) : (
              <Button asChild size="lg" className="w-full">
                <Link href={`/signal/${liveSignal.signalNumber}/vote`}>
                  Cast Your Vote
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <Link
            href="/signal/archive"
            className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
          >
            View past Signal results
          </Link>
        </div>
      </div>
    );
  }

  // No LIVE signal — show most recent PUBLISHED signal if member voted
  const recentPublished = await prisma.signalQuestion.findFirst({
    where: { status: "PUBLISHED" },
    orderBy: { signalNumber: "desc" },
  });

  if (recentPublished) {
    const vote = await getMemberVote(recentPublished.id, member.id);
    if (vote) {
      const results = await computeResults(
        recentPublished.signalNumber,
        member.id
      );
      if (results) {
        return (
          <div className="space-y-8">
            <PageHeader
              title="Signal"
              description="The pulse of Elev8 leadership — one question at a time."
            />

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Latest results — Signal #{recentPublished.signalNumber}
              </p>
              <h2 className="text-lg font-semibold leading-snug">
                {recentPublished.question}
              </h2>
              <SignalHeadline
                headline={recentPublished.headlineInsight}
                signalNumber={recentPublished.signalNumber}
              />
              <SignalResultBars
                distribution={results.distribution}
                totalVotes={results.totalVotes}
                memberAnswer={results.memberAnswer}
              />
            </div>

            <div className="text-center">
              <Link
                href="/signal/archive"
                className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
              >
                View all past Signal results
              </Link>
            </div>
          </div>
        );
      }
    }
  }

  // No signals at all
  return (
    <div>
      <PageHeader
        title="Signal"
        description="The pulse of Elev8 leadership — one question at a time."
      />
      <EmptyState
        title="No active Signal"
        description="There are no Signal questions available right now. Check back soon for the next one."
        action={
          <Link
            href="/signal/archive"
            className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
          >
            View past results
          </Link>
        }
      />
    </div>
  );
}
