"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { SignalHeadline } from "@/components/signal/signal-headline";
import { SignalYourVsGroup } from "@/components/signal/signal-your-vs-group";
import { SignalPeerQuotes } from "@/components/signal/signal-peer-quotes";
import { SignalSuggestQuestion } from "@/components/signal/signal-suggest-question";
import { SignalDonutChart } from "@/components/signal/signal-donut-chart";
import { SignalRelatedArticles } from "@/components/signal/signal-related-articles";
import { SignalSuperpowerExchange } from "@/components/signal/signal-superpower-exchange";
import { SignalLanguageToggle } from "@/components/signal/signal-language-toggle";
import type { Lang } from "@/lib/signal-translations";
import { tr } from "@/lib/signal-translations";

interface SignalResultsClientProps {
  signalNumber: number;
  question: string;
  questionKr?: string;
  status: string;
  headlineInsight: string | null;
  options: { key: string; label: string }[];
}

type ResultsData = {
  distribution: {
    answer: string;
    label: string;
    labelKr: string | null;
    count: number;
    percentage: number;
  }[];
  totalVotes: number;
  memberAnswer: string | null;
  topAnswer: string;
  topAnswerLabel: string;
  topAnswerLabelKr: string | null;
  anonymousQuotes: string[];
  headlineInsight: string | null;
};

// ── Collapsible Section ──
function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div className="border-b border-white/[0.05] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="text-[11px] tracking-[0.15em] uppercase text-white/35 group-hover:text-white/50 transition-colors">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "size-3.5 text-white/20 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

