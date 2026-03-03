import Link from "next/link";
import { requireMember } from "@/lib/auth";
import { getCurrentSignal, getMemberVote, computeResults } from "@/lib/signal";
import { prisma } from "@/lib/db";
import { SignalHeadline } from "@/components/signal/signal-headline";
import { SignalResultBars } from "@/components/signal/signal-result-bars";
import { SignalPeerQuotes } from "@/components/signal/signal-peer-quotes";
import { SignalCountdown } from "@/components/signal/signal-countdown";
import { Button } from "@/components/ui/button";

export default async function SignalPage() {
  const member = await requireMember();
  const liveSignal = await getCurrentSignal();

  // --- LIVE signal ---
  if (liveSignal) {
    const vote = await getMemberVote(liveSignal.id, member.id);
    const hasVoted = !!vote;

    return (
      <div className="space-y-8">
        <h1 className="text-lg font-semibold tracking-tight">Signal</h1>

        <div className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            Signal #{liveSignal.signalNumber} — Live Now
          </p>
          <h2 className="text-xl font-bold leading-snug">
            {liveSignal.question}
          </h2>
          {liveSignal.voteDeadline && (
            <SignalCountdown
              deadline={liveSignal.voteDeadline.toISOString()}
            />
          )}

          {hasVoted ? (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
              <p className="font-medium text-primary">You&apos;ve voted!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Results will be shared once voting closes.
              </p>
            </div>
          ) : (
            <Button asChild size="lg" className="w-full">
              <Link href={`/signal/${liveSignal.signalNumber}/vote`}>
                Cast Your Vote
              </Link>
            </Button>
          )}
        </div>

        <footer className="text-center pt-4">
          <Link
            href="/signal/archive"
            className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
          >
            View past results
          </Link>
        </footer>
      </div>
    );
  }

  // --- No LIVE signal: show most recent PUBLISHED ---
  const recentPublished = await prisma.signalQuestion.findFirst({
    where: { status: "PUBLISHED" },
    orderBy: { signalNumber: "desc" },
  });

  if (recentPublished) {
    const results = await computeResults(
      recentPublished.signalNumber,
      member.id
    );
    if (results) {
      return (
        <div className="space-y-8">
          <h1 className="text-lg font-semibold tracking-tight">Signal</h1>

          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Latest results — Signal #{recentPublished.signalNumber}
            </p>
            <h2 className="text-xl font-bold leading-snug">
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
            <SignalPeerQuotes quotes={results.anonymousQuotes} />
          </div>

          <footer className="text-center pt-4">
            <Link
              href="/signal/archive"
              className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
            >
              View past results
            </Link>
          </footer>
        </div>
      );
    }
  }

  // --- Nothing available ---
  return (
    <div className="space-y-8">
      <h1 className="text-lg font-semibold tracking-tight">Signal</h1>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-lg font-semibold">No active Signal</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          There are no Signal questions right now. Check back soon.
        </p>
      </div>

      <footer className="text-center pt-4">
        <Link
          href="/signal/archive"
          className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
        >
          View past results
        </Link>
      </footer>
    </div>
  );
}
