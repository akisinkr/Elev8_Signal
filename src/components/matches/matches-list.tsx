"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, X, MessageSquare } from "lucide-react";

interface MatchMember {
  id: string;
  firstName: string;
  lastName: string;
  imageUrl: string | null;
  customPhotoUrl: string | null;
  jobTitle: string | null;
  company: string | null;
  spDomain: string | null;
  spAction: string | null;
  challengeType1: string | null;
  challengeSpec1: string | null;
}

interface MatchData {
  id: string;
  member1: MatchMember;
  member2: MatchMember;
  member1Id: string;
  member2Id: string;
  status: string;
  matchReason: string | null;
  matchReasonKr: string | null;
  matchScore: {
    relevanceScore: number;
    reciprocityScore: number;
    contextScore: number;
    totalScore: number;
    tier: string;
    reasoning: string | null;
  } | null;
  messages: { content: string; createdAt: string }[];
  createdAt: string;
}

const TIER_STYLES: Record<string, { label: string; border: string; text: string; bg: string }> = {
  PLATINUM: { label: "Platinum", border: "border-purple-400/30", text: "text-purple-300", bg: "bg-purple-400/10" },
  GOLD:     { label: "Gold",    border: "border-[#C8A84E]/30",  text: "text-[#C8A84E]/70",  bg: "bg-[#C8A84E]/10" },
  SILVER:   { label: "Silver",  border: "border-gray-400/30",   text: "text-gray-300",   bg: "bg-gray-400/10" },
  CURIOUS:  { label: "Curious", border: "border-blue-400/30",   text: "text-blue-300",   bg: "bg-blue-400/10" },
};

const STATUS_STYLES: Record<string, { label: string; color: string }> = {
  PRESENTED: { label: "New Match", color: "text-[#C8A84E]/70 bg-[#C8A84E]/10" },
  ACCEPTED:  { label: "Accepted",  color: "text-green-300 bg-green-400/10" },
  ACTIVE:    { label: "Active",    color: "text-blue-300 bg-blue-400/10" },
  COMPLETED: { label: "Completed", color: "text-white/40 bg-white/[0.06]" },
  DECLINED:  { label: "Declined",  color: "text-red-300 bg-red-400/10" },
};

const TABS = ["ALL", "PRESENTED", "ACTIVE", "COMPLETED"] as const;

export function MatchesList({ matches, memberId }: { matches: MatchData[]; memberId: string }) {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [responding, setResponding] = useState<string | null>(null);
  const router = useRouter();

  const filtered = activeTab === "ALL"
    ? matches
    : matches.filter(m => {
        if (activeTab === "ACTIVE") return m.status === "ACTIVE" || m.status === "ACCEPTED";
        return m.status === activeTab;
      });

  const getPartner = (match: MatchData): MatchMember =>
    match.member1Id === memberId ? match.member2 : match.member1;

  const respondToMatch = async (matchId: string, status: "ACCEPTED" | "DECLINED") => {
    setResponding(matchId);
    try {
      await fetch(`/api/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } catch { /* ignore */ }
    setResponding(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] tracking-[0.2em] text-[#C8A84E]/40 uppercase mb-2">SUPERPOWER EXCHANGE</p>
        <h1 className="text-2xl font-light tracking-tight text-white">Your Matches</h1>
        <p className="text-white/40 mt-1 text-sm">View and manage your superpower exchange matches.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/[0.06]">
        {TABS.map(tab => {
          const count = tab === "ALL" ? matches.length
            : tab === "ACTIVE" ? matches.filter(m => m.status === "ACTIVE" || m.status === "ACCEPTED").length
            : matches.filter(m => m.status === tab).length;
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-[1px] ${
                activeTab === tab
                  ? "border-[#C8A84E]/60 text-white/80"
                  : "border-transparent text-white/30 hover:text-white/50"
              }`}>
              {tab === "ALL" ? "All" : STATUS_STYLES[tab]?.label || tab} ({count})
            </button>
          );
        })}
      </div>

      {/* Match Cards */}
      {filtered.length === 0 ? (
        <div className="relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#C8A84E08_0%,_transparent_70%)]" />
          <p className="relative text-white/30 text-sm">No matches yet.</p>
          <p className="relative text-white/20 text-xs mt-1">Matches will appear here once curated for you.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(match => {
            const partner = getPartner(match);
            if (!partner) return null;
            const photo = partner.customPhotoUrl || partner.imageUrl;
            const tier = match.matchScore?.tier;
            const tierStyle = tier ? TIER_STYLES[tier] : null;
            const statusStyle = STATUS_STYLES[match.status];
            const isPresented = match.status === "PRESENTED";
            const isActive = match.status === "ACTIVE" || match.status === "ACCEPTED";
            const lastMsg = match.messages[0];

            return (
              <div key={match.id}
                className={`rounded-xl border bg-white/[0.02] p-5 transition-colors ${
                  tierStyle ? tierStyle.border : "border-white/[0.06]"
                } ${isActive ? "hover:bg-white/[0.04]" : ""}`}>
                <div className="flex items-start gap-4">
                  {/* Photo */}
                  {photo ? (
                    <img src={photo} alt={partner.firstName} className="size-12 rounded-full object-cover border border-white/[0.08] shrink-0" />
                  ) : (
                    <div className="size-12 rounded-full bg-white/[0.08] flex items-center justify-center text-sm font-medium text-white/50 shrink-0">
                      {partner.firstName[0]}{partner.lastName[0]}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-white/80">{partner.firstName} {partner.lastName}</span>
                      {statusStyle && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusStyle.color}`}>{statusStyle.label}</span>
                      )}
                      {tierStyle && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${tierStyle.border} ${tierStyle.text} ${tierStyle.bg}`}>
                          {tierStyle.label} {match.matchScore?.totalScore ? `(${match.matchScore.totalScore})` : ""}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/30 mt-0.5">
                      {partner.jobTitle}{partner.company ? ` at ${partner.company}` : ""}
                    </p>
                    {partner.spDomain && (
                      <p className="text-[11px] text-[#C8A84E]/40 mt-1">
                        Superpower: {partner.spDomain.split(",")[0]}
                        {partner.spAction ? ` — ${partner.spAction.split(",")[0]}` : ""}
                      </p>
                    )}
                    {match.matchScore?.reasoning && (
                      <p className="text-[11px] text-white/20 mt-1">{match.matchScore.reasoning}</p>
                    )}
                    {lastMsg && (
                      <p className="text-[11px] text-white/15 mt-1 truncate">Last message: {lastMsg.content}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isPresented && (
                      <>
                        <button onClick={() => respondToMatch(match.id, "ACCEPTED")}
                          disabled={responding === match.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#C8A84E]/20 text-[#C8A84E]/70 hover:bg-[#C8A84E]/30 text-xs font-medium disabled:opacity-50">
                          <Check className="size-3.5" /> Accept
                        </button>
                        <button onClick={() => respondToMatch(match.id, "DECLINED")}
                          disabled={responding === match.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.04] text-white/40 hover:text-white/60 text-xs disabled:opacity-50">
                          <X className="size-3.5" /> Decline
                        </button>
                      </>
                    )}
                    {isActive && (
                      <Link href={`/exchange/${match.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 text-xs font-medium">
                        <MessageSquare className="size-3.5" /> Chat
                      </Link>
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
