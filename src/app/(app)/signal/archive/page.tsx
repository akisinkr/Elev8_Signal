import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentMember } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { SignalCard } from "@/components/signal/signal-card";
import { BackButton } from "@/components/signal/back-button";
import { SIGNAL_CATEGORY_LABELS } from "@/lib/signal-constants";
import { SIGNAL_ANSWER_KEYS } from "@/lib/signal-constants";
import { Zap, ArrowRight } from "lucide-react";

export default async function SignalArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; from?: string }>;
}) {
  const { email, from } = await searchParams;

  // Try Clerk auth first (wrapped — Clerk may throw on key mismatch), fall back to email param
  let clerkMember = null;
  try { clerkMember = await getCurrentMember(); } catch { /* ignore */ }
  const memberEmail = clerkMember?.email ?? email?.toLowerCase();

  if (!memberEmail) {
    redirect("/signal");
  }

  // Look up member by email
  const member = clerkMember ?? await prisma.member.findUnique({
    where: { email: memberEmail },
  });

  if (!member) {
    redirect("/signal");
  }

  const signals = await prisma.signalQuestion.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { signalNumber: "desc" },
    include: {
      votes: { select: { id: true, memberId: true, answer: true } },
    },
  });

  if (signals.length === 0) {
    const backParams = new URLSearchParams();
    if (email) backParams.set("email", email);
    const backHref = from ? `/signal/${from}/vote?${backParams.toString()}` : `/signal`;
    return (
      <div className="space-y-6">
        <PageHeader title="Signal Archive">
          <BackButton href={backHref} />
        </PageHeader>
        <EmptyState
          title="No published signals yet"
          description="Past Signal results will appear here once they are published."
        />
      </div>
    );
  }

  const cardCompleted = !!member.cardCompletedAt;

  // Build back href: go to the signal the user came from, or /signal if unknown
  const backParams = new URLSearchParams();
  if (email) backParams.set("email", email);
  const backHref = from
    ? `/signal/${from}/vote?${backParams.toString()}`
    : `/signal`;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] tracking-[0.2em] uppercase text-[#C8A84E]/40">Signal Archive</span>
          <BackButton href={backHref} />
        </div>
        <h1 className="text-2xl font-light tracking-tight text-white/90">Past Signals</h1>
        <p className="text-[13px] text-white/30 mt-1">Browse past questions and see how members voted.</p>
      </div>

      {/* Soft Superpower card nudge — only shown if card not yet completed */}
      {!cardCompleted && (
        <div className="rounded-xl border border-[#C8A84E]/15 bg-[#C8A84E]/[0.03] p-5 flex items-center gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#C8A84E]/10">
            <Zap className="size-5 text-[#C8A84E]/60" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-light text-white/80">Make yourself findable</p>
            <p className="text-[12px] text-white/30 mt-0.5">
              Complete your Superpower card so other members can find you.
            </p>
          </div>
          <Link
            href={`/profile?email=${encodeURIComponent(memberEmail)}`}
            className="shrink-0 flex items-center gap-1.5 rounded-xl bg-[#C8A84E] px-4 py-2 text-xs font-medium text-[#0A0F1C] hover:bg-[#C8A84E]/90 transition-all"
          >
            Build card
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}

      {/* Signal list */}
      <div className="space-y-4">
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
              email={memberEmail}
            />
          );
        })}
      </div>
    </div>
  );
}
