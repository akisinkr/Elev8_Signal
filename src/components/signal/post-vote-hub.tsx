"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CheckCircle2, ArrowRight, Sparkles, Clock, Users, Zap } from "lucide-react";

interface PostVoteHubProps {
  signalNumber: number;
  email: string;
  selectedOption: string;       // "A", "B", etc.
  selectedOptionLabel: string;  // The full option text
  lang: "en" | "kr";
}

interface PostVoteData {
  voteCount: number;
  deadline: string | null;
  match: {
    id: string;
    initial: string;
    headline: string;
    superpower: string;
    canHelpWith: string;
  } | null;
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
  const [introRequested, setIntroRequested] = React.useState(false);
  const [introSending, setIntroSending] = React.useState(false);

  // Fetch post-vote data
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
        // Silent — the hub still shows confirmation even without extra data
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [signalNumber, email]);

  async function handleRequestIntro() {
    if (!data?.match || introRequested || introSending) return;
    setIntroSending(true);
    try {
      const res = await fetch(`/api/signal/${signalNumber}/request-intro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, matchedMemberId: data.match.id }),
      });
      if (res.ok) {
        setIntroRequested(true);
      }
    } catch {
      // Silent fail
    } finally {
      setIntroSending(false);
    }
  }

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
      meetSuperpower: "Meet your Superpower match",
      superpowerDesc: "Based on your perspective, this leader's expertise could be valuable to you.",
      superpower: "Superpower",
      canHelpWith: "Specializes in",
      requestIntro: "Request Introduction",
      introRequested: "Introduction Requested",
      introDesc: "Andrew will personally connect you via email within 24 hours.",
      explorePast: "Explore Past Signals",
      backHome: "Back to Elev8",
      sending: "Sending...",
    },
    kr: {
      youreIn: "투표 완료.",
      yourPick: "선택",
      leadersVoted: "명의 리더가 투표했습니다",
      resultsUnlock: "결과 공개까지",
      resultsWhenClosed: "투표 마감 후 결과가 공유됩니다",
      meetSuperpower: "슈퍼파워 매칭 멤버",
      superpowerDesc: "당신의 관점을 바탕으로, 이 리더의 전문성이 도움이 될 수 있습니다.",
      superpower: "슈퍼파워",
      canHelpWith: "전문 분야",
      requestIntro: "소개 요청하기",
      introRequested: "소개 요청 완료",
      introDesc: "Andrew가 24시간 이내에 이메일로 직접 연결해 드립니다.",
      explorePast: "지난 Signal 보기",
      backHome: "홈으로",
      sending: "전송 중...",
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
        <div
          className="rounded-2xl border border-border/60 bg-card p-5"
          style={{ animation: "fadeInUp 0.6s ease-out 0.15s both" }}
        >
          <div className="flex items-start gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              {selectedOption}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                {txt.yourPick}
              </p>
              <p className="text-sm font-medium text-foreground leading-relaxed">
                {selectedOptionLabel}
              </p>
            </div>
          </div>
        </div>

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

        {/* ── Section 4: Superpower Match ── */}
        {!loading && data?.match && (
          <div
            className="rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/[0.04] to-transparent p-6 space-y-5"
            style={{ animation: "fadeInUp 0.6s ease-out 0.45s both" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="size-5 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">{txt.meetSuperpower}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{txt.superpowerDesc}</p>
              </div>
            </div>

            {/* Anonymous Profile Card */}
            <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
              {/* Avatar + Headline */}
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                  {data.match.initial}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{data.match.headline}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Elev8 Member</p>
                </div>
              </div>

              {/* Superpower + Specialization */}
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-start gap-3">
                  <Zap className="size-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{txt.superpower}</p>
                    <p className="text-sm text-foreground mt-0.5">{data.match.superpower}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight className="size-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{txt.canHelpWith}</p>
                    <p className="text-sm text-foreground mt-0.5">{data.match.canHelpWith}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Request Intro Button */}
            {introRequested ? (
              <div
                className="text-center space-y-2 py-2"
                style={{ animation: "fadeInUp 0.4s ease-out both" }}
              >
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="size-5 text-primary" />
                  <p className="text-sm font-semibold text-primary">{txt.introRequested}</p>
                </div>
                <p className="text-xs text-muted-foreground">{txt.introDesc}</p>
              </div>
            ) : (
              <button
                onClick={handleRequestIntro}
                disabled={introSending}
                className={cn(
                  "w-full rounded-xl py-4 text-sm font-semibold transition-all",
                  "bg-primary text-primary-foreground",
                  "hover:bg-primary/90 active:scale-[0.98]",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {introSending ? txt.sending : txt.requestIntro}
              </button>
            )}
          </div>
        )}

        {/* ── Section 5: Navigation ── */}
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
