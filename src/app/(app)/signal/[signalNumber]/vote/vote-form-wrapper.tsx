"use client";

import * as React from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { SignalLanguageToggle } from "@/components/signal/signal-language-toggle";
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
}: VoteFormWrapperProps) {
  const hasKorean = !!questionKr;
  const isClosed = signalStatus === "CLOSED" || signalStatus === "PUBLISHED";
  const hasSession = !!memberEmail;
  const [step, setStep] = React.useState<Step>(isClosed ? "closed" : hasSession ? "vote" : "email");
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
      whyOptional: "Why? (optional)",
      whyPlaceholder: "Share your reasoning...",
      submitVote: "Submit Vote",
      submitting: "Submitting...",
      youreIn: "You're in.",
      perspectiveRecorded: "Your perspective has been recorded.",
      resultsShared: "We'll share results once voting closes.",
      signalClosed: "This Signal has closed",
      stayTuned: "Stay tuned for the next one — your vote unlocks exclusive peer insights!",
      viewPastResults: "View Past Results",
      membersOnly: "This Conversation is Members-Only",
      membersOnlyDesc: "Elev8 Signal captures what senior leaders actually think — unfiltered, anonymous, and only available to vetted members. Want in?",
      requestAccess: "Request Access",
    },
    kr: {
      welcome: "Elev8 Signal에 오신 것을 환영합니다",
      yourEmail: "이메일",
      continue: "계속하기",
      checking: "확인 중...",
      whyOptional: "이유는? (선택사항)",
      whyPlaceholder: "의견을 남겨주세요...",
      submitVote: "투표하기",
      submitting: "제출 중...",
      youreIn: "투표 완료.",
      perspectiveRecorded: "의견이 기록되었습니다.",
      resultsShared: "투표가 마감되면 결과를 공유해 드립니다.",
      signalClosed: "이 Signal은 마감되었습니다",
      stayTuned: "다음 Signal을 기대해 주세요 — 투표로 리더 인사이트를 확인하세요!",
      viewPastResults: "지난 결과 보기",
      membersOnly: "멤버 전용 대화입니다",
      membersOnlyDesc: "Elev8 Signal은 시니어 리더들의 솔직한 의견을 담고 있습니다 — 검증된 멤버만 참여할 수 있습니다.",
      requestAccess: "참여 신청하기",
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
        setEmailError(
          lang === "kr"
            ? "이미 의견을 남기셨습니다. 결과를 기대해 주세요."
            : "You've already shared your perspective. Results coming soon."
        );
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
          <div className="rounded-2xl border border-border/60 bg-card p-8 text-center shadow-lg space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">{txt.signalClosed}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{txt.stayTuned}</p>
            </div>
            <Link
              href={`/signal/archive${email ? `?email=${encodeURIComponent(email)}` : ""}`}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 active:scale-[0.98]"
              )}
            >
              {txt.viewPastResults}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
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

  // --- THANKS SCREEN ---
  if (step === "thanks") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="relative mb-6">
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <CheckCircle2 className="relative size-16 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom-2 duration-500">
          {txt.youreIn}
        </h1>
        <p
          className="mt-3 text-muted-foreground text-sm animate-in fade-in slide-in-from-bottom-2 duration-500"
          style={{ animationDelay: "200ms", animationFillMode: "both" }}
        >
          {txt.perspectiveRecorded}
        </p>
        <p
          className="mt-1 text-muted-foreground text-xs animate-in fade-in slide-in-from-bottom-2 duration-500"
          style={{ animationDelay: "400ms", animationFillMode: "both" }}
        >
          {txt.resultsShared}
        </p>
        <Link
          href="/"
          className={cn(
            "mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all",
            "bg-primary text-primary-foreground",
            "hover:bg-primary/90 active:scale-[0.98]",
            "animate-in fade-in slide-in-from-bottom-2 duration-500"
          )}
          style={{ animationDelay: "600ms", animationFillMode: "both" }}
        >
          {lang === "kr" ? "홈으로 돌아가기" : "Back to Home"}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
        </Link>
      </div>
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
              <div className="h-px w-8 bg-primary/40" />
              <div className="relative">
                <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                <div className="relative size-2 rounded-full bg-primary" />
              </div>
              <div className="h-px w-8 bg-primary/40" />
            </div>
            <p className="text-xs font-medium text-primary uppercase tracking-[0.2em]">
              Signal #{signalNumber}
            </p>
          </div>

          {/* Question */}
          <h1 className="text-xl sm:text-2xl font-bold leading-snug text-center">
            {displayQuestion}
          </h1>

          {/* Email form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
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
                  "flex h-12 w-full rounded-xl border bg-background px-4 text-sm",
                  "placeholder:text-muted-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  emailError ? "border-destructive" : "border-border"
                )}
              />
              {emailError && <p className="text-sm text-destructive">{emailError}</p>}
            </div>
            <button
              type="submit"
              disabled={isCheckingEmail || !email.trim()}
              className={cn(
                "w-full rounded-xl py-4 text-base font-semibold transition-all",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 active:scale-[0.98]",
                "disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              Signal #{signalNumber} · LIVE
            </span>
          </div>
        </div>

        {/* Question */}
        <h1 className="text-xl sm:text-2xl font-bold leading-snug text-center">
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
                "flex w-full items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all",
                "text-sm sm:text-base font-medium",
                "active:scale-[0.98]",
                selected === option.key
                  ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10"
                  : "border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/50"
              )}
            >
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors",
                  selected === option.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
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
              <label className="text-sm text-muted-foreground">
                {txt.whyOptional}
              </label>
              <span className="text-xs text-muted-foreground">{why.length}/280</span>
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
              "w-full rounded-xl py-4 text-base font-semibold transition-all",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 active:scale-[0.98]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
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
