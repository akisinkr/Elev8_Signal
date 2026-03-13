"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle2, RefreshCw, Sparkles, X } from "lucide-react";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string | null;
  jobTitle?: string | null;
  spDomain?: string | null;
  spAction?: string | null;
  challengeType1?: string | null;
  challengeSpec1?: string | null;
}

interface MatchScoreData {
  relevanceScore: number;
  reciprocityScore: number;
  contextScore: number;
  totalScore: number;
  tier: string;
  reasoning?: string | null;
}

interface Match {
  id: string;
  member1: Member;
  member2: Member;
  status: string;
  curatorNote?: string | null;
  matchReason?: string | null;
  createdAt: string;
  presentedAt?: string | null;
  acceptedAt?: string | null;
  completedAt?: string | null;
  matchScore?: MatchScoreData | null;
}

interface Proposal {
  member1Id: string;
  member2Id: string;
  relevanceScore: number;
  reciprocityScore: number;
  contextScore: number;
  totalScore: number;
  tier: string;
  reasoning: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PROPOSED:  { label: "Proposed",  color: "text-amber-400",   bg: "bg-amber-400/10"   },
  PRESENTED: { label: "Presented", color: "text-blue-400",    bg: "bg-blue-400/10"    },
  ACCEPTED:  { label: "Accepted",  color: "text-emerald-400", bg: "bg-emerald-400/10" },
  ACTIVE:    { label: "Active",    color: "text-violet-400",  bg: "bg-violet-400/10"  },
  COMPLETED: { label: "Completed", color: "text-muted-foreground", bg: "bg-muted/40"  },
  DECLINED:  { label: "Declined",  color: "text-destructive", bg: "bg-destructive/10" },
};

const TIER_CONFIG: Record<string, { color: string }> = {
  PLATINUM: { color: "text-purple-300 bg-purple-400/10 border-purple-400/20" },
  GOLD:     { color: "text-amber-300 bg-amber-400/10 border-amber-400/20" },
  SILVER:   { color: "text-gray-300 bg-gray-400/10 border-gray-400/20" },
  CURIOUS:  { color: "text-blue-300 bg-blue-400/10 border-blue-400/20" },
};

const STATUS_TABS = ["ALL", "PROPOSED", "PRESENTED", "ACCEPTED", "ACTIVE", "COMPLETED"];

