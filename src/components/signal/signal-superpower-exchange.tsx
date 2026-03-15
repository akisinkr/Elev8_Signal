"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, ArrowRight, Users, ChevronRight, X } from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface SuperpowerMember {
  id: string;
  initial: string;
  headline: string;
  superpower: string;
  canHelpWith: string;
  spScale: string | null;
  spStage: string | null;
  challengeSpec1: string | null;
  elev8Titles: string[];
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
// Copy
//
// STAGE 1 — Status Affirmation + Room Quality
//   Affirm the member's position, then affirm the room.
//   "Every leader here was personally invited" = ambient trust.
//
// STAGE 2 — Leader Browse (tap card → profile sheet)
//   Cards show elev8Titles as credibility badges.
//
// PROFILE SHEET — Expertise + Context + Challenge
//   Leads with superpower. Challenge humanizes.
//   Trust line above CTA: "personally facilitated."
//
// STAGE 3 — Confirmation
//   Platform takes ownership. Passive voice in KR → 체면.
//
// KR: -요체 throughout. Re-creation, not translation.
// ─────────────────────────────────────────────

const COPY = {
  en: {
    s1Label: "Superpower Exchange",
    s1Heading: "Your read on this is uncommon.",
    s1Sub:
      "Among this week's respondents, your position stands apart. Every leader on Elev8 was personally invited — you're browsing peers who've navigated this from a different vantage point.",
    s1Social: (n: number) => `${n} exchanges requested this month`,
    s1Cta: "See who else is navigating this",

    s2Label: "Invited leaders with a different vantage point",
    s2Social: (n: number) => `${n} exchanges requested this month`,
    s2Tap: "Tap to view profile",

    sheetExpertise: "Expertise",
    sheetContext: "Context",
    sheetChallenge: "Currently navigating",
    sheetCta: "Request Exchange",
    sheetSending: "Requesting...",
    sheetBack: "Back to all leaders",
    sheetTrust: "Elev8 introductions are personally facilitated. Typical exchange: 30-minute conversation.",

    s3Heading: "Exchange requested.",
    s3Sub: "Elev8 will make the introduction personally. We'll be in touch within 24 hours.",

    yourPerspective: "Your perspective",
  },
  kr: {
    s1Label: "슈퍼파워 익스체인지",
    s1Heading: "이 문제에 대한 시각, 흔하지 않습니다.",
    s1Sub:
      "이번 질문에서 당신의 좌표는 소수에 속합니다. Elev8의 모든 리더는 개별 초대를 통해 합류했습니다 — 같은 지형을 다른 경로로 탐색해온 동료를 만나보세요.",
    s1Social: (n: number) => `이번 달 ${n}건의 익스체인지 신청`,
    s1Cta: "같은 지형을 탐색하는 리더 보기",

    s2Label: "다른 좌표에서 온 초대된 리더들",
    s2Social: (n: number) => `이번 달 ${n}건의 익스체인지 신청`,
    s2Tap: "프로필 보기",

    sheetExpertise: "전문 분야",
    sheetContext: "경험 맥락",
    sheetChallenge: "현재 탐색 중인 과제",
    sheetCta: "익스체인지 신청하기",
    sheetSending: "신청 중...",
    sheetBack: "전체 리더 보기",
    sheetTrust: "Elev8이 직접 연결해 드립니다. 일반적인 익스체인지는 30분 대화입니다.",

    s3Heading: "익스체인지가 신청되었습니다.",
    s3Sub: "Elev8이 직접 연결해 드립니다. 24시간 이내에 연락드릴게요.",

    yourPerspective: "나의 관점",
  },
};

