import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { SignalStatusBadge } from "@/components/signal/signal-status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { SIGNAL_CATEGORY_LABELS, SIGNAL_ANSWER_KEYS } from "@/lib/signal-constants";
import { SignalCopyLinks } from "@/components/admin/signal/signal-copy-links";
import { AdminSignalActions } from "./admin-signal-actions";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

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
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                Question
              </p>
              <p className="text-sm font-medium leading-snug">
                {signal.question}
              </p>
              {signal.questionKr && (
                <p className="text-sm text-muted-foreground leading-snug mt-1">
                  {signal.questionKr}
                </p>
              )}
            </div>
            <Link href={`/admin/signal/${signal.signalNumber}/edit`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Pencil className="size-3.5" />
                Edit
              </Button>
            </Link>
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
                const krMap: Record<string, string | null> = {
                  A: signal.optionAKr,
                  B: signal.optionBKr,
                  C: signal.optionCKr,
                  D: signal.optionDKr,
                  E: signal.optionEKr,
                };
                return (
                  <div key={key} className="text-sm">
                    <span>
                      <span className="font-medium">{key}.</span>{" "}
                      {optionMap[key]}
                    </span>
                    {krMap[key] && (
                      <span className="text-muted-foreground ml-2">
                        / {krMap[key]}
                      </span>
                    )}
                  </div>
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