export default function AdminMatchesPage() {
  const [matches, setMatches] = React.useState<Match[]>([]);
  const [proposals, setProposals] = React.useState<Proposal[]>([]);
  const [members, setMembers] = React.useState<Member[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [generating, setGenerating] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("ALL");
  const [showProposals, setShowProposals] = React.useState(false);

  const fetchMatches = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/matches");
      if (res.ok) setMatches(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const fetchMembers = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/members");
      if (res.ok) setMembers(await res.json());
    } catch { /* ignore */ }
  }, []);

  React.useEffect(() => { fetchMatches(); fetchMembers(); }, [fetchMatches, fetchMembers]);

  const generateProposals = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/matches/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 20 }),
      });
      if (res.ok) {
        const data = await res.json();
        setProposals(data.proposals || []);
        setShowProposals(true);
      }
    } catch { /* ignore */ }
    setGenerating(false);
  };

  const createMatch = async (proposal: Proposal) => {
    try {
      const res = await fetch("/api/admin/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member1Id: proposal.member1Id,
          member2Id: proposal.member2Id,
          curatorNote: `AI Match: ${proposal.reasoning}`,
        }),
      });
      if (res.ok) {
        setProposals(prev => prev.filter(p =>
          p.member1Id !== proposal.member1Id || p.member2Id !== proposal.member2Id
        ));
        fetchMatches();
      }
    } catch { /* ignore */ }
  };

  const updateStatus = async (matchId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/matches/${matchId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchMatches();
    } catch { /* ignore */ }
  };

  const filtered = activeTab === "ALL" ? matches : matches.filter(m => m.status === activeTab);
  const getMemberName = (id: string) => {
    const m = members.find(mem => mem.id === id);
    return m ? `${m.firstName} ${m.lastName}` : id.slice(0, 8);
  };

  const stats = {
    total: matches.length,
    proposed: matches.filter(m => m.status === "PROPOSED").length,
    active: matches.filter(m => m.status === "ACTIVE" || m.status === "ACCEPTED").length,
    completed: matches.filter(m => m.status === "COMPLETED").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Match Curator</h1>
          <p className="text-muted-foreground text-sm mt-1">Generate, review, and present superpower matches.</p>
        </div>
        <button onClick={generateProposals} disabled={generating}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 disabled:opacity-50 text-sm font-medium transition-colors">
          {generating ? <RefreshCw className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          {generating ? "Generating..." : "Generate Matches"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-white/70" },
          { label: "Proposed", value: stats.proposed, color: "text-amber-400" },
          { label: "Active", value: stats.active, color: "text-violet-400" },
          { label: "Completed", value: stats.completed, color: "text-emerald-400" },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
            <div className={cn("text-2xl font-bold", s.color)}>{s.value}</div>
            <div className="text-[10px] text-white/30 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* AI Proposals Panel */}
      {showProposals && proposals.length > 0 && (
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.03] p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-amber-300">AI Match Proposals ({proposals.length})</h3>
            <button onClick={() => setShowProposals(false)} className="text-white/30 hover:text-white/60">
              <X className="size-4" />
            </button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {proposals.map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/70">{getMemberName(p.member1Id)}</span>
                    <ArrowRight className="size-3 text-white/20" />
                    <span className="text-sm text-white/70">{getMemberName(p.member2Id)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full border", TIER_CONFIG[p.tier]?.color || "")}>
                      {p.tier}
                    </span>
                    <span className="text-[10px] text-white/30">
                      Score: {p.totalScore} (R:{p.relevanceScore} Rec:{p.reciprocityScore} C:{p.contextScore})
                    </span>
                  </div>
                </div>
                <button onClick={() => createMatch(p)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-medium">
                  Create
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Tabs */}
      <div className="flex gap-1 border-b border-white/[0.06]">
        {STATUS_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn(
              "px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-[1px]",
              activeTab === tab
                ? "border-amber-400/60 text-white/80"
                : "border-transparent text-white/30 hover:text-white/50"
            )}>
            {tab === "ALL" ? `All (${matches.length})` : `${STATUS_CONFIG[tab]?.label || tab} (${matches.filter(m => m.status === tab).length})`}
          </button>
        ))}
      </div>

      {/* Matches List */}
      {loading ? (
        <div className="text-center py-8 text-white/30 text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-white/30 text-sm">No matches found.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(match => {
            const statusCfg = STATUS_CONFIG[match.status] || { label: match.status, color: "text-white/40", bg: "bg-white/5" };
            const tier = match.matchScore?.tier;
            const nextStatus = getNextStatus(match.status);

            return (
              <div key={match.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <MemberBadge member={match.member1} />
                      <ArrowRight className="size-3 text-white/20 shrink-0" />
                      <MemberBadge member={match.member2} />
                    </div>
                    {match.curatorNote && (
                      <p className="text-[11px] text-white/20 mt-1.5 truncate">{match.curatorNote}</p>
                    )}
                    {match.matchScore && (
                      <p className="text-[10px] text-white/25 mt-1">
                        Score: {match.matchScore.totalScore} | R:{match.matchScore.relevanceScore} Rec:{match.matchScore.reciprocityScore} C:{match.matchScore.contextScore}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {tier && (
                      <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full border", TIER_CONFIG[tier]?.color || "")}>
                        {tier}
                      </span>
                    )}
                    <span className={cn("text-[10px] px-2 py-1 rounded-full", statusCfg.bg, statusCfg.color)}>
                      {statusCfg.label}
                    </span>
                    {nextStatus && (
                      <button onClick={() => updateStatus(match.id, nextStatus)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[10px] text-white/50 hover:text-white/70 transition-colors">
                        {nextStatus === "COMPLETED" ? <CheckCircle2 className="size-3" /> : <ArrowRight className="size-3" />}
                        {STATUS_CONFIG[nextStatus]?.label}
                      </button>
                    )}
                    {match.status !== "DECLINED" && match.status !== "COMPLETED" && (
                      <button onClick={() => updateStatus(match.id, "DECLINED")}
                        className="p-1 rounded-lg hover:bg-destructive/10 text-white/20 hover:text-destructive transition-colors">
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MemberBadge({ member }: { member: Member }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="size-6 rounded-full bg-white/[0.08] flex items-center justify-center text-[9px] font-medium text-white/50">
        {member.firstName[0]}{member.lastName[0]}
      </div>
      <div>
        <span className="text-xs text-white/70">{member.firstName} {member.lastName}</span>
        {member.jobTitle && (
          <span className="text-[10px] text-white/25 ml-1">{member.jobTitle}{member.company ? ` @ ${member.company}` : ""}</span>
        )}
      </div>
    </div>
  );
}

function getNextStatus(current: string): string | null {
  const flow: Record<string, string> = {
    PROPOSED: "PRESENTED",
    PRESENTED: "ACCEPTED",
    ACCEPTED: "ACTIVE",
    ACTIVE: "COMPLETED",
  };
  return flow[current] || null;
}
