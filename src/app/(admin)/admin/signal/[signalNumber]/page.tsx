import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { SignalStatusBadge } from "@/components/signal/signal-status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { SIGNAL_CATEGORY_LABELS, SIGNAL_ANSWER_KEYS } from "@/lib/signal-constants";
import { SignalCopyLinks } from "@/components/admin/signal/signal-copy-links";
import { AdminSignalActions } from "./admin-signal-actions";
import { ArrowLeft } from "lucide-react";

export default async function AdminSignalDetailPage({
  params,
}: {
  params: Promise<{ signalNumber: string }>;
}) {
  await requireAdmin();
  const { signalNumber } = await params;
  const num = parseInt(signalNumber, 10);

  if (isNaN(num)) notFound();

  const signal = await prisma.signalQuestion.findUnique({
    where: { signalNumber: num },
    include: {
      votes: {
        include: { member: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!signal) notFound();

  // Build distribution for stats
  const totalVotes = signal.votes.length;
  const distribution = SIGNAL_ANSWER_KEYS.map((answer) => {
    const optionMap: Record<string, string> = {
      A: signal.optionA,
      B: signal.optionB,
      C: signal.optionC,
      D: signal.optionD,
      E: signal.optionE,
    };
    const count = signal.votes.filter((v) => v.answer === answer).length;
    return {
      answer,
      label: optionMap[answer],
      count,
      percentage: totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0,
    };
  });

  const votes = signal.votes.map((v) => ({
    answer: v.answer,
    memberName: `${v.member.firstName} ${v.member.lastName}`,
    why: v.why,
    createdAt: v.createdAt.toISOString(),
    resultEmailSentAt: v.resultEmailSentAt?.toISOString() ?? null,
  }));

  return (
    <div className="space-y-8">
      <Link
        href="/admin/signal"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Signals
      </Link>

      <PageHeader title={`Signal #${signal.signalNumber}`}>
        <SignalCopyLinks signalNumber={signal.signalNumber} status={signal.status} />
        <SignalStatusBadge status={signal.status} />
      </PageHeader>

      {/* Question display */}
      <Card>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Question
            </p>
            <p className="text-sm font-medium leading-snug">
              {signal.question}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
              Options
            </p>
            <div className="space-y-1">
              {SIGNAL_ANSWER_KEYS.map((key) => {
                const optionMap: Record<string, string> = {
                  A: signal.optionA,
                  B: signal.optionB,
                  C: signal.optionC,
                  D: signal.optionD,
                  E: signal.optionE,
                };
                return (
                  <p key={key} className="text-sm">
                    <span className="font-medium">{key}.</span>{" "}
                    {optionMap[key]}
                  </p>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{SIGNAL_CATEGORY_LABELS[signal.category]}</span>
            {signal.voteDeadline && (
              <span>
                Deadline:{" "}
                {new Date(signal.voteDeadline).toLocaleDateString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Admin actions (publish panel + vote stats) */}
      <AdminSignalActions
        signalNumber={signal.signalNumber}
        question={signal.question}
        status={signal.status}
        headlineInsight={signal.headlineInsight}
        votes={votes}
        distribution={distribution}
      />
    </div>
  );
}
