"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, ArrowRight, Zap, ChevronRight } from "lucide-react";

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

export function SignalSuperpowerExchange({
  signalNumber,
  email,
  memberAnswer,
  memberAnswerLabel,
  lang,
}: SignalSuperpowerExchangeProps) {
  const [members, setMembers] = React.useState<SuperpowerMember[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [introSending, setIntroSending] = React.useState(false);
  const [introSent, setIntroSent] = React.useState(false);

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
          // Collect up to 3 matches
          if (data.matches && data.matches.length > 0) {
            setMembers(data.matches);
          } else if (data.match) {
            setMembers([data.match]);
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

  async function handleRequestIntro() {
    if (!selectedId || introSending || introSent) return;
    setIntroSending(true);
    try {
      const res = await fetch(`/api/signal/${signalNumber}/request-intro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, matchedMemberId: selectedId }),
      });
      if (res.ok) {
        setIntroSent(true);
      }
    } catch {
      // Silent
    } finally {
      setIntroSending(false);
    }
  }

  const t = {
    en: {
      title: "Take action on this Signal",
      subtitle: "The insights above show where you stand. These leaders have the expertise to help you move forward.",
      yourPerspective: "Your perspective",
      selectLeader: "Select a leader to connect with",
      whyConnect: "Elev8 members don't just share opinions — they share superpowers. One conversation with the right leader can save you months.",
      requestIntro: "Request a Personal Introduction",
      introSent: "Introduction Requested",
      introDesc: "Andrew will personally connect you via email within 24 hours.",
      sending: "Requesting...",
      superpower: "Superpower",
      noMatches: "Superpower matches are being curated for this Signal. Check back soon.",
    },
    kr: {
      title: "이 Signal을 행동으로 옮기세요",
      subtitle: "위 인사이트를 통해 당신의 위치를 확인했습니다. 다음 단계로 나아갈 수 있도록 도울 수 있는 리더들입니다.",
      yourPerspective: "당신의 관점",
      selectLeader: "연결하고 싶은 리더를 선택하세요",
      whyConnect: "Elev8 멤버들은 의견만 공유하는 것이 아닙니다 — 슈퍼파워를 공유합니다. 적합한 리더와의 한 번의 대화가 몇 달을 절약해 줄 수 있습니다.",
      requestIntro: "개인 소개 요청하기",
      introSent: "소개 요청 완료",
      introDesc: "Andrew가 24시간 이내에 이메일로 직접 연결해 드립니다.",
      sending: "요청 중...",
      superpower: "슈퍼파워",
      noMatches: "이 Signal에 맞는 슈퍼파워 매칭이 준비 중입니다. 곧 다시 확인해 주세요.",
    },
  };
  const txt = t[lang];

  if (loading) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/[0.03] to-transparent p-6">
        <div className="flex items-center gap-3">
          <div className="h-5 w-40 rounded bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/[0.03] to-transparent overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-0 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
            <Zap className="size-4.5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">{txt.title}</h3>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {txt.subtitle}
        </p>
      </div>

      {/* Your perspective context */}
      {memberAnswer && memberAnswerLabel && (
        <div className="mx-6 mt-4 rounded-xl bg-card border border-border/60 px-4 py-3">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
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

      {/* Leader selection */}
      <div className="p-6 space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {txt.selectLeader}
        </p>

        <div className="space-y-2">
          {members.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => {
                if (!introSent) setSelectedId(member.id);
              }}
              disabled={introSent}
              className={cn(
                "flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all",
                "active:scale-[0.98]",
                selectedId === member.id
                  ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                  : "border-border/60 bg-card hover:border-muted-foreground/30",
                introSent && "opacity-70 cursor-default"
              )}
            >
              {/* Avatar */}
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

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {member.headline}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Zap className="size-3 text-primary shrink-0" />
                  <p className="text-xs text-muted-foreground truncate">
                    {member.superpower}
                  </p>
                </div>
              </div>

              {/* Selection indicator */}
              <ChevronRight
                className={cn(
                  "size-4 shrink-0 transition-colors",
                  selectedId === member.id
                    ? "text-primary"
                    : "text-muted-foreground/40"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Motivation text */}
      <div className="px-6">
        <p className="text-xs text-muted-foreground leading-relaxed italic">
          {txt.whyConnect}
        </p>
      </div>

      {/* CTA */}
      <div className="p-6 pt-4">
        {introSent ? (
          <div className="text-center space-y-2 py-2">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="size-5 text-primary" />
              <p className="text-sm font-semibold text-primary">{txt.introSent}</p>
            </div>
            <p className="text-xs text-muted-foreground">{txt.introDesc}</p>
          </div>
        ) : (
          <button
            onClick={handleRequestIntro}
            disabled={!selectedId || introSending}
            className={cn(
              "w-full rounded-xl py-4 text-sm font-semibold transition-all",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              selectedId
                ? "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]"
                : "bg-muted text-muted-foreground"
            )}
          >
            {introSending ? txt.sending : (
              <span className="flex items-center justify-center gap-2">
                {txt.requestIntro}
                <ArrowRight className="size-4" />
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
