"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, ArrowRight, Users } from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface SuperpowerMember {
  id: string;
  initial: string;
  headline: string;
  superpower: string;
  canHelpWith: string;
}

interface SignalSuperpowerExchangeProps {
  signalNumber: number;
  email: string;
  memberAnswer: string | null;
  memberAnswerLabel: string;
  lang: "en" | "kr";
}

type Stage = 1 | 2 | 3;

// ─────────────────────────────────────────────
// Copy — cognitive-psychology + culture-agent doctrine
//
// STAGE 1 — Status Affirmation (self-affirmation before vulnerability)
//   Affirm the member's contribution before revealing leaders.
//   Loss aversion framing: their vantage point is rare, not a gap.
//
// STAGE 2 — Leader Reveal (peer browsing, not help-seeking)
//   Frame as "browsing expertise" not "asking for help".
//   Social proof normalization: others do this, it's normal.
//   Button always active — auto-select first member on load.
//
// STAGE 3 — Confirmation (platform takes ownership, passive voice in KR)
//   "Elev8 will connect you" — Elev8 acts, member receives.
//   Reduces status cost of having requested help.
//
// KR: -요체 throughout. Re-creation, not translation.
// ─────────────────────────────────────────────

const COPY = {
  en: {
    // Stage 1
    s1Label: "Your Signal contribution",
    s1Heading: "Your read on this is uncommon.",
    s1Sub:
      "Your position on this question places you in a distinct minority of this week's respondents. That's not a gap — that's a vantage point worth pressure-testing with someone who's navigated it differently.",
    s1Social: (n: number) => `${n} members requested exchanges on this topic this month.`,
    s1Cta: "See who else is navigating this",

    // Stage 2
    s2Label: "Members navigating this from a different vantage point",
    s2Social: (n: number) => `${n} members requested exchanges on this topic this month.`,
    s2Cta: "Request Exchange",
    s2Sending: "Requesting...",

    // Stage 3
    s3Heading: "Exchange requested.",
    s3Sub: "Elev8 will make the introduction personally. We'll be in touch within 24 hours.",

    // Shared
    yourPerspective: "Your perspective",
  },
  kr: {
    // Stage 1
    // ─ 인정(recognition) + 희소성(rarity as value) 반영
    // ─ 번역체 제거: "당신의 읽기는" → "이 문제에 대한 시각"
    s1Label: "이번 Signal 응답",
    s1Heading: "이 문제에 대한 시각, 흔하지 않습니다.",
    s1Sub:
      "이번 질문에서 당신의 좌표는 소수에 속합니다. 부족함이 아닙니다 — 같은 지형을 다른 경로로 탐색해온 리더와 맞닿을 때 그 가치가 드러나는 관점이에요.",
    s1Social: (n: number) => `이번 달 ${n}명의 멤버가 이 주제로 익스체인지를 신청했습니다.`,
    s1Cta: "같은 지형을 탐색하는 리더 보기",

    // Stage 2
    // ─ "도움 요청"이 아닌 "전문성 탐색"으로 프레이밍
    // ─ 소개자(Elev8) 존재 명시 → 체면 보호
    s2Label: "같은 지형, 다른 좌표에서 온 리더들",
    s2Social: (n: number) => `이번 달 ${n}명이 이 주제로 익스체인지를 신청했습니다.`,
    s2Cta: "익스체인지 신청하기",
    s2Sending: "신청 중...",

    // Stage 3
    // ─ 수동태: Elev8이 행동, 멤버는 받는 쪽 → 체면 유지
    s3Heading: "익스체인지가 신청되었습니다.",
    s3Sub: "Elev8이 직접 연결해 드립니다. 24시간 이내에 연락드릴게요.",

    // Shared
    yourPerspective: "나의 관점",
  },
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function SignalSuperpowerExchange({
  signalNumber,
  email,
  memberAnswer,
  memberAnswerLabel,
  lang,
}: SignalSuperpowerExchangeProps) {
  const [members, setMembers] = React.useState<SuperpowerMember[]>([]);
  const [exchangeCount, setExchangeCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [stage, setStage] = React.useState<Stage>(1);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    async function fetchMatches() {
      try {
        const res = await fetch(`/api/signal/${signalNumber}/post-vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (res.ok) {
          const data = await res.json();
          if (typeof data.exchangeCount === "number") setExchangeCount(data.exchangeCount);
          const matches: SuperpowerMember[] =
            data.matches?.length > 0 ? data.matches : data.match ? [data.match] : [];
          if (matches.length > 0) {
            setMembers(matches);
            setSelectedId(matches[0].id); // auto-select first — button always active
          }
        }
      } catch {
        // Silent
      } finally {
        setLoading(false);
      }
    }
    fetchMatches();
  }, [signalNumber, email]);

  async function handleRequestExchange() {
    if (!selectedId || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/signal/${signalNumber}/request-intro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, matchedMemberId: selectedId }),
      });
      if (res.ok) setStage(3);
    } catch {
      // Silent
    } finally {
      setSubmitting(false);
    }
  }

  const txt = COPY[lang];

  if (loading) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/[0.03] to-transparent p-6">
        <div className="h-5 w-40 rounded bg-muted animate-pulse" />
      </div>
    );
  }

  if (members.length === 0) return null;

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/[0.03] to-transparent overflow-hidden">

      {/* ── Step indicator ───────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-1.5 pt-5 pb-0">
        {([1, 2, 3] as Stage[]).map((s) => (
          <span
            key={s}
            className={cn(
              "size-2 rounded-full transition-colors duration-200",
              s === stage ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* ── Stage 1: Status Affirmation ──────────────────────────────── */}
      {stage === 1 && (
        <div className="p-6 space-y-4">
          {/* Member's own answer — affirms their contribution */}
          {memberAnswer && memberAnswerLabel && (
            <div className="rounded-xl bg-card border border-border/60 px-4 py-3">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                {txt.yourPerspective}
              </p>
              <div className="flex items-center gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
                  {memberAnswer}
                </span>
                <p className="text-sm text-foreground">{memberAnswerLabel}</p>
              </div>
            </div>
          )}

          {/* Affirmation headline + subtext */}
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              {txt.s1Label}
            </p>
            <h3 className="text-lg font-semibold text-foreground leading-snug">
              {txt.s1Heading}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {txt.s1Sub}
            </p>
          </div>

          {/* Social proof normalization */}
          {exchangeCount > 0 && (
            <div className="flex items-center gap-2">
              <Users className="size-3.5 text-muted-foreground/60 shrink-0" />
              <p className="text-xs text-muted-foreground">{txt.s1Social(exchangeCount)}</p>
            </div>
          )}

          {/* CTA — always active, single action */}
          <button
            onClick={() => setStage(2)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-4 text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            {txt.s1Cta}
            <ArrowRight className="size-4" />
          </button>
        </div>
      )}

      {/* ── Stage 2: Leader Reveal ────────────────────────────────────── */}
      {stage === 2 && (
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              {txt.s2Label}
            </p>
            {exchangeCount > 0 && (
              <div className="flex items-center gap-2">
                <Users className="size-3.5 text-muted-foreground/60 shrink-0" />
                <p className="text-xs text-muted-foreground">{txt.s2Social(exchangeCount)}</p>
              </div>
            )}
          </div>

          {/* Leader cards — browsing expertise, not asking for help */}
          <div className="space-y-2">
            {members.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => setSelectedId(member.id)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all active:scale-[0.98]",
                  selectedId === member.id
                    ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                    : "border-border/60 bg-card hover:border-muted-foreground/30"
                )}
              >
                <div
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-full font-bold text-sm transition-colors",
                    selectedId === member.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {member.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{member.headline}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{member.superpower}</p>
                </div>
                {selectedId === member.id && (
                  <CheckCircle2 className="size-4 shrink-0 text-primary" />
                )}
              </button>
            ))}
          </div>

          {/* CTA — always active (auto-selected first member on load) */}
          <button
            onClick={handleRequestExchange}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-4 text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {submitting ? txt.s2Sending : (
              <>
                {txt.s2Cta}
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* ── Stage 3: Confirmation ─────────────────────────────────────── */}
      {/* Elev8 takes ownership — reduces status cost of having asked */}
      {stage === 3 && (
        <div className="p-8 flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="size-6 text-primary" />
          </div>
          <h3 className="text-base font-semibold text-foreground">{txt.s3Heading}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{txt.s3Sub}</p>
        </div>
      )}

    </div>
  );
}
