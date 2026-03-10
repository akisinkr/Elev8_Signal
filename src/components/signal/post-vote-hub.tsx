"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CheckCircle2, ArrowRight, Clock, Users, Sparkles, Zap } from "lucide-react";

interface PostVoteHubProps {
  signalNumber: number;
  email: string;
  selectedOption: string;
  selectedOptionLabel: string;
  lang: "en" | "kr";
}

interface PostVoteData {
  voteCount: number;
  deadline: string | null;
  yourPick: string | null;
  yourPickLabel: string | null;
  cardCompleted: boolean;
}

export function PostVoteHub({
  signalNumber,
  email,
  selectedOption,
  selectedOptionLabel,
  lang,
}: PostVoteHubProps) {
  const [data, setData] = React.useState<PostVoteData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/signal/${signalNumber}/post-vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (res.ok) {
          const d = await res.json();
          setData(d);
        }
      } catch {
        // Silent
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [signalNumber, email]);

  // Countdown timer
  const [timeLeft, setTimeLeft] = React.useState("");
  React.useEffect(() => {
    if (!data?.deadline) return;
    const target = new Date(data.deadline).getTime();

    function update() {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft(lang === "kr" ? "투표 마감됨" : "Voting closed");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else {
        setTimeLeft(`${hours}h ${mins}m`);
      }
    }

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [data?.deadline, lang]);

  const t = {
    en: {
      youreIn: "You're in.",
      yourPick: "Your pick",
      leadersVoted: "leaders have voted",
      resultsUnlock: "Results unlock in",
      resultsWhenClosed: "Results shared when voting closes",
      whatsNext: "What happens next",
      insightTeaser: "When voting closes, you'll receive a personalized analysis — how your peers voted, where you stand, and exclusive insights from the community.",
      superpowerTeaser: "Our members include leaders with deep expertise across AI strategy, org design, scaling teams, and more. The analysis will reveal which of these experts share your perspective — and who sees it differently.",
      explorePast: "Explore Past Signals",
      backHome: "Back to Elev8",
      cardNudgeTitle: "Make yourself findable",
      cardNudgeDesc: "When results drop, other leaders will see who shares their perspective. Your Superpower card is what gets you in the room. Takes 3 minutes.",
      cardNudgeCta: "Complete Your Superpower Card",
    },
    kr: {
      // ─ 한국어 전문가 에이전트 기준: 영어 번역 아님, 한국어로 재창작
      // ─ 모드 A (자연스럽고, 어색하지 않고): -요체 사용, 명령형 지양
      youreIn: "의견을 남겨주셨습니다.",
      yourPick: "선택하신 관점",
      leadersVoted: "명의 리더가 참여했습니다",
      resultsUnlock: "결과 공개까지",
      resultsWhenClosed: "투표 마감 후 결과를 공유해 드립니다",
      whatsNext: "이제 어떤 일이 일어나나요",
      insightTeaser: "투표가 마감되면 맞춤형 분석을 받으실 수 있습니다. 동료 리더들이 어떻게 생각하는지, 그 안에서 님의 관점이 어디에 위치하는지, 그리고 멤버 전용 인사이트까지 확인하실 수 있습니다.",
      superpowerTeaser: "Elev8에는 AI 전략, 조직 설계, 팀 빌딩 등 각 분야 최전선에서 활동하는 리더들이 있습니다. 분석 결과에서 님과 비슷한 시각을 가진 리더 — 그리고 다른 시각을 가진 리더 — 를 직접 확인하실 수 있습니다.",
      explorePast: "지난 Signal 보기",
      backHome: "Elev8으로 돌아가기",
      cardNudgeTitle: "리더들이 님을 찾을 수 있게 해보세요",
      cardNudgeDesc: "결과가 공개되면 비슷한 관점을 가진 리더들이 서로를 찾게 됩니다. Superpower 카드가 있어야 그 자리에 함께할 수 있습니다. 3분이면 충분합니다.",
      cardNudgeCta: "Superpower 카드 완성하기",
    },
  };
  const txt = t[lang];

  return (
    <div className="flex flex-col items-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-lg space-y-6">

        {/* ── Section 1: Confirmation ── */}
        <div
          className="text-center space-y-4"
          style={{ animation: "fadeInUp 0.6s ease-out both" }}
        >
          <div className="relative inline-flex">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <CheckCircle2 className="relative size-14 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {txt.youreIn}
          </h1>
        </div>

        {/* ── Section 2: Your Pick ── */}
        {(selectedOption || data?.yourPick) && (
          <div
            className="rounded-2xl border border-border/60 bg-card p-5"
            style={{ animation: "fadeInUp 0.6s ease-out 0.15s both" }}
          >
            <div className="flex items-start gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                {selectedOption || data?.yourPick}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  {txt.yourPick}
                </p>
                <p className="text-sm font-medium text-foreground leading-relaxed">
                  {selectedOptionLabel || data?.yourPickLabel}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Section 3: Live Pulse + Countdown ── */}
        <div
          className="rounded-2xl border border-border/60 bg-card p-5"
          style={{ animation: "fadeInUp 0.6s ease-out 0.3s both" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <Users className="size-5 text-muted-foreground" />
              </div>
              <div>
                {loading ? (
                  <div className="h-5 w-24 rounded bg-muted animate-pulse" />
                ) : (
                  <p className="text-sm font-semibold text-foreground">
                    {data?.voteCount ?? 0} {txt.leadersVoted}
                  </p>
                )}
              </div>
            </div>
            {data?.deadline && timeLeft && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="size-3.5" />
                <span>{txt.resultsUnlock} <span className="font-semibold text-primary">{timeLeft}</span></span>
              </div>
            )}
          </div>
          {!data?.deadline && !loading && (
            <p className="mt-3 text-xs text-muted-foreground">{txt.resultsWhenClosed}</p>
          )}
        </div>

        {/* ── Section 4: What's Coming (Anticipation Teaser) ── */}
        <div
          className="rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/[0.04] to-transparent p-6 space-y-4"
          style={{ animation: "fadeInUp 0.6s ease-out 0.45s both" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="size-5 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">
              {txt.whatsNext}
            </h2>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {txt.insightTeaser}
          </p>

          <div className="h-px bg-border/40" />

          <p className="text-sm text-muted-foreground leading-relaxed">
            {txt.superpowerTeaser}
          </p>
        </div>

        {/* ── Section 5: Superpower Card Nudge (only if card not completed) ── */}
        {data && !data.cardCompleted && (
          <div
            className="rounded-2xl border-2 border-primary/30 bg-gradient-to-b from-primary/[0.06] to-transparent p-6 space-y-4"
            style={{ animation: "fadeInUp 0.6s ease-out 0.55s both" }}
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="size-5 text-primary" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">
                {txt.cardNudgeTitle}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {txt.cardNudgeDesc}
            </p>
            <Link
              href="/profile"
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl py-3.5 px-5",
                "bg-primary text-primary-foreground text-sm font-semibold",
                "hover:bg-primary/90 active:scale-[0.98] transition-all"
              )}
            >
              {txt.cardNudgeCta}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        )}

        {/* ── Section 6: Navigation ── */}
        <div
          className="flex flex-col gap-3 pt-2"
          style={{ animation: "fadeInUp 0.6s ease-out 0.6s both" }}
        >
          <Link
            href={`/signal/archive${email ? `?email=${encodeURIComponent(email)}` : ""}`}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-card px-5 py-3.5",
              "text-sm font-medium text-foreground",
              "hover:bg-muted/50 active:scale-[0.98] transition-all"
            )}
          >
            {txt.explorePast}
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/"
            className="text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            {txt.backHome}
          </Link>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
