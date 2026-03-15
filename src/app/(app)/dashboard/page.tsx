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

  // Time-aware greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Member identity line
  const identity = [member.jobTitle, member.company].filter(Boolean).join(", ");

  return (
    <div className="space-y-10">
      {/* Greeting + Identity */}
      <div>
        <h1 className="text-3xl font-light tracking-tight text-white">
          {greeting}, {member.firstName}
        </h1>
        {identity && (
          <p className="text-white/30 mt-2 text-sm tracking-wide">
            {identity}
          </p>
        )}
      </div>

      {/* Confidence Score — Hero */}
      <Link href="/profile" className="block rounded-2xl border border-[#C8A84E]/[0.08] bg-[#C8A84E]/[0.02] p-8 hover:bg-[#C8A84E]/[0.04] transition-all group">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-white/30 uppercase tracking-[0.15em] mb-2">Confidence Score</div>
            <div className="text-5xl font-light text-[#C8A84E] tracking-tight">{score ?? "—"}</div>
          </div>
          <div className="flex gap-8 text-center">
            <div>
              <div className="text-xl font-light text-white/80">{activeMatchCount}</div>
              <div className="text-[10px] text-white/25 mt-1 uppercase tracking-wider">Matches</div>
            </div>
            <div>
              <div className="text-xl font-light text-white/80">{voteCount}</div>
              <div className="text-[10px] text-white/25 mt-1 uppercase tracking-wider">Signals</div>
            </div>
          </div>
        </div>
        {member.spDomain && (
          <div className="mt-4 pt-4 border-t border-[#C8A84E]/[0.06]">
            <span className="text-xs text-[#C8A84E]/60">{member.spDomain}</span>
          </div>
        )}
      </Link>

      {/* Action Nudges */}
      {nudges.length > 0 ? (
        <div className="space-y-2">
          {nudges.map((nudge, i) => {
            const isSignal = nudge.type === "signal";
            return (
              <Link key={i} href={nudge.href}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all group ${
                  isSignal
                    ? "border-l-2 border-l-[#C8A84E]/40 border-y-[#C8A84E]/[0.06] border-r-[#C8A84E]/[0.06] bg-[#C8A84E]/[0.02] hover:bg-[#C8A84E]/[0.04]"
                    : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                }`}>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm transition-colors ${
                    isSignal ? "text-[#C8A84E]/80 group-hover:text-[#C8A84E]" : "text-white/60 group-hover:text-white/80"
                  }`}>{nudge.text}</p>
                  {nudge.subtext && <p className="text-[11px] text-white/25 mt-0.5 truncate">{nudge.subtext}</p>}
                </div>
                <span className="text-[11px] text-[#C8A84E]/40 group-hover:text-[#C8A84E]/70 shrink-0 ml-3 transition-colors">→</span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-10 text-center">
          <p className="text-white/40 text-sm font-light">Nothing pending. Enjoy the quiet.</p>
        </div>
      )}
    </div>
  );
}
