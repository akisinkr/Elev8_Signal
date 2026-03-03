import Link from "next/link";
import { notFound } from "next/navigation";
import { requireMember } from "@/lib/auth";
import { getSignalByNumber, getMemberVote, computeResults } from "@/lib/signal";
import { PageHeader } from "@/components/shared/page-header";
import { SignalHeadline } from "@/components/signal/signal-headline";
import { SignalYourVsGroup } from "@/components/signal/signal-your-vs-group";
import { SignalResultBars } from "@/components/signal/signal-result-bars";
import { SignalPeerQuotes } from "@/components/signal/signal-peer-quotes";
import { SignalVoteGate } from "@/components/signal/signal-vote-gate";
import { SignalStatusBadge } from "@/components/signal/signal-status-badge";
import { SIGNAL_CATEGORY_LABELS } from "@/lib/signal-constants";
import { Card, CardContent } from "@/components/ui/card";

export default async function SignalResultsPage({
  params,
}: {
  params: Promise<{ signalNumber: string }>;
}) {
  const member = await requireMember();
  const { signalNumber } = await params;
  const num = parseInt(signalNumber, 10);

  if (isNaN(num)) notFound();

  const signal = await getSignalByNumber(num);
  if (!signal) notFound();

  const vote = await getMemberVote(signal.id, member.id);
  const hasVoted = !!vote;

  // Not published yet
  if (signal.status !== "PUBLISHED") {
    return (
      <div className="space-y-6">
        <PageHeader title={`Signal #${signal.signalNumber}`}>
          <SignalStatusBadge status={signal.status} />
        </PageHeader>

        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold">
              Results not yet available
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              This Signal&apos;s results will be available once voting closes
              and the results are published.
            </p>
            {signal.status === "LIVE" && !hasVoted && (
              <Link
                href={`/signal/${num}/vote`}
                className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
              >
                Cast your vote now
              </Link>
            )}
            {signal.status === "LIVE" && hasVoted && (
              <p className="mt-4 text-sm text-primary font-medium">
                You&apos;ve already voted. Stay tuned!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Published — check vote gate
  if (!hasVoted) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={`Signal #${signal.signalNumber}`}
          description={SIGNAL_CATEGORY_LABELS[signal.category]}
        />
        <SignalVoteGate hasVoted={false} signalNumber={num}>
          <div />
        </SignalVoteGate>
      </div>
    );
  }

  // Published and member has voted — show results
  const results = await computeResults(num, member.id);
  if (!results) notFound();

  const memberAnswerOption = results.memberAnswer
    ? {
        key: results.memberAnswer,
        label:
          results.distribution.find((d) => d.answer === results.memberAnswer)
            ?.label ?? "",
      }
    : null;

  const topAnswerOption = {
    key: results.topAnswer,
    label: results.topAnswerLabel,
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Signal #${signal.signalNumber}`}
        description={SIGNAL_CATEGORY_LABELS[signal.category]}
      >
        <SignalStatusBadge status={signal.status} />
      </PageHeader>

      <h2 className="text-lg font-semibold leading-snug">
        {signal.question}
      </h2>

      <SignalHeadline
        headline={results.question.headlineInsight}
        signalNumber={signal.signalNumber}
      />

      <SignalYourVsGroup
        memberAnswer={memberAnswerOption}
        topAnswer={topAnswerOption}
        totalVotes={results.totalVotes}
      />

      <SignalResultBars
        distribution={results.distribution}
        totalVotes={results.totalVotes}
        memberAnswer={results.memberAnswer}
      />

      <SignalPeerQuotes quotes={results.anonymousQuotes} />

      <div className="text-center pt-4">
        <Link
          href="/signal/archive"
          className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
        >
          View all Signal results
        </Link>
      </div>
    </div>
  );
}
