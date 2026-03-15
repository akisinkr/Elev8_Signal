"use client";

import * as React from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { SignalLanguageToggle } from "@/components/signal/signal-language-toggle";
import { PostVoteHub } from "@/components/signal/post-vote-hub";
import Link from "next/link";
import type { Lang } from "@/lib/signal-translations";

interface VoteFormWrapperProps {
  signalNumber: number;
  question: string;
  questionKr?: string;
  options: { key: string; label: string; labelKr?: string }[];
  deadline?: string | null;
  signalStatus?: string;
  memberEmail?: string;
  alreadyVoted?: boolean;
}

type Step = "email" | "vote" | "thanks" | "closed" | "not-member";

export function VoteFormWrapper({
  signalNumber,
  question,
  questionKr,
  options,
  deadline,
  signalStatus,
  memberEmail,
  alreadyVoted,
}: VoteFormWrapperProps) {
  const hasKorean = !!questionKr;
  const isClosed = signalStatus === "CLOSED" || signalStatus === "PUBLISHED";
  const hasSession = !!memberEmail;
  const [step, setStep] = React.useState<Step>(
    isClosed ? "closed" : alreadyVoted ? "thanks" : hasSession ? "vote" : "email"
  );
  const [lang, setLang] = React.useState<Lang>("en");
  const [email, setEmail] = React.useState(memberEmail || "");
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = React.useState(false);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [why, setWhy] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const displayQuestion = lang === "kr" && questionKr ? questionKr : question;
  function optionLabel(opt: { label: string; labelKr?: string }) {
    return lang === "kr" && opt.labelKr ? opt.labelKr : opt.label;
  }

  const t = {
    en: {
      welcome: "Welcome to Elev8 Signal",
      yourEmail: "Your email",
      continue: "Continue",
      checking: "Checking...",
      whyOptional: "Add your reasoning (anonymous) — it's what makes Signal valuable",
      whyPlaceholder: "In one line, what's behind your pick?",
      submitVote: "Add My Perspective",
      submitting: "Submitting...",
      youreIn: "You're in.",
      perspectiveRecorded: "Your perspective has been recorded.",
      resultsShared: "We'll share results once voting closes.",
      signalClosed: "This Signal has closed",
      stayTuned: "Stay tuned for the next one — your vote unlocks exclusive peer insights!",
      viewPastResults: "View Past Results",
      membersOnly: "Built for vetted senior leaders.",
      membersOnlyDesc: "Elev8 Signal captures what senior leaders actually think — unfiltered, anonymous, and only available to vetted members. Want in?",
      requestAccess: "Apply for Membership",
    },
    kr: {
      // ─ 한국어 전문가 에이전트 기준: 재창작, 번역 아님, Mode A (-요체)
      // ─ 눈치(nunchi) 반영: 필요한 것을 말하지 않아도 알아채는 글
      welcome: "Elev8 Signal입니다",
      yourEmail: "이메일 주소",
      continue: "계속하기",
      checking: "확인 중...",
      whyOptional: "한 줄이면 충분합니다 (익명) — 리더의 시각이 Signal의 핵심입니다",
      whyPlaceholder: "한 줄로, 이 선택의 이유는?",
      submitVote: "의견 제출하기",
      submitting: "제출 중...",
      youreIn: "소중한 시각을 함께 나눠주셨습니다.",
      perspectiveRecorded: "참여 완료.",
      resultsShared: "투표가 끝나면 모든 결과가 공개됩니다.",
      signalClosed: "이번 Signal은 마감되었습니다",
      stayTuned: "다음 Signal에서 또 뵙겠습니다. 참여하실 때마다 리더들의 날것의 시각을 확인하실 수 있습니다.",
      viewPastResults: "지난 결과 보기",
      membersOnly: "검증된 시니어 리더들만의 공간입니다.",
      membersOnlyDesc: "Elev8 Signal은 검증된 시니어 테크 리더들의 솔직한 시각을 담습니다. 멤버십에 관심이 있으시다면 신청해 보세요.",
      requestAccess: "멤버십 신청하기",
    },
  };

  const txt = t[lang];

  // Language toggle component (only show if Korean translation exists)
  const langToggle = hasKorean ? (
    <div className="flex justify-center">
      <SignalLanguageToggle lang={lang} onLangChange={setLang} />
    </div>
  ) : null;

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setEmailError(null);
    setIsCheckingEmail(true);

    try {
      const res = await fetch(`/api/signal/${signalNumber}/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStep("not-member");
        return;
      }

      if (data.signalStatus === "CLOSED" || data.signalStatus === "PUBLISHED") {
        setStep("closed");
        return;
      }

      if (data.alreadyVoted) {
        setStep("thanks");
        return;
      }

      setStep("vote");
    } catch {
      setEmailError(
        lang === "kr"
          ? "문제가 발생했습니다. 다시 시도해 주세요."
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsCheckingEmail(false);
    }
  }

  async function handleSubmit() {
    if (!selected) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/signal/${signalNumber}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer: selected,
          why: why || undefined,
          email: email.trim().toLowerCase(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 409) {
          // Already voted — show the thanks screen
          setStep("thanks");
        } else {
          toast.error(data.error || "Failed to submit vote");
        }
        return;
      }

      setStep("thanks");
    } catch {
      toast.error(
        lang === "kr"
          ? "문제가 발생했습니다. 다시 시도해 주세요."
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- CLOSED SIGNAL SCREEN ---
  if (step === "closed") {
    return (
      <div className="flex flex-col min-h-[60vh] justify-center items-center px-4">
        {langToggle && <div className="mb-6">{langToggle}</div>}
        <div
          className="w-full max-w-md mx-auto"
          style={{ animation: "fadeInUp 0.6s ease-out both" }}
        >
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#C8A84E]/[0.08]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#C8A84E]/60">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-light text-white">{txt.signalClosed}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{txt.stayTuned}</p>
            </div>
            <Link
              href={`/signal/archive${email ? `?email=${encodeURIComponent(email)}` : ""}`}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-all",
                "border border-[#C8A84E]/20 text-[#C8A84E]/70",
                "hover:bg-[#C8A84E]/[0.06] hover:text-[#C8A84E] active:scale-[0.98]"
              )}
            >
              {txt.viewPastResults}
              <span className="text-[#C8A84E]/40">→</span>
            </Link>
          </div>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }` }} />
      </div>
    );
  }

  // --- NOT A MEMBER SCREEN ---
  if (step === "not-member") {
    return (
      <div className="flex flex-col min-h-[60vh] justify-center items-center px-4">
        {langToggle && <div className="mb-6">{langToggle}</div>}
        <div
          className="w-full max-w-md mx-auto"
          style={{ animation: "fadeInUp 0.6s ease-out both" }}
        >
          <div className="rounded-2xl border border-border/60 bg-card p-8 text-center shadow-lg space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">{txt.membersOnly}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{txt.membersOnlyDesc}</p>
            </div>
            <Link
              href="/request-access"
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 active:scale-[0.98]"
              )}
            >
              {txt.requestAccess}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }` }} />
      </div>
    );
  }

  // --- POST-VOTE HUB (replaces simple thanks screen) ---
  if (step === "thanks") {
    // Find the selected option's label for display
    const selectedOpt = options.find((o) => o.key === selected);
    const selectedLabel = selectedOpt
      ? (lang === "kr" && selectedOpt.labelKr ? selectedOpt.labelKr : selectedOpt.label)
      : "";

    return (
      <PostVoteHub
        signalNumber={signalNumber}
        email={email}
        selectedOption={selected || ""}
        selectedOptionLabel={selectedLabel}
        lang={lang}
      />
    );
  }

  // --- EMAIL SCREEN ---
  if (step === "email") {
    return (
      <div className="flex flex-col min-h-[80vh] justify-center px-4">
        <div className="w-full max-w-md mx-auto space-y-8">
          {/* Language toggle */}
          {langToggle}

          {/* Brand mark */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <div className="h-px w-8 bg-[#C8A84E]/30" />
              <div className="relative">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#C8A84E]/20" />
                <div className="relative size-2 rounded-full bg-[#C8A84E]" />
              </div>
              <div className="h-px w-8 bg-[#C8A84E]/30" />
            </div>
            <p className="text-[11px] font-medium text-[#C8A84E]/70 uppercase tracking-[0.2em]">
              Signal #{signalNumber}
            </p>
          </div>

          {/* Question */}
          <h1 className="text-2xl sm:text-3xl font-light leading-snug text-center tracking-tight">
            {displayQuestion}
          </h1>

          {/* Email form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-normal text-white/40">
                {txt.yourEmail}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(null);
                }}
                className={cn(
                  "flex h-12 w-full rounded-xl border bg-white/[0.03] px-4 text-sm text-white",
                  "placeholder:text-white/20",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C8A84E]/40",
                  emailError ? "border-red-500/50" : "border-white/[0.08]"
                )}
              />
              {emailError && <p className="text-sm text-red-400">{emailError}</p>}
            </div>
            <button
              type="submit"
              disabled={isCheckingEmail || !email.trim()}
              className={cn(
                "w-full rounded-xl py-4 text-base font-medium transition-all",
                "bg-[#C8A84E] text-[#0A0F1C]",
                "hover:bg-[#C8A84E]/90 active:scale-[0.98]",
                "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none",
                "hover:shadow-[0_0_20px_rgba(200,168,78,0.3)]"
              )}
            >
              {isCheckingEmail ? txt.checking : txt.continue}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- VOTE SCREEN ---
  return (
    <div className="flex flex-col min-h-[80vh] justify-center px-4">
      <div className="w-full max-w-lg mx-auto space-y-8">
        {/* Language toggle */}
        {langToggle}

        {/* Signal badge */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 rounded-full border border-[#C8A84E]/20 bg-[#C8A84E]/[0.03] px-4 py-1.5">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C8A84E]/40" />
              <span className="relative inline-flex size-1.5 rounded-full bg-[#C8A84E]" />
            </span>
            <span className="text-[11px] font-medium text-[#C8A84E]/70 tracking-wide">
              Signal #{signalNumber} · LIVE
            </span>
          </div>
        </div>

        {/* Question */}
        <h1 className="text-2xl sm:text-3xl font-light leading-snug text-center tracking-tight max-w-xl mx-auto">
          {displayQuestion}
        </h1>

        {/* Options */}
        <div className="space-y-3">
          {options.map((option) => (
            <button
              key={option.key}
              type="button"
              disabled={isSubmitting}
              onClick={() => setSelected(option.key)}
              className={cn(
                "flex w-full items-center gap-4 rounded-xl border px-5 py-5 text-left transition-all",
                "text-sm sm:text-base font-normal",
                "active:scale-[0.98]",
                selected === option.key
                  ? "border-[#C8A84E]/30 bg-[#C8A84E]/[0.06] text-white"
                  : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04] text-white/70"
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  selected === option.key
                    ? "bg-[#C8A84E] text-black"
                    : "bg-white/[0.08] text-white/40"
                )}
              >
                {option.key}
              </span>
              <span className="flex-1">{optionLabel(option)}</span>
            </button>
          ))}
        </div>

        {/* Why field */}
        {selected && (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between">
              <label className="text-sm text-white/40">
                {txt.whyOptional}
              </label>
              <span className="text-xs text-white/25">{why.length}/280</span>
            </div>
            <Textarea
              placeholder={txt.whyPlaceholder}
              value={why}
              onChange={(e) => setWhy(e.target.value.slice(0, 280))}
              maxLength={280}
              rows={3}
              className="resize-none"
            />
          </div>
        )}

        {/* Submit */}
        {selected && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className={cn(
              "w-full rounded-xl py-4 text-base font-medium transition-all",
              "bg-[#C8A84E] text-[#0A0F1C]",
              "hover:bg-[#C8A84E]/90 active:scale-[0.98]",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none",
              "hover:shadow-[0_0_20px_rgba(200,168,78,0.3)]",
              "animate-in fade-in slide-in-from-bottom-2 duration-200"
            )}
          >
            {isSubmitting ? txt.submitting : txt.submitVote}
          </button>
        )}
      </div>
    </div>
  );
}
