"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { SignalHeadline } from "@/components/signal/signal-headline";
import { SignalYourVsGroup } from "@/components/signal/signal-your-vs-group";
import { SignalResultBars } from "@/components/signal/signal-result-bars";
import { SignalPeerQuotes } from "@/components/signal/signal-peer-quotes";
import { SignalShareCard } from "@/components/signal/signal-share-card";
import { SignalSuggestQuestion } from "@/components/signal/signal-suggest-question";
import { SignalDonutChart } from "@/components/signal/signal-donut-chart";
import { SignalRelatedArticles } from "@/components/signal/signal-related-articles";
import { SignalLanguageToggle } from "@/components/signal/signal-language-toggle";
import type { Lang } from "@/lib/signal-translations";
import { tr } from "@/lib/signal-translations";

interface SignalResultsClientProps {
  signalNumber: number;
  question: string;
  status: string;
  headlineInsight: string | null;
  options: { key: string; label: string }[];
}

type ResultsData = {
  distribution: {
    answer: string;
    label: string;
    count: number;
    percentage: number;
  }[];
  totalVotes: number;
  memberAnswer: string | null;
  topAnswer: string;
  topAnswerLabel: string;
  anonymousQuotes: string[];
  headlineInsight: string | null;
};

export function SignalResultsClient({
  signalNumber,
  question,
  status,
  headlineInsight,
  options,
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

  // Parse articles from headlineInsight JSON (must be before early returns)
  const articles = React.useMemo(() => {
    if (!results?.headlineInsight) return [];
    try {
      const parsed = JSON.parse(results.headlineInsight);
      return parsed.articles || [];
    } catch {
      return [];
    }
  }, [results?.headlineInsight]);

  // Auto-fetch results when token is in URL (from email link)
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
        if (res.ok) {
          setResults(data);
        } else {
          setEmailError(data.error || "Invalid link. Please enter your email.");
        }
      } catch {
        setEmailError("Something went wrong. Please enter your email.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchWithToken();
  }, [tokenFromUrl, signalNumber]);

  // Auto-fetch results when email is in URL (from archive link)
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
        if (res.ok) {
          setResults(data);
        } else {
          setEmailError(data.error || "Could not load results.");
        }
      } catch {
        setEmailError("Something went wrong. Please try again.");
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
        if (data.needsVote) {
          setClosedSignal(true);
        } else if (data.notPublished) {
          setEmailError("Results aren't available yet. Stay tuned.");
        } else {
          setNotMember(true);
        }
        return;
      }

      // Member didn't vote on this signal — show lock card
      if (data.memberAnswer === null) {
        setClosedSignal(true);
        return;
      }

      setResults(data);
    } catch {
      setEmailError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Not published — show status
  if (status !== "PUBLISHED" && !results) {
    return (
      <div className="space-y-6">
        <h1 className="text-lg font-semibold tracking-tight">
          Signal #{signalNumber}
        </h1>
        <div className="space-y-4">
          <h2 className="text-xl font-bold leading-snug">{question}</h2>
          <div className="rounded-lg border bg-card py-12 text-center">
            <h3 className="text-lg font-semibold">{tr("resultsNotAvailable", lang)}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {tr("resultsWillBeShared", lang)}
            </p>
            {status === "LIVE" && (
              <Link
                href={`/signal/${signalNumber}/vote`}
                className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
              >
                {tr("castYourVote", lang)}
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Loading state (token or email auto-fetch in progress)
  if (isLoading && (tokenFromUrl || emailFromUrl)) {
    return (
      <div className="flex flex-col min-h-[60vh] justify-center items-center">
        <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm text-muted-foreground">Loading results...</p>
      </div>
    );
  }

  // Closed signal — animated card for non-voters
  if (closedSignal) {
    return (
      <div className="flex flex-col min-h-[60vh] justify-center items-center px-4">
        <div
          className="w-full max-w-md mx-auto transition-all duration-700"
          style={{ animation: "fadeInUp 0.6s ease-out both" }}
        >
          <div className="rounded-2xl border border-border/60 bg-card p-8 text-center shadow-lg space-y-6">
            {/* Lock icon with pulse */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 animate-[pulse_2s_ease-in-out_infinite]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                This Signal has closed
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Stay tuned for the next one — your vote unlocks exclusive peer insights!
              </p>
            </div>

            <Link
              href={`/signal/archive${email ? `?email=${encodeURIComponent(email)}` : ""}`}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 active:scale-[0.98]"
              )}
            >
              View Past Results
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}} />
      </div>
    );
  }

  // Not a member — invitation card
  if (notMember) {
    return (
      <div className="flex flex-col min-h-[60vh] justify-center items-center px-4">
        <div
          className="w-full max-w-md mx-auto"
          style={{ animation: "fadeInUp 0.6s ease-out both" }}
        >
          <div className="rounded-2xl border border-border/60 bg-card p-8 text-center shadow-lg space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 animate-pulse">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                This Conversation is Members-Only
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Elev8 Signal captures what senior leaders actually think — unfiltered, anonymous, and only available to vetted members. Want in?
              </p>
            </div>

            <Link
              href="/request-access"
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 active:scale-[0.98]"
              )}
            >
              Request Access
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}} />
      </div>
    );
  }

  // Email gate
  if (!results) {
    return (
      <div className="flex flex-col min-h-[60vh] justify-center px-4">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Signal #{signalNumber} — {tr("signalResults", lang)}
            </p>
            <h1 className="text-xl sm:text-2xl font-bold leading-snug">
              {tr("welcomeToSignal", lang)}
            </h1>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold leading-snug text-center">
              {question}
            </h2>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                {tr("yourEmail", lang)}
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
              {emailError && (
                <p className="text-sm text-destructive">{emailError}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className={cn(
                "w-full rounded-xl py-4 text-base font-semibold transition-all",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 active:scale-[0.98]",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? tr("loading", lang) : tr("continue", lang)}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Results view
  const memberAnswerOption = results.memberAnswer
    ? {
        key: results.memberAnswer,
        label:
          results.distribution.find((d) => d.answer === results.memberAnswer)
            ?.label ?? "",
      }
    : null;

  const topAnswerOption = {
    key: results.topAnswer,
    label: results.topAnswerLabel,
  };

  const memberPercentage = memberAnswerOption
    ? results.distribution.find((d) => d.answer === memberAnswerOption.key)
        ?.percentage ?? 0
    : 0;

  const topPercentage =
    results.distribution.find((d) => d.answer === results.topAnswer)
      ?.percentage ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href={`/signal/archive${email ? `?email=${encodeURIComponent(email)}` : ""}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
          Archive
        </Link>
        <SignalLanguageToggle lang={lang} onLangChange={setLang} />
      </div>

      <h1 className="text-lg font-semibold tracking-tight">
        Signal #{signalNumber}
      </h1>

      <h2 className="text-xl font-bold leading-snug">{question}</h2>

      <SignalHeadline
        headline={results.headlineInsight}
        signalNumber={signalNumber}
        lang={lang}
      />

      {articles.length > 0 && (
        <SignalRelatedArticles articles={articles} lang={lang} />
      )}

      <SignalYourVsGroup
        memberAnswer={memberAnswerOption}
        topAnswer={topAnswerOption}
        totalVotes={results.totalVotes}
        memberPercentage={memberPercentage}
        topPercentage={topPercentage}
        lang={lang}
      />

      <SignalDonutChart
        distribution={results.distribution}
        totalVotes={results.totalVotes}
        memberAnswer={results.memberAnswer}
        lang={lang}
      />

      <SignalPeerQuotes quotes={results.anonymousQuotes} lang={lang} />

      <SignalSuggestQuestion email={email} />

      <div className="pt-4 text-center">
        <Link
          href={`/signal/archive${email ? `?email=${encodeURIComponent(email)}` : ""}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          Back to Archive
        </Link>
      </div>
    </div>
  );
}
