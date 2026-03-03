import { notFound } from "next/navigation";
import { requireMember } from "@/lib/auth";
import { getSignalByNumber, getMemberVote, computeResults } from "@/lib/signal";
import { SignalHeadline } from "@/components/signal/signal-headline";
import { SignalYourVsGroup } from "@/components/signal/signal-your-vs-group";
import { SignalResultBars } from "@/components/signal/signal-result-bars";
import { SignalPeerQuotes } from "@/components/signal/signal-peer-quotes";
import { SignalVoteGate } from "@/components/signal/signal-vote-gate";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

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
        <h1 className="text-lg font-semibold tracking-tight">
          Signal #{signal.signalNumber}
        </h1>

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
        <h1 className="text-lg font-semibold tracking-tight">
          Signal #{signal.signalNumber}
        </h1>
        <SignalVoteGate hasVoted={false} signalNumber={num} status={signal.status}>
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
      <h1 className="text-lg font-semibold tracking-tight">
        Signal #{signal.signalNumber}
      </h1>

      <h2 className="text-xl font-bold leading-snug">{signal.question}</h2>

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
    </div>
  );
}
