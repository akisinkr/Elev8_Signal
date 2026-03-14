import { requireMember } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const member = await requireMember();

  const [activeMatchCount, presentedMatches, voteCount, confidenceScore, pendingFeedback, liveSignal] = await Promise.all([
    prisma.match.count({
      where: {
        OR: [{ member1Id: member.id }, { member2Id: member.id }],
        status: { in: ["PRESENTED", "ACCEPTED", "ACTIVE"] },
      },
    }),
    prisma.match.findMany({
      where: {
        OR: [{ member1Id: member.id }, { member2Id: member.id }],
        status: "PRESENTED",
      },
      include: {
        member1: { select: { firstName: true, lastName: true } },
        member2: { select: { firstName: true, lastName: true } },
      },
      take: 3,
    }),
    prisma.signalVote.count({ where: { memberId: member.id } }),
    prisma.confidenceScore.findUnique({ where: { memberId: member.id } }),
    prisma.match.findMany({
      where: {
        OR: [{ member1Id: member.id }, { member2Id: member.id }],
        status: "COMPLETED",
        exchangeFeedback: { none: { memberId: member.id } },
      },
      include: {
        member1: { select: { firstName: true, lastName: true } },
        member2: { select: { firstName: true, lastName: true } },
      },
      take: 5,
    }),
    prisma.signalQuestion.findFirst({
      where: { status: "LIVE" },
      select: { signalNumber: true, question: true },
    }),
  ]);

  // Check if member already voted on the live signal
  let hasVotedLive = false;
  if (liveSignal) {
    const existingVote = await prisma.signalVote.findFirst({
      where: {
        memberId: member.id,
        question: { signalNumber: liveSignal.signalNumber },
      },
    });
    hasVotedLive = !!existingVote;
  }

  const profileIncomplete = !member.cardCompletedAt;
  const score = confidenceScore ? Math.round(confidenceScore.composite) : null;

  // Build action nudges in priority order
  const nudges: { type: string; text: string; subtext?: string; href: string }[] = [];

  if (profileIncomplete) {
    nudges.push({
      type: "profile",
      text: "Complete your Elev8 profile",
      subtext: "Share your superpower so we can find you the right connections.",
      href: "/profile",
    });
  }

  for (const match of pendingFeedback) {
    const partner = match.member1Id === member.id ? match.member2 : match.member1;
    if (!partner) continue;
    nudges.push({
      type: "feedback",
      text: `Share feedback about your exchange with ${partner.firstName}`,
      href: `/exchange/${match.id}`,
    });
  }

  for (const match of presentedMatches) {
    const partner = match.member1Id === member.id ? match.member2 : match.member1;
    if (!partner) continue;
    nudges.push({
      type: "match",
      text: `New match: ${partner.firstName} ${partner.lastName} is waiting`,
      href: "/matches",
    });
  }

  if (liveSignal && !hasVotedLive) {
    nudges.push({
      type: "signal",
      text: `Signal #${liveSignal.signalNumber} is live`,
      subtext: liveSignal.question.length > 80 ? liveSignal.question.slice(0, 80) + "..." : liveSignal.question,
      href: `/signal/${liveSignal.signalNumber}/vote`,
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Welcome back, {member.firstName}
        </h1>
        <p className="text-white/40 mt-1 text-sm">
          Your Elev8 at a glance.
        </p>
      </div>

      {/* Status Pills */}
      <div className="grid grid-cols-3 gap-3">
        <Link href="/profile" className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors text-center">
          <div className="text-2xl font-bold text-white/90">{score ?? "—"}</div>
          <div className="text-[10px] text-white/30 mt-1 uppercase tracking-wider">Score</div>
        </Link>
        <Link href="/matches" className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors text-center">
          <div className="text-2xl font-bold text-white/90">{activeMatchCount}</div>
          <div className="text-[10px] text-white/30 mt-1 uppercase tracking-wider">Matches</div>
        </Link>
        <Link href="/signal" className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors text-center">
          <div className="text-2xl font-bold text-white/90">{voteCount}</div>
          <div className="text-[10px] text-white/30 mt-1 uppercase tracking-wider">Signals</div>
        </Link>
      </div>

      {/* Action Nudges */}
      {nudges.length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold text-white/70 mb-3">What&apos;s next</h2>
          <div className="space-y-2">
            {nudges.map((nudge, i) => (
              <Link key={i} href={nudge.href}
                className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors group">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white/70 group-hover:text-white/90 transition-colors">{nudge.text}</p>
                  {nudge.subtext && <p className="text-[11px] text-white/30 mt-0.5 truncate">{nudge.subtext}</p>}
                </div>
                <span className="text-[11px] text-amber-400/50 group-hover:text-amber-400/80 shrink-0 ml-3 transition-colors">View →</span>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
          <p className="text-white/50 text-sm font-medium">You&apos;re all caught up.</p>
          <p className="text-white/25 text-xs mt-1">We&apos;ll let you know when something needs your attention.</p>
        </div>
      )}
    </div>
  );
}
