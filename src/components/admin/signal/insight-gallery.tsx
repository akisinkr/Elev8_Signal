"use client";

import * as React from "react";
import { SignalHeadline } from "@/components/signal/signal-headline";
import { SignalRelatedArticles } from "@/components/signal/signal-related-articles";
import { SignalLanguageToggle } from "@/components/signal/signal-language-toggle";
import type { Lang } from "@/lib/signal-translations";
import { Calendar, Users } from "lucide-react";

interface InsightSignal {
  signalNumber: number;
  question: string;
  headlineInsight: string;
  publishedAt: string | null;
  voteCount: number;
}

interface InsightGalleryProps {
  signals: InsightSignal[];
}

function parseArticles(raw: string) {
  try {
    const parsed = JSON.parse(raw);
    return parsed.articles || [];
  } catch {
    return [];
  }
}

export function InsightGallery({ signals }: InsightGalleryProps) {
  const [lang, setLang] = React.useState<Lang>("en");

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <SignalLanguageToggle lang={lang} onLangChange={setLang} />
      </div>

      <div className="space-y-8">
        {signals.map((signal) => {
          const articles = parseArticles(signal.headlineInsight);
          return (
            <div
              key={signal.signalNumber}
              className="rounded-xl border bg-card shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between border-b px-6 py-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Signal #{signal.signalNumber}
                  </p>
                  <h2 className="mt-1 text-base font-semibold leading-snug">
                    {signal.question}
                  </h2>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="size-3.5" />
                    {signal.voteCount} votes
                  </span>
                  {signal.publishedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      {new Date(signal.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </div>

              <div className="px-6 py-5 space-y-4">
                <SignalHeadline
                  headline={signal.headlineInsight}
                  signalNumber={signal.signalNumber}
                  lang={lang}
                />
                {articles.length > 0 && (
                  <SignalRelatedArticles articles={articles} lang={lang} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
