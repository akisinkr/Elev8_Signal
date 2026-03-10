"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle2, Clock, Mail, Sparkles, UserPlus, X } from "lucide-react";

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

interface Match {
  id: string;
  member1: Member;
  member2: Member;
  status: string;
  curatorNote?: string | null;
  createdAt: string;
  matchedAt?: string | null;
  completedAt?: string | null;
}

interface ParsedNote {
  source?: string;
  signalNumber?: number;
  signalQuestion?: string;
  requesterVote?: string;
  requestedAt?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PROPOSED:  { label: "New Request", color: "text-amber-400",   bg: "bg-amber-400/10"   },
  PRESENTED: { label: "Intro Sent",  color: "text-blue-400",    bg: "bg-blue-400/10"    },
  ACCEPTED:  { label: "Accepted",    color: "text-emerald-400", bg: "bg-emerald-400/10" },
  ACTIVE:    { label: "Active",      color: "text-violet-400",  bg: "bg-violet-400/10"  },
  COMPLETED: { label: "Completed",   color: "text-muted-foreground", bg: "bg-muted/40"  },
  DECLINED:  { label: "Declined",    color: "text-destructive", bg: "bg-destructive/10" },
};

const STATUS_FLOW = ["PROPOSED", "PRESENTED", "ACCEPTED", "ACTIVE", "COMPLETED"];