// Title display map
const TITLE_LABELS: Record<string, string> = {
  architect: "Architect",
  advisor: "Advisor",
  connector: "Connector",
  strategist: "Strategist",
  operator: "Operator",
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
  const [sheetMember, setSheetMember] = React.useState<SuperpowerMember | null>(null);
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
          if (matches.length > 0) setMembers(matches);
        }
      } catch {
        // Silent
      } finally {
        setLoading(false);
      }
    }
    fetchMatches();
  }, [signalNumber, email]);

  async function handleRequestExchange(memberId: string) {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/signal/${signalNumber}/request-intro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, matchedMemberId: memberId }),
      });
      if (res.ok) {
        setSheetMember(null);
        setStage(3);
      }
    } catch {
      // Silent
    } finally {
      setSubmitting(false);
    }
  }

  const txt = COPY[lang];

  if (loading) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="h-5 w-40 rounded bg-white/[0.04] animate-pulse" />
      </div>
    );
  }

  if (members.length === 0) return null;

  return (
    <>
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">

        {/* ── Stage 1: Status Affirmation ──────────────────────────── */}
        {stage === 1 && (
          <div className="p-6 space-y-4">
            {memberAnswer && memberAnswerLabel && (
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.08] px-4 py-3">
                <p className="text-[10px] tracking-[0.12em] uppercase text-white/30 mb-1.5">
                  {txt.yourPerspective}
                </p>
                <div className="flex items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[#C8A84E]/15 text-[#C8A84E] text-xs font-medium">
                    {memberAnswer}
                  </span>
                  <p className="text-sm font-light text-white/70">{memberAnswerLabel}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-[10px] tracking-[0.12em] uppercase text-[#C8A84E]/50">
                {txt.s1Label}
              </p>
              <h3 className="text-lg font-light text-white/80 leading-snug">
                {txt.s1Heading}
              </h3>
              <p className="text-[14px] font-light text-white/50 leading-relaxed">
                {txt.s1Sub}
              </p>
            </div>

            {exchangeCount > 0 && (
              <div className="flex items-center gap-2">
                <Users className="size-3.5 text-white/25 shrink-0" />
                <p className="text-xs text-white/30">{txt.s1Social(exchangeCount)}</p>
              </div>
            )}

            <button
              onClick={() => setStage(2)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#C8A84E] text-[#0A0F1C] py-4 text-sm font-medium hover:bg-[#C8A84E]/90 active:scale-[0.98] transition-all"
            >
              {txt.s1Cta}
              <ArrowRight className="size-4" />
            </button>
          </div>
        )}

        {/* ── Stage 2: Leader Browse ────────────────────────────────── */}
        {stage === 2 && (
          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <p className="text-[10px] tracking-[0.12em] uppercase text-[#C8A84E]/50">
                {txt.s2Label}
              </p>
              {exchangeCount > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="size-3.5 text-white/25 shrink-0" />
                  <p className="text-xs text-white/30">{txt.s2Social(exchangeCount)}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              {members.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setSheetMember(member)}
                  className="flex w-full items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-left transition-all hover:border-[#C8A84E]/15 hover:bg-white/[0.05] active:scale-[0.98]"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#C8A84E]/10 font-medium text-sm text-[#C8A84E]/70">
                    {member.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-light text-white/70 truncate">{member.headline}</p>
                    <p className="text-xs text-white/40 truncate mt-0.5 uppercase tracking-wide">{member.superpower}</p>
                    {/* Elev8 title badges */}
                    {member.elev8Titles?.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {member.elev8Titles.slice(0, 2).map((title) => (
                          <span
                            key={title}
                            className="inline-flex items-center rounded-full bg-[#C8A84E]/10 px-2 py-0.5 text-[9px] tracking-[0.08em] uppercase text-[#C8A84E]/60"
                          >
                            {TITLE_LABELS[title] || title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-white/20" />
                </button>
              ))}
            </div>

            <p className="text-center text-xs text-white/25">{txt.s2Tap}</p>
          </div>
        )}

        {/* ── Stage 3: Confirmation ────────────────────────────────────── */}
        {stage === 3 && (
          <div className="p-8 flex flex-col items-center gap-3 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#C8A84E]/10">
              <CheckCircle2 className="size-6 text-[#C8A84E]/60" />
            </div>
            <h3 className="text-base font-light text-white/80">{txt.s3Heading}</h3>
            <p className="text-[14px] font-light text-white/50 leading-relaxed max-w-xs">{txt.s3Sub}</p>
          </div>
        )}

      </div>

      {/* ── Profile Sheet ─────────────────────────────────────────────── */}
      {sheetMember && (
        <div className="fixed inset-0 z-50 flex items-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSheetMember(null)}
          />

          {/* Sheet */}
          <div className="relative w-full max-h-[85vh] overflow-y-auto rounded-t-2xl bg-[#0A0F1C] border-t border-white/[0.06] pb-safe">

            {/* Handle + close */}
            <div className="flex items-center justify-between px-6 pt-4 pb-2">
              <div className="w-10 h-1 rounded-full bg-white/[0.08] mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
              <div />
              <button
                onClick={() => setSheetMember(null)}
                className="ml-auto flex size-8 items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.10] transition-colors"
              >
                <X className="size-4 text-white/40" />
              </button>
            </div>

            <div className="px-6 pb-8 space-y-5">
              {/* Avatar + role + titles */}
              <div className="flex items-center gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#C8A84E]/10 font-medium text-lg text-[#C8A84E]/70">
                  {sheetMember.initial}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-light text-white/80">{sheetMember.headline}</p>
                  {sheetMember.elev8Titles?.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1">
                      {sheetMember.elev8Titles.slice(0, 3).map((title) => (
                        <span
                          key={title}
                          className="inline-flex items-center rounded-full bg-[#C8A84E]/10 px-2 py-0.5 text-[9px] tracking-[0.08em] uppercase text-[#C8A84E]/60"
                        >
                          {TITLE_LABELS[title] || title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Expertise */}
              <div className="space-y-1.5">
                <p className="text-[10px] tracking-[0.12em] uppercase text-[#C8A84E]/50">
                  {txt.sheetExpertise}
                </p>
                <p className="text-[14px] font-light text-white/70 leading-relaxed uppercase tracking-wide">{sheetMember.superpower}</p>
              </div>

              {/* Context — scale + stage */}
              {(sheetMember.spScale || sheetMember.spStage) && (
                <div className="space-y-1.5">
                  <p className="text-[10px] tracking-[0.12em] uppercase text-[#C8A84E]/50">
                    {txt.sheetContext}
                  </p>
                  <p className="text-[14px] font-light text-white/70 uppercase tracking-wide">
                    {[sheetMember.spScale, sheetMember.spStage].filter(Boolean).join(" · ")}
                  </p>
                </div>
              )}

              {/* Challenge — humanizes, builds empathy */}
              {sheetMember.challengeSpec1 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] tracking-[0.12em] uppercase text-[#C8A84E]/50">
                    {txt.sheetChallenge}
                  </p>
                  <p className="text-[14px] font-light text-white/60 leading-relaxed italic">
                    {sheetMember.challengeSpec1}
                  </p>
                </div>
              )}

              {/* Divider */}
              <div className="h-px bg-white/[0.06]" />

              {/* CTA */}
              <button
                onClick={() => handleRequestExchange(sheetMember.id)}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#C8A84E] text-[#0A0F1C] py-4 text-sm font-medium hover:bg-[#C8A84E]/90 active:scale-[0.98] transition-all disabled:opacity-30"
              >
                {submitting ? txt.sheetSending : (
                  <>
                    {txt.sheetCta}
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>

              {/* Trust line — ambient confidence */}
              <p className="text-center text-[11px] text-white/20 leading-relaxed">
                {txt.sheetTrust}
              </p>

              {/* Back link */}
              <button
                onClick={() => setSheetMember(null)}
                className="w-full text-center text-sm text-white/30 hover:text-white/50 transition-colors py-1"
              >
                ← {txt.sheetBack}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
