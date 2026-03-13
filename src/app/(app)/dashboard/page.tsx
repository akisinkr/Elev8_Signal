import { requireMember } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const member = await requireMember();

  const [activeMatches, recentVotes, confidenceScore, pendingFeedback] = await Promise.all([
    prisma.match.findMany({
      where: {
        OR: [{ member1Id: member.id }, { member2Id: member.id }],
        status: { in: ["PRESENTED", "ACCEPTED", "ACTIVE"] },
      },
      include: {
        member1: { select: { id: true, firstName: true, lastName: true, imageUrl: true, customPhotoUrl: true, jobTitle: true, company: true, spDomain: true } },
        member2: { select: { id: true, firstName: true, lastName: true, imageUrl: true, customPhotoUrl: true, jobTitle: true, company: true, spDomain: true } },
        matchScore: true,
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.signalVote.findMany({
      where: { memberId: member.id },
      include: { question: { select: { signalNumber: true, question: true, status: true } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
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
  ]);

  const domainLabel = member.spDomain?.split(",")[0] || null;
  const actionLabel = member.spAction?.split(",")[0] || null;

  const getPartner = (match: typeof activeMatches[0]) =>
    match.member1Id === member.id ? match.member2 : match.member1;

  const tierColor: Record<string, string> = {
    PLATINUM: "text-purple-300 bg-purple-400/10 border-purple-400/20",
    GOLD: "text-amber-300 bg-amber-400/10 border-amber-400/20",
    SILVER: "text-gray-300 bg-gray-400/10 border-gray-400/20",
    CURIOUS: "text-blue-300 bg-blue-400/10 border-blue-400/20",
  };

  const statusLabel: Record<string, { text: string; color: string }> = {
    PRESENTED: { text: "New Match", color: "text-amber-300 bg-amber-400/10" },
    ACCEPTED: { text: "Accepted", color: "text-green-300 bg-green-400/10" },
    ACTIVE: { text: "Active", color: "text-blue-300 bg-blue-400/10" },
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Welcome back, {member.firstName}
        </h1>
        <p className="text-white/40 mt-1 text-sm">
          Here&apos;s what&apos;s happening with your Superpower exchanges.
        </p>
      </div>

      {/* Superpower + Confidence Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <span className="text-[10px] font-semibold tracking-[0.2em] text-amber-400/60 uppercase">Your Superpower</span>
          {domainLabel ? (
            <div className="mt-3 space-y-1.5">
              <p className="text-white/80 text-sm font-medium">{domainLabel}</p>
              {actionLabel && <p className="text-white/40 text-xs">{actionLabel}</p>}
              {member.spScale && <p className="text-white/30 text-[11px]">Scale: {member.spScale.split(",")[0]}</p>}
              {member.spGeo && <p className="text-white/30 text-[11px]">Geo: {member.spGeo.split(",")[0]}</p>}
            </div>
          ) : (
            <p className="text-white/30 text-sm mt-3">
              Complete your profile to see your superpower.{" "}
              <Link href="/profile" className="text-amber-400/60 hover:text-amber-400/80">Edit Profile</Link>
            </p>
          )}
          <Link href="/profile" className="inline-block mt-3 text-[11px] text-amber-400/50 hover:text-amber-400/80">
            View full card →
          </Link>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <span className="text-[10px] font-semibold tracking-[0.2em] text-amber-400/60 uppercase">Confidence Score</span>
          {confidenceScore ? (
            <div className="mt-3 space-y-3">
              <div className="text-3xl font-bold text-white/90">{Math.round(confidenceScore.composite)}</div>
              <div className="space-y-1.5">
                <ScoreBar label="Self-declared" value={confidenceScore.selfDeclared} max={30} />
                <ScoreBar label="Xray-verified" value={confidenceScore.xrayVerified} max={40} />
                <ScoreBar label="Peer-validated" value={confidenceScore.peerValidated} max={30} />
              </div>
            </div>
          ) : (
            <p className="text-white/30 text-sm mt-3">Complete onboarding to get your score.</p>
          )}
        </div>
      </div>

      {/* Active Matches */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white/70">Active Matches</h2>
          <Link href="/matches" className="text-[11px] text-amber-400/50 hover:text-amber-400/80">View all →</Link>
        </div>
        {activeMatches.length > 0 ? (
          <div className="space-y-2">
            {activeMatches.map((match) => {
              const partner = getPartner(match);
              const photo = partner.customPhotoUrl || partner.imageUrl;
              const status = statusLabel[match.status] || { text: match.status, color: "text-white/40" };
              const lastMsg = match.messages[0];
              const tier = match.matchScore?.tier;

              return (
                <Link key={match.id} href={match.status === "ACTIVE" ? `/exchange/${match.id}` : `/matches`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  {photo ? (
                    <img src={photo} alt={partner.firstName} className="size-10 rounded-full object-cover border border-white/[0.08]" />
                  ) : (
                    <div className="size-10 rounded-full bg-white/[0.08] flex items-center justify-center text-xs font-medium text-white/50">
                      {partner.firstName[0]}{partner.lastName[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white/80">{partner.firstName} {partner.lastName}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${status.color}`}>{status.text}</span>
                      {tier && <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${tierColor[tier] || ""}`}>{tier}</span>}
                    </div>
                    <p className="text-xs text-white/30 truncate">{partner.jobTitle}{partner.company ? ` at ${partner.company}` : ""}</p>
                    {lastMsg && <p className="text-[11px] text-white/20 mt-0.5 truncate">{lastMsg.content}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
            <p className="text-white/30 text-sm">No active matches yet.</p>
            <p className="text-white/20 text-xs mt-1">Matches will appear here once curated for you.</p>
          </div>
        )}
      </div>

      {/* Pending Feedback */}
      {pendingFeedback.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-white/70 mb-3">Pending Feedback</h2>
          <div className="space-y-2">
            {pendingFeedback.map((match) => {
              const partner = match.member1Id === member.id ? match.member2 : match.member1;
              return (
                <Link key={match.id} href={`/exchange/${match.id}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-amber-400/10 bg-amber-400/[0.03] hover:bg-amber-400/[0.06] transition-colors">
                  <span className="text-sm text-white/60">Share feedback about your exchange with {partner.firstName}</span>
                  <span className="text-[11px] text-amber-400/60">Give Feedback →</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Signal Votes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white/70">Recent Signal Votes</h2>
          <Link href="/signal" className="text-[11px] text-amber-400/50 hover:text-amber-400/80">Vote now →</Link>
        </div>
        {recentVotes.length > 0 ? (
          <div className="space-y-1.5">
            {recentVotes.map((vote) => (
              <div key={vote.id} className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.04] bg-white/[0.01]">
                <span className="text-[10px] text-white/20 font-mono">#{vote.question.signalNumber}</span>
                <span className="text-xs text-white/40 truncate flex-1">{vote.question.question}</span>
                <span className="text-[10px] text-amber-400/50 font-medium">{vote.answer}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-6 text-center">
            <p className="text-white/30 text-sm">No votes yet.</p>
            <Link href="/signal" className="text-[11px] text-amber-400/50 hover:text-amber-400/80 mt-1 inline-block">
              Cast your first vote →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] text-white/30 w-24 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div className="h-full bg-amber-400/40 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-white/30 w-8 text-right">{Math.round(value)}</span>
    </div>
  );
}
