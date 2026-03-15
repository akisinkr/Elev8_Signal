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
  const [isClosed, setIsClosed] = React.useState(false);
  React.useEffect(() => {
    if (!data?.deadline) return;
    const target = new Date(data.deadline).getTime();

    function update() {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft(lang === "kr" ? "마감" : "Closed");
        setIsClosed(true);
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
      thanksTitle: "You're in.",
      confirmed: "Your perspective has been recorded. Results will be shared with all members once voting closes.",
      yourPick: "YOUR PICK",
      leadersVoted: "leaders voted so far",
      resultsIn: "Results in",
      closed: "Results dropping soon",
      closedSub: "",
      teaser: "You'll see how your peers voted — and which leaders share your perspective.",
      buildCard: "Complete your profile",
      buildCardSub: "So other leaders can find you when results are shared.",
      explorePast: "Browse past Signals",
      backDashboard: "Back to Dashboard",
    },
    kr: {
      thanksTitle: "참여 완료.",
      confirmed: "소중한 시각이 기록되었습니다. 투표가 끝나면 모든 멤버에게 결과가 공유됩니다.",
      yourPick: "내 선택",
      leadersVoted: "명 참여 중",
      resultsIn: "결과 공개까지",
      closed: "결과 곧 공개",
      closedSub: "",
      teaser: "동료 리더들의 선택과, 나와 같은 시각을 가진 리더들을 확인할 수 있습니다.",
      buildCard: "프로필 완성하기",
      buildCardSub: "결과가 공개되면 다른 리더들이 나를 찾을 수 있어요.",
      explorePast: "지난 Signal 살펴보기",
      backDashboard: "대시보드로 돌아가기",
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
  const pickKey = selectedOption || data?.yourPick;
  const pickLabel = selectedOptionLabel || data?.yourPickLabel;

  return (
    <div className="relative flex flex-col min-h-[70vh] justify-center px-4">
      {/* Atmospheric gold glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[500px] h-[500px] rounded-full bg-[#C8A84E]/[0.03] blur-[100px]" />
      </div>

      <div className="relative max-w-md mx-auto w-full space-y-8">

        {/* Signal badge with checkmark + Thank you */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 rounded-full border border-[#C8A84E]/20 bg-[#C8A84E]/[0.03] px-4 py-1.5">
              <svg className="size-3.5 text-[#C8A84E]" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="text-[11px] font-medium text-[#C8A84E]/70 tracking-wide">
                Signal #{signalNumber}
              </span>
            </div>
          </div>
          <h2 className="text-2xl font-light text-white tracking-tight">{txt.thanksTitle}</h2>
          <p className="text-[13px] text-white/40 leading-relaxed max-w-sm mx-auto">{txt.confirmed}</p>
        </div>

        {/* Your Pick — premium card */}
        {pickKey && (
          <div className="rounded-xl border border-[#C8A84E]/[0.15] bg-[#C8A84E]/[0.04] p-5 shadow-[0_0_40px_rgba(200,168,78,0.06)]">
            <div className="flex items-center gap-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#C8A84E] text-[#0A0F1C] text-xs font-semibold shadow-[0_0_12px_rgba(200,168,78,0.3)]">
                {pickKey}
              </span>
              <div className="min-w-0">
                <p className="text-[10px] text-[#C8A84E]/60 uppercase tracking-[0.12em] mb-1 font-medium">
                  {txt.yourPick}
                </p>
                <p className="text-sm font-normal text-white/85 leading-snug">
                  {pickLabel}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats + teaser — single card */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2.5">
              {loading ? (
                <div className="h-8 w-10 rounded bg-white/[0.06] animate-pulse" />
              ) : (
                <span className="text-3xl font-medium text-white tabular-nums">{data?.voteCount ?? 0}</span>
              )}
              <span className="text-[11px] text-white/30 uppercase tracking-wider">{txt.leadersVoted}</span>
            </div>
            {hasDeadline && (
              <div className="text-right">
                {isClosed ? (
                  <span className="text-[11px] text-[#C8A84E]/50">{txt.closed}</span>
                ) : (
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-medium text-[#C8A84E]/70 tabular-nums">{timeLeft}</span>
                    <span className="text-[10px] text-white/25">{txt.resultsIn}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="border-t border-white/[0.04] pt-3">
            <p className="text-[12px] text-white/25 leading-relaxed">
              {txt.teaser}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {!loading && !cardCompleted && (
            <Link href={profileUrl}
              className="flex items-center justify-between p-4 rounded-xl border-l-2 border-l-[#C8A84E]/30 border-y border-r border-y-[#C8A84E]/[0.06] border-r-[#C8A84E]/[0.06] bg-[#C8A84E]/[0.02] hover:bg-[#C8A84E]/[0.04] transition-all group">
              <div>
                <p className="text-sm text-[#C8A84E]/70 group-hover:text-[#C8A84E] transition-colors">{txt.buildCard}</p>
                <p className="text-[11px] text-white/25 mt-0.5">{txt.buildCardSub}</p>
              </div>
              <span className="text-[11px] text-[#C8A84E]/40 group-hover:text-[#C8A84E]/70 shrink-0 ml-3 transition-colors">→</span>
            </Link>
          )}
          <Link href={archiveUrl}
            className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-[#C8A84E]/[0.03] hover:border-[#C8A84E]/[0.1] transition-all group">
            <svg className="size-4 text-white/20 group-hover:text-[#C8A84E]/50 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <p className="text-sm text-white/50 group-hover:text-[#C8A84E]/70 transition-colors flex-1">{txt.explorePast}</p>
            <span className="text-[11px] text-[#C8A84E]/40 group-hover:text-[#C8A84E]/70 shrink-0 transition-colors">→</span>
          </Link>
          <Link href="/dashboard"
            className="flex items-center justify-center gap-1.5 py-3 text-[11px] text-white/25 hover:text-white/50 transition-colors">
            <svg className="size-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {txt.backDashboard}
          </Link>
        </div>

      </div>
    </div>
  );
}
