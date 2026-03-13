import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await requireAdmin();

  const [
    totalMembers,
    onboardedMembers,
    cardCompleted,
    totalMatches,
    matchesByStatus,
    totalFeedback,
    positiveFeedback,
    totalVotes,
    xrayCompleted,
    avgConfidence,
  ] = await Promise.all([
    prisma.member.count(),
    prisma.member.count({ where: { onboardingState: "COMPLETED" } }),
    prisma.member.count({ where: { cardCompletedAt: { not: null } } }),
    prisma.match.count(),
    prisma.match.groupBy({ by: ["status"], _count: true }),
    prisma.exchangeFeedback.count(),
    prisma.exchangeFeedback.count({ where: { questionKey: "THE_COFFEE", response: { startsWith: "Yes" } } }),
    prisma.signalVote.count(),
    prisma.xrayProfile.count({ where: { status: "COMPLETED" } }),
    prisma.confidenceScore.aggregate({ _avg: { composite: true } }),
  ]);

  const statusCounts = Object.fromEntries(
    matchesByStatus.map(s => [s.status, s._count])
  );

  const matchFunnel = [
    { label: "Generated", count: statusCounts["PROPOSED"] || 0, color: "text-amber-400" },
    { label: "Presented", count: statusCounts["PRESENTED"] || 0, color: "text-blue-400" },
    { label: "Accepted", count: statusCounts["ACCEPTED"] || 0, color: "text-emerald-400" },
    { label: "Active", count: statusCounts["ACTIVE"] || 0, color: "text-violet-400" },
    { label: "Completed", count: statusCounts["COMPLETED"] || 0, color: "text-white/60" },
    { label: "Declined", count: statusCounts["DECLINED"] || 0, color: "text-red-400" },
  ];

  const onboardingRate = totalMembers > 0 ? Math.round((onboardedMembers / totalMembers) * 100) : 0;
  const cardRate = totalMembers > 0 ? Math.round((cardCompleted / totalMembers) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Superpower Engine metrics and engagement data.</p>
      </div>

      {/* Member Metrics */}
      <div>
        <h2 className="text-sm font-semibold text-white/50 mb-3 uppercase tracking-wider">Members</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Members" value={totalMembers} />
          <StatCard label="Onboarded" value={onboardedMembers} sub={`${onboardingRate}%`} />
          <StatCard label="Card Completed" value={cardCompleted} sub={`${cardRate}%`} />
          <StatCard label="Xray Analyzed" value={xrayCompleted} />
        </div>
      </div>

      {/* Match Funnel */}
      <div>
        <h2 className="text-sm font-semibold text-white/50 mb-3 uppercase tracking-wider">Match Funnel</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {matchFunnel.map(f => (
            <div key={f.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
              <div className={`text-xl font-bold ${f.color}`}>{f.count}</div>
              <div className="text-[10px] text-white/30 mt-0.5">{f.label}</div>
            </div>
          ))}
        </div>
        {totalMatches > 0 && (
          <div className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-white/40">Conversion funnel</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden flex">
              {matchFunnel.filter(f => f.count > 0 && f.label !== "Declined").map(f => (
                <div key={f.label}
                  className={`h-full ${f.color.replace("text-", "bg-").replace("/400", "/30").replace("/60", "/20")}`}
                  style={{ width: `${(f.count / totalMatches) * 100}%` }}
                  title={`${f.label}: ${f.count}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Engagement */}
      <div>
        <h2 className="text-sm font-semibold text-white/50 mb-3 uppercase tracking-wider">Engagement</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Votes" value={totalVotes} />
          <StatCard label="Feedback Given" value={totalFeedback} sub={`${Math.round(totalFeedback / 5)} exchanges`} />
          <StatCard label="Positive Recommendations" value={positiveFeedback} />
          <StatCard label="Avg Confidence" value={Math.round(avgConfidence._avg?.composite || 0)} sub="/100" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="text-2xl font-bold text-white/80">
        {value}
        {sub && <span className="text-sm font-normal text-white/30 ml-1">{sub}</span>}
      </div>
      <div className="text-[11px] text-white/30 mt-1">{label}</div>
    </div>
  );
}
