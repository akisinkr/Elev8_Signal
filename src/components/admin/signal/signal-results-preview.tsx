"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignalHeadline } from "@/components/signal/signal-headline";
import { SignalYourVsGroup } from "@/components/signal/signal-your-vs-group";
import { SignalDonutChart } from "@/components/signal/signal-donut-chart";
import { SignalResultBars } from "@/components/signal/signal-result-bars";
import { SignalPeerQuotes } from "@/components/signal/signal-peer-quotes";
import { SignalRelatedArticles } from "@/components/signal/signal-related-articles";
import { SignalLanguageToggle } from "@/components/signal/signal-language-toggle";
import type { Lang } from "@/lib/signal-translations";

interface DistributionItem {
  answer: string;
  label: string;
  count: number;
  percentage: number;
}

interface Vote {
  answer: string;
  memberName: string;
  why: string | null;
  createdAt: string;
}

interface SignalResultsPreviewProps {
  signalNumber: number;
  question: string;
  headlineInsight: string | null;
  distribution: DistributionItem[];
  votes: Vote[];
  onClose: () => void;
}

export function SignalResultsPreview({
  signalNumber,
  question,
  headlineInsight,
  distribution,
  votes,
  onClose,
}: SignalResultsPreviewProps) {
  const [lang, setLang] = React.useState<Lang>("en");

  const totalVotes = votes.length;

  // Find top answer
  const sorted = [...distribution].sort((a, b) => b.count - a.count);
  const topAnswer = sorted[0] || { answer: "A", label: "", count: 0, percentage: 0 };

  // Collect anonymous quotes
  const anonymousQuotes = votes
    .filter((v) => v.why && v.why.trim().length > 0)
    .map((v) => v.why!)
    .slice(0, 5);

  // Parse articles from headlineInsight
  const articles = React.useMemo(() => {
    if (!headlineInsight) return [];
    try {
      const parsed = JSON.parse(headlineInsight);
      return parsed.articles || [];
    } catch {
      return [];
    }
  }, [headlineInsight]);

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-start justify-center py-8 px-4">
          <div className="w-full max-w-2xl rounded-xl border bg-card shadow-lg">
            {/* Preview header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Member Preview
                </p>
                <p className="text-sm font-semibold">
                  This is what members will see
                </p>
              </div>
              <div className="flex items-center gap-3">
                <SignalLanguageToggle lang={lang} onLangChange={setLang} />
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            {/* Preview content — mirrors the member results page */}
            <div className="px-6 py-6 space-y-8">
              <div>
                <h1 className="text-lg font-semibold tracking-tight">
                  Signal #{signalNumber}
                </h1>
              </div>

              <h2 className="text-xl font-bold leading-snug">{question}</h2>

              <SignalHeadline
                headline={headlineInsight}
                signalNumber={signalNumber}
                lang={lang}
              />

              {articles.length > 0 && (
                <SignalRelatedArticles articles={articles} lang={lang} />
              )}

              <SignalYourVsGroup
                memberAnswer={null}
                topAnswer={{ key: topAnswer.answer, label: topAnswer.label }}
                totalVotes={totalVotes}
                topPercentage={topAnswer.percentage}
                lang={lang}
              />

              <SignalDonutChart
                distribution={distribution}
                totalVotes={totalVotes}
                memberAnswer={null}
                lang={lang}
              />

              <SignalResultBars
                distribution={distribution}
                totalVotes={totalVotes}
                memberAnswer={null}
                lang={lang}
              />

              {anonymousQuotes.length > 0 && (
                <SignalPeerQuotes quotes={anonymousQuotes} lang={lang} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
