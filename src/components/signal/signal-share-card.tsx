"use client";

import type { Lang } from "@/lib/signal-translations";
import { tr } from "@/lib/signal-translations";

interface AnswerOption {
  key: string;
  label: string;
}

interface SignalShareCardProps {
  signalNumber: number;
  question: string;
  memberAnswer: AnswerOption | null;
  topAnswer: AnswerOption;
  totalVotes: number;
  memberPercentage: number;
  lang?: Lang;
}

export function SignalShareCard({
  signalNumber,
  question,
  memberAnswer,
  topAnswer,
  totalVotes,
  memberPercentage,
  lang = "en",
}: SignalShareCardProps) {
  const isMatch = memberAnswer?.key === topAnswer.key;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">{tr("shareYourInsight", lang)}</h3>

      <div className="rounded-xl border bg-card p-6 space-y-4 max-w-sm mx-auto">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-primary">
            Elev8 Signal #{signalNumber}
          </span>
          <span className="text-xs text-muted-foreground">
            {totalVotes} {tr("leaders", lang)}
          </span>
        </div>

        <p className="text-sm font-semibold leading-snug">{question}</p>

        <div className="space-y-2">
          {memberAnswer && (
            <div className="flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2">
              <span className="text-xs text-muted-foreground">{tr("youChose", lang)}</span>
              <span className="text-sm font-semibold text-primary">
                {memberAnswer.key}. {memberAnswer.label}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
            <span className="text-xs text-muted-foreground">
              {tr("groupConsensus", lang)}
            </span>
            <span className="text-sm font-semibold">
              {topAnswer.key}. {topAnswer.label}
            </span>
          </div>
        </div>

        {memberAnswer && (
          <p className="text-xs text-center text-muted-foreground">
            {isMatch
              ? tr("withMajority", lang)
              : `${memberPercentage}% ${tr("choseYourAnswer", lang)}`}
          </p>
        )}

        <div className="border-t pt-3">
          <p className="text-[10px] text-muted-foreground text-center tracking-wider uppercase">
            elev8community.com
          </p>
        </div>
      </div>
    </div>
  );
}