export default function AdminIntrosPage() {
  const [matches, setMatches] = React.useState<Match[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<string>("all");
  const [updating, setUpdating] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchMatches();
  }, []);

  async function fetchMatches() {
    try {
      const res = await fetch("/api/admin/matches");
      if (res.ok) {
        const data = await res.json();
        setMatches(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(matchId: string, newStatus: string) {
    setUpdating(matchId);
    try {
      const res = await fetch(`/api/admin/matches/${matchId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMatches((prev) =>
          prev.map((m) => (m.id === matchId ? { ...m, ...updated } : m))
        );
      }
    } catch {
      // silent
    } finally {
      setUpdating(null);
    }
  }

  function parseNote(note: string | null | undefined): ParsedNote {
    if (!note) return {};
    try { return JSON.parse(note); } catch { return {}; }
  }

  function getNextStatus(current: string): string | null {
    const idx = STATUS_FLOW.indexOf(current);
    if (idx === -1 || idx >= STATUS_FLOW.length - 1) return null;
    return STATUS_FLOW[idx + 1];
  }

  const signalIntros = matches.filter((m) => {
    const note = parseNote(m.curatorNote);
    return note.source === "signal-intro";
  });

  const filtered =
    filter === "all"
      ? signalIntros
      : signalIntros.filter((m) => m.status === filter);

  const stats = {
    total:     signalIntros.length,
    pending:   signalIntros.filter((m) => m.status === "PROPOSED").length,
    active:    signalIntros.filter((m) => ["PRESENTED", "ACCEPTED", "ACTIVE"].includes(m.status)).length,
    completed: signalIntros.filter((m) => m.status === "COMPLETED").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Introduction Requests</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track and manage superpower introductions from Signal votes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total",       value: stats.total,     icon: Sparkles,     color: "text-foreground"   },
          { label: "New",         value: stats.pending,   icon: Clock,        color: "text-amber-400"    },
          { label: "In Progress", value: stats.active,    icon: Mail,         color: "text-blue-400"     },
          { label: "Completed",   value: stats.completed, icon: CheckCircle2, color: "text-emerald-400"  },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border/60 bg-card p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={cn("size-4", stat.color)} />
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                {stat.label}
              </span>
            </div>
            <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto">
        {[
          { key: "all",       label: "All"        },
          { key: "PROPOSED",  label: "New"        },
          { key: "PRESENTED", label: "Intro Sent" },
          { key: "ACCEPTED",  label: "Accepted"   },
          { key: "ACTIVE",    label: "Active"     },
          { key: "COMPLETED", label: "Completed"  },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap",
              filter === tab.key
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="size-6 border-2 border-border border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <UserPlus className="size-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {filter === "all"
              ? "No introduction requests yet. They'll appear here when members request intros after voting."
              : "No requests with this status."}
          </p>
        </div>
      )}

      {/* Match Cards */}
      <div className="space-y-4">
        {filtered.map((match) => {
          const note = parseNote(match.curatorNote);
          const statusConfig = STATUS_CONFIG[match.status] || STATUS_CONFIG.PROPOSED;
          const nextStatus = getNextStatus(match.status);
          const isUpdating = updating === match.id;

          return (
            <div
              key={match.id}
              className="rounded-2xl border border-border/60 bg-card overflow-hidden"
            >
              {/* Status Bar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border/40">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
                    statusConfig.bg, statusConfig.color
                  )}>
                    {statusConfig.label}
                  </span>
                  {note.signalNumber && (
                    <span className="text-xs text-muted-foreground">
                      Signal #{note.signalNumber}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground/50">
                  {new Date(match.createdAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Members */}
              <div className="p-5">
                <div className="flex items-start gap-3">
                  {/* Requester */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                      Requesting Member
                    </p>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {match.member1.firstName} {match.member1.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {match.member1.jobTitle}
                      {match.member1.company ? ` · ${match.member1.company}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground/60 truncate mt-0.5">
                      {match.member1.email}
                    </p>
                    {match.member1.challengeType1 && (
                      <p className="text-xs text-amber-400/80 mt-1.5">
                        Challenge: {match.member1.challengeType1}
                        {match.member1.challengeSpec1 ? ` — ${match.member1.challengeSpec1}` : ""}
                      </p>
                    )}
                  </div>

                  {/* Arrow */}
                  <div className="shrink-0 pt-5">
                    <ArrowRight className="size-4 text-muted-foreground/30" />
                  </div>

                  {/* Superpower Holder */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                      Superpower Holder
                    </p>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {match.member2.firstName} {match.member2.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {match.member2.jobTitle}
                      {match.member2.company ? ` · ${match.member2.company}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground/60 truncate mt-0.5">
                      {match.member2.email}
                    </p>
                    {match.member2.spDomain && (
                      <p className="text-xs text-violet-400/80 mt-1.5">
                        {match.member2.spDomain}
                        {match.member2.spAction ? ` · ${match.member2.spAction}` : ""}
                      </p>
                    )}
                  </div>
                </div>

                {/* Vote Context */}
                {note.requesterVote && (
                  <div className="mt-4 rounded-xl border border-border/40 bg-muted/30 px-4 py-2.5">
                    <p className="text-xs text-muted-foreground">
                      Voted: <span className="text-foreground font-medium">{note.requesterVote}</span>
                    </p>
                    {note.signalQuestion && (
                      <p className="text-xs text-muted-foreground/60 mt-0.5 truncate">
                        Q: {note.signalQuestion}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 px-5 py-3 border-t border-border/40 bg-muted/20">
                {nextStatus && (
                  <button
                    onClick={() => updateStatus(match.id, nextStatus)}
                    disabled={isUpdating}
                    className={cn(
                      "rounded-lg px-4 py-2 text-xs font-semibold transition-all",
                      "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {isUpdating
                      ? "Updating..."
                      : `Mark as ${STATUS_CONFIG[nextStatus]?.label || nextStatus}`}
                  </button>
                )}
                {match.status !== "DECLINED" && match.status !== "COMPLETED" && (
                  <button
                    onClick={() => updateStatus(match.id, "DECLINED")}
                    disabled={isUpdating}
                    className="rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all disabled:opacity-50"
                  >
                    <X className="size-3.5 inline mr-1" />
                    Decline
                  </button>
                )}
                {match.status === "COMPLETED" && (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400/70">
                    <CheckCircle2 className="size-3.5" />
                    Introduction completed
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