export function SignalResultsClient({
  signalNumber,
  question,
  questionKr,
  status,
  headlineInsight,
}: SignalResultsClientProps) {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token");
  const emailFromUrl = searchParams.get("email");
  const [email, setEmail] = React.useState(emailFromUrl ?? "");
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(!!tokenFromUrl || !!emailFromUrl);
  const [results, setResults] = React.useState<ResultsData | null>(null);
  const [lang, setLang] = React.useState<Lang>("en");
  const [closedSignal, setClosedSignal] = React.useState(false);
  const [notMember, setNotMember] = React.useState(false);

  const displayQuestion = lang === "kr" && questionKr ? questionKr : question;

  const articles = React.useMemo(() => {
    if (!results?.headlineInsight) return [];
    try {
      const parsed = JSON.parse(results.headlineInsight);
      return parsed.articles || [];
    } catch {
      return [];
    }
  }, [results?.headlineInsight]);

  // Auto-fetch results when token is in URL
  React.useEffect(() => {
    if (!tokenFromUrl) return;
    async function fetchWithToken() {
      try {
        const res = await fetch(`/api/signal/${signalNumber}/results`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: tokenFromUrl }),
        });
        const data = await res.json();
        if (res.ok) setResults(data);
        else setEmailError(data.error || (lang === "kr" ? "유효하지 않은 링크입니다." : "Invalid link. Please enter your email."));
      } catch {
        setEmailError(lang === "kr" ? "문제가 발생했습니다." : "Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchWithToken();
  }, [tokenFromUrl, signalNumber]);

  // Auto-fetch results when email is in URL
  React.useEffect(() => {
    if (!emailFromUrl || tokenFromUrl) return;
    async function fetchWithEmail() {
      try {
        const res = await fetch(`/api/signal/${signalNumber}/results`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailFromUrl!.toLowerCase() }),
        });
        const data = await res.json();
        if (res.ok) setResults(data);
        else setEmailError(data.error || (lang === "kr" ? "결과를 불러올 수 없습니다." : "Could not load results."));
      } catch {
        setEmailError(lang === "kr" ? "문제가 발생했습니다." : "Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchWithEmail();
  }, [emailFromUrl, tokenFromUrl, signalNumber]);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setEmailError(null);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/signal/${signalNumber}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.needsVote) setClosedSignal(true);
        else if (data.notPublished) setEmailError(lang === "kr" ? "아직 결과가 공개되지 않았습니다." : "Results aren't available yet.");
        else setNotMember(true);
        return;
      }
      if (data.memberAnswer === null) { setClosedSignal(true); return; }
      setResults(data);
    } catch {
      setEmailError(lang === "kr" ? "문제가 발생했습니다." : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  // ── Not published ──
  if (status !== "PUBLISHED" && !results) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#C8A84E]/40">Signal #{signalNumber}</p>
        <h1 className="text-2xl font-light text-white/90 leading-snug">{displayQuestion}</h1>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] py-12 text-center">
          <h3 className="text-base font-light text-white/80">{tr("resultsNotAvailable", lang)}</h3>
          <p className="mt-1 text-[13px] text-white/30">{tr("resultsWillBeShared", lang)}</p>
          {status === "LIVE" && (
            <Link href={`/signal/${signalNumber}/vote`} className="mt-4 inline-block text-sm text-[#C8A84E]/70 hover:text-[#C8A84E]">
              {tr("castYourVote", lang)}
            </Link>
          )}
        </div>
      </div>
    );
  }

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-[60vh] justify-center items-center">
        <div className="size-6 border-2 border-[#C8A84E] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-[13px] text-white/30">{tr("loadingResults", lang)}</p>
      </div>
    );
  }

  // ── Closed signal ──
  if (closedSignal) {
    return (
      <div className="flex flex-col min-h-[60vh] justify-center items-center px-4">
        <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-8 text-center space-y-6">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#C8A84E]/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#C8A84E]/70">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-light text-white/90">{tr("signalClosed", lang)}</h3>
              <p className="text-[13px] text-white/35 leading-relaxed">{tr("signalClosedBody", lang)}</p>
            </div>
            <Link
              href={`/signal/archive${email ? `?email=${encodeURIComponent(email)}` : ""}`}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium bg-[#C8A84E] text-[#0A0F1C] hover:bg-[#C8A84E]/90 transition-all"
            >
              {tr("viewPastResults", lang)}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Not a member ──
  if (notMember) {
    return (
      <div className="flex flex-col min-h-[60vh] justify-center items-center px-4">
        <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-8 text-center space-y-6">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#C8A84E]/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#C8A84E]/70">
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-light text-white/90">{tr("membersOnly", lang)}</h3>
              <p className="text-[13px] text-white/35 leading-relaxed">{tr("membersOnlyDesc", lang)}</p>
            </div>
            <Link
              href="/request-access"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium bg-[#C8A84E] text-[#0A0F1C] hover:bg-[#C8A84E]/90 transition-all"
            >
              {tr("requestAccess", lang)}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Email gate ──
  if (!results) {
    return (
      <div className="flex flex-col min-h-[60vh] justify-center px-4">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="text-center space-y-3">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#C8A84E]/40">
              Signal #{signalNumber}
            </p>
            <h1 className="text-xl sm:text-2xl font-light text-white/90 leading-snug">
              {displayQuestion}
            </h1>
          </div>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-[13px] text-white/50">
                {tr("yourEmail", lang)}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
                className={cn(
                  "flex h-12 w-full rounded-xl border bg-white/[0.03] px-4 text-sm text-white/80",
                  "placeholder:text-white/20",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A84E]/30 focus-visible:border-[#C8A84E]/20",
                  emailError ? "border-red-400/40" : "border-white/[0.08]"
                )}
              />
              {emailError && <p className="text-sm text-red-400/80">{emailError}</p>}
            </div>
            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full rounded-xl py-3.5 text-sm font-medium bg-[#C8A84E] text-[#0A0F1C] hover:bg-[#C8A84E]/90 transition-all disabled:opacity-30"
            >
              {isLoading ? tr("loading", lang) : tr("continue", lang)}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════
  // RESULTS VIEW
  // ════════════════════════════════════════════

  const memberAnswerOption = results.memberAnswer
    ? {
        key: results.memberAnswer,
        label: (() => {
          const d = results.distribution.find((d) => d.answer === results.memberAnswer);
          return (lang === "kr" && d?.labelKr) ? d.labelKr : (d?.label ?? "");
        })(),
      }
    : null;

  const topAnswerOption = {
    key: results.topAnswer,
    label: (lang === "kr" && results.topAnswerLabelKr) ? results.topAnswerLabelKr : results.topAnswerLabel,
  };

  const memberPercentage = memberAnswerOption
    ? results.distribution.find((d) => d.answer === memberAnswerOption.key)?.percentage ?? 0
    : 0;

  const topPercentage =
    results.distribution.find((d) => d.answer === results.topAnswer)?.percentage ?? 0;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-1">
        <Link
          href={`/signal/archive${email ? `?email=${encodeURIComponent(email)}` : ""}`}
          className="text-[13px] text-white/30 hover:text-white/50 transition-colors"
        >
          ← {tr("archive", lang)}
        </Link>
        <SignalLanguageToggle lang={lang} onLangChange={setLang} />
      </div>

      {/* ── Question ── */}
      <div className="mt-6 mb-10">
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#C8A84E]/40 mb-2">
          Signal #{signalNumber}
        </p>
        <h1 className="text-2xl sm:text-[28px] font-light leading-snug text-white/90">
          {displayQuestion}
        </h1>
      </div>

      {/* ── TIER 1: Your result (above fold) ── */}
      <SignalYourVsGroup
        memberAnswer={memberAnswerOption}
        topAnswer={topAnswerOption}
        totalVotes={results.totalVotes}
        memberPercentage={memberPercentage}
        topPercentage={topPercentage}
        lang={lang}
      />

      {/* ── TIER 2: Collapsible deep-dive sections ── */}
      <div className="mt-12">
        <CollapsibleSection
          title={lang === "kr" ? "멤버 전용 인사이트" : "Members-Only Intelligence"}
        >
          <SignalHeadline
            headline={results.headlineInsight}
            signalNumber={signalNumber}
            lang={lang}
          />
        </CollapsibleSection>

        <CollapsibleSection title={lang === "kr" ? "투표 분포" : "Vote Distribution"}>
          <SignalDonutChart
            distribution={results.distribution}
            totalVotes={results.totalVotes}
            memberAnswer={results.memberAnswer}
            lang={lang}
          />
        </CollapsibleSection>

        {results.anonymousQuotes.length > 0 && (
          <CollapsibleSection title={lang === "kr" ? "멤버 코멘트" : "Peer Perspectives"}>
            <SignalPeerQuotes quotes={results.anonymousQuotes} lang={lang} />
          </CollapsibleSection>
        )}

        {articles.length > 0 && (
          <CollapsibleSection title={lang === "kr" ? "관련 기사" : "Related Reading"}>
            <SignalRelatedArticles articles={articles} lang={lang} />
          </CollapsibleSection>
        )}
      </div>

      {/* ── TIER 3: Action CTAs ── */}
      <div className="mt-14 space-y-6">
        <SignalSuperpowerExchange
          signalNumber={signalNumber}
          email={email}
          memberAnswer={results.memberAnswer}
          memberAnswerLabel={memberAnswerOption?.label ?? ""}
          lang={lang}
        />

        <SignalSuggestQuestion email={email} lang={lang} />
      </div>
    </div>
  );
}
