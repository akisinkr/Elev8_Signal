import { requireMember } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { SignalCard } from "@/components/signal/signal-card";
import { SIGNAL_CATEGORY_LABELS } from "@/lib/signal-constants";
import { SIGNAL_ANSWER_KEYS } from "@/lib/signal-constants";

export default async function SignalArchivePage() {
  const member = await requireMember();

  const signals = await prisma.signalQuestion.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { signalNumber: "desc" },
    include: {
      votes: { select: { id: true, memberId: true, answer: true } },
    },
  });

  if (signals.length === 0) {
    return (
      <div>
        <PageHeader title="Signal Archive" />
        <EmptyState
          title="No published signals yet"
          description="Past Signal results will appear here once they are published."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Signal Archive"
        description="Browse past Signal questions and community insights."
      />

      <div className="space-y-3">
        {signals.map((signal) => {
          const hasVoted = signal.votes.some(
            (v) => v.memberId === member.id
          );
          const totalVotes = signal.votes.length;

          // Calculate top answer
          const counts = SIGNAL_ANSWER_KEYS.map((key) => ({
            key,
            count: signal.votes.filter((v) => v.answer === key).length,
          }));
          const sorted = [...counts].sort((a, b) => b.count - a.count);
          const topAnswerKey = sorted[0]?.key ?? "A";

          const optionMap: Record<string, string> = {
            A: signal.optionA,
            B: signal.optionB,
            C: signal.optionC,
            D: signal.optionD,
            E: signal.optionE,
          };

          return (
            <SignalCard
              key={signal.id}
              signalNumber={signal.signalNumber}
              question={signal.question}
              category={SIGNAL_CATEGORY_LABELS[signal.category]}
              totalVotes={totalVotes}
              topAnswer={`${topAnswerKey}. ${optionMap[topAnswerKey]}`}
              publishedAt={
                signal.publishedAt?.toISOString() ?? signal.createdAt.toISOString()
              }
              hasVoted={hasVoted}
            />
          );
        })}
      </div>
    </div>
  );
}
