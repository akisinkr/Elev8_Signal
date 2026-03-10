"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CheckCircle2, ArrowRight } from "lucide-react";

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
      youreIn: "Your vote is in.",
      yourPick: "Your pick",
      leadersVoted: "leaders voted",
      resultsIn: "Results in",
      resultsWhenClosed: "Results shared when voting closes",
      teaser: "When voting closes, you'll see how your peers voted — and which leaders share your perspective.",
      buildCard: "Complete Your Superpower Card",
      buildCardSub: "So other leaders can find you when results drop",
      explorePast: "Explore Past Signals",
      editProfile: "Edit my profile",
      backHome: "Back to Elev8",
    },
    kr: {
      youreIn: "투표가 완료되었습니다.",
      yourPick: "선택하신 관점",
      leadersVoted: "명 참여",
      resultsIn: "결과 공개까지",
      resultsWhenClosed: "투표 마감 후 결과를 공유해 드립니다",
      teaser: "투표가 마감되면 동료 리더들의 선택과 나와 비슷한 관점을 가진 사람들을 직접 확인하실 수 있습니다.",
      buildCard: "Superpower 카드 완성하기",
      buildCardSub: "결과 공개 시 다른 리더들이 님을 찾을 수 있게 됩니다",
      explorePast: "지난 Signal 보기",
      editProfile: "내 프로필 수정하기",
      backHome: "Elev8으로 돌아가기",
    },
  };
  const txt = t[lang];

  const cardCompleted = data?.cardCompleted ?? true; // default to true while loading to avoid flash
  const archiveParams = new URLSearchParams();
  if (email) archiveParams.set("email", email);
  archiveParams.set("from", String(signalNumber));
  const archiveUrl = `/signal/archive?${archiveParams.toString()}`;
  const profileUrl = `/profile${email ? `?email=${encodeURIComponent(email)}` : ""}`;

  const hasDeadline = !loading && !!data?.deadline && !!timeLeft;

  return (
    <div className="flex flex-col items-center px-4 py-12 sm:py-20">
      <div className="w-full max-w-sm space-y-6">

        {/* ── Confirmation ── */}
        <div
          className="text-center space-y-2"
          style={{ animation: "fadeInUp 0.5s ease-out both" }}
        >
          <div className="relative inline-flex mb-1">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <CheckCircle2 className="relative size-11 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {txt.youreIn}
          </h1>
        </div>

        {/* ── Your Pick ── */}
        {(selectedOption || data?.yourPick) && (
          <div
            className="rounded-2xl border border-border/60 bg-card p-4"
            style={{ animation: "fadeInUp 0.5s ease-out 0.1s both" }}
          >
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground text-base font-bold">
                {selectedOption || data?.yourPick}
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
                  {txt.yourPick}
                </p>
                <p className="text-sm font-medium text-foreground leading-snug">
                  {selectedOptionLabel || data?.yourPickLabel}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Stats ── */}
        <div
          className={cn("grid gap-2", hasDeadline ? "grid-cols-2" : "grid-cols-1")}
          style={{ animation: "fadeInUp 0.5s ease-out 0.2s both" }}
        >
          <div className="rounded-xl border border-border/40 bg-card/50 px-3 py-3 text-center">
            {loading ? (
              <div className="h-6 w-10 rounded bg-muted animate-pulse mx-auto mb-1" />
            ) : (
              <p className="text-xl font-bold text-foreground">{data?.voteCount ?? 0}</p>
            )}
            <p className="text-[10px] text-muted-foreground">{txt.leadersVoted}</p>
          </div>
          {hasDeadline && (
            <div className="rounded-xl border border-border/40 bg-card/50 px-3 py-3 text-center">
              <p className="text-xl font-bold text-primary">{timeLeft}</p>
              <p className="text-[10px] text-muted-foreground">{txt.resultsIn}</p>
            </div>
          )}
        </div>

        {/* ── Teaser ── */}
        <p
          className="text-[13px] text-muted-foreground leading-relaxed text-center px-1"
          style={{ animation: "fadeInUp 0.5s ease-out 0.3s both" }}
        >
          {txt.teaser}
        </p>

        {/* ── CTAs ── */}
        <div
          className="flex flex-col gap-2.5"
          style={{ animation: "fadeInUp 0.5s ease-out 0.4s both" }}
        >
          {!loading && !cardCompleted ? (
            <>
              <Link
                href={profileUrl}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-2xl py-4 px-5",
                  "bg-primary text-primary-foreground",
                  "hover:bg-primary/90 active:scale-[0.98] transition-all"
                )}
              >
                <span className="text-sm font-semibold flex items-center gap-1.5">
                  {txt.buildCard}
                  <ArrowRight className="size-4" />
                </span>
                <span className="text-[11px] opacity-75">{txt.buildCardSub}</span>
              </Link>
              <Link
                href={archiveUrl}
                className="text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                {txt.explorePast} →
              </Link>
            </>
          ) : (
            <>
              <Link
                href={archiveUrl}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-2xl py-3.5 px-5",
                  "bg-card border border-border/60 text-sm font-medium text-foreground",
                  "hover:bg-muted/50 active:scale-[0.98] transition-all"
                )}
              >
                {txt.explorePast}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={profileUrl}
                className="text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                {txt.editProfile} →
              </Link>
            </>
          )}
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
