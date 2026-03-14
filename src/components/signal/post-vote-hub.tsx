"use client";

import * as React from "react";
import Link from "next/link";

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
      confirmed: "Your perspective has been recorded.",
      yourPick: "Your pick",
      leadersVoted: "leaders voted",
      resultsIn: "Results unlock in",
      teaser: "When voting closes, you'll see how your peers voted — and which leaders share your perspective.",
      buildCard: "Complete your profile",
      buildCardSub: "So other leaders can find you when results are shared.",
      explorePast: "Browse past Signals",
      votingClosed: "Voting closed",
    },
    kr: {
      confirmed: "참여가 기록되었습니다.",
      yourPick: "내 선택",
      leadersVoted: "명 응답",
      resultsIn: "결과 공개까지",
      teaser: "마감 후에는 동료 리더들의 선택을, 그리고 나와 같은 시각을 가진 리더들을 바로 확인할 수 있어요.",
      buildCard: "프로필 완성하기",
      buildCardSub: "결과가 공개되면 다른 리더들이 나를 찾을 수 있어요.",
      explorePast: "지난 Signal 살펴보기",
      votingClosed: "투표 마감됨",
    },
  };
  const txt = t[lang];

  const cardCompleted = data?.cardCompleted ?? true;
  const archiveParams = new URLSearchParams();
  if (email) archiveParams.set("email", email);
  archiveParams.set("from", String(signalNumber));
  const archiveUrl = `/signal/archive?${archiveParams.toString()}`;
  const profileUrl = `/profile${email ? `?email=${encodeURIComponent(email)}` : ""}`;

  const hasDeadline = !loading && !!data?.deadline && !!timeLeft;

  return (
    <div className="max-w-md mx-auto space-y-6 py-8">

      {/* Confirmation */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
        <span className="text-[10px] font-semibold tracking-[0.2em] text-amber-400/60 uppercase">
          Signal #{signalNumber}
        </span>
        <p className="text-white/70 text-sm mt-2">{txt.confirmed}</p>
      </div>

      {/* Your Pick */}
      {(selectedOption || data?.yourPick) && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400 text-sm font-bold">
              {selectedOption || data?.yourPick}
            </span>
            <div className="min-w-0">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">
                {txt.yourPick}
              </p>
              <p className="text-sm font-medium text-white/80 leading-snug">
                {selectedOptionLabel || data?.yourPickLabel}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className={`grid gap-3 ${hasDeadline ? "grid-cols-2" : "grid-cols-1"}`}>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
          {loading ? (
            <div className="h-6 w-10 rounded bg-white/[0.06] animate-pulse mx-auto mb-1" />
          ) : (
            <div className="text-2xl font-bold text-white/90">{data?.voteCount ?? 0}</div>
          )}
          <div className="text-[10px] text-white/30 mt-1">{txt.leadersVoted}</div>
        </div>
        {hasDeadline && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
            <div className="text-2xl font-bold text-amber-400/80">{timeLeft}</div>
            <div className="text-[10px] text-white/30 mt-1">{txt.resultsIn}</div>
          </div>
        )}
      </div>

      {/* Teaser */}
      <p className="text-[12px] text-white/30 leading-relaxed text-center px-2">
        {txt.teaser}
      </p>

      {/* Actions */}
      <div className="space-y-2">
        {!loading && !cardCompleted && (
          <Link href={profileUrl}
            className="flex items-center justify-between p-4 rounded-xl border border-amber-400/10 bg-amber-400/[0.03] hover:bg-amber-400/[0.06] transition-colors group">
            <div>
              <p className="text-sm text-white/70 group-hover:text-white/90 transition-colors">{txt.buildCard}</p>
              <p className="text-[11px] text-white/30 mt-0.5">{txt.buildCardSub}</p>
            </div>
            <span className="text-[11px] text-amber-400/50 group-hover:text-amber-400/80 shrink-0 ml-3 transition-colors">View →</span>
          </Link>
        )}
        <Link href={archiveUrl}
          className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors group">
          <p className="text-sm text-white/70 group-hover:text-white/90 transition-colors">{txt.explorePast}</p>
          <span className="text-[11px] text-amber-400/50 group-hover:text-amber-400/80 shrink-0 ml-3 transition-colors">View →</span>
        </Link>
      </div>
    </div>
  );
}
