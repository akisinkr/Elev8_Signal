"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { Lang } from "@/lib/signal-translations";
import { tr } from "@/lib/signal-translations";

interface DistributionItem {
  answer: string;
  label: string;
  count: number;
  percentage: number;
}

interface SignalResultBarsProps {
  distribution: DistributionItem[];
  totalVotes: number;
  memberAnswer: string | null;
  lang?: Lang;
}

const MIN_VOTES_FOR_PERCENTAGES = 10;

export function SignalResultBars({
  distribution,
  totalVotes,
  memberAnswer,
  lang = "en",
}: SignalResultBarsProps) {
  const maxPercentage = Math.max(...distribution.map((d) => d.percentage));
  const showPercentages = totalVotes >= MIN_VOTES_FOR_PERCENTAGES;
  const [animated, setAnimated] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">{tr("detailedBreakdown", lang)}</h3>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
          <span className="relative inline-flex size-2 rounded-full bg-primary" />
        </span>
        {totalVotes} {totalVotes === 1 ? tr("leaderWeighedIn", lang) : tr("leadersWeighedIn", lang)}
      </div>

      {!showPercentages && (
        <p className="text-xs text-muted-foreground italic">
          {lang === "kr"
            ? `응답자가 ${MIN_VOTES_FOR_PERCENTAGES}명 이상이 되면 비율이 표시됩니다.`
            : `Percentages will appear once ${MIN_VOTES_FOR_PERCENTAGES}+ leaders have responded.`}
        </p>
      )}

      <div className="space-y-2">
        {distribution.map((item, index) => {
          const isTop = item.percentage === maxPercentage && item.percentage > 0;
          const isPick = item.answer === memberAnswer;

          return (
            <div
              key={item.answer}
              className="space-y-1"
              style={{
                animationDelay: `${index * 120}ms`,
                animationFillMode: "both",
              }}
            >
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {item.answer}. {item.label}
                  </span>
                  {isPick && (
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      {tr("you", lang)}
                    </span>
                  )}
                </div>
                {showPercentages && (
                  <span
                    className={cn(
                      "text-muted-foreground transition-opacity duration-500",
                      animated ? "opacity-100" : "opacity-0"
                    )}
                    style={{
                      transitionDelay: `${index * 120 + 400}ms`,
                    }}
                  >
                    {item.percentage}% ({item.count})
                  </span>
                )}
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700 ease-out",
                    isTop
                      ? "bg-gradient-to-r from-primary to-primary/70"
                      : "bg-primary/40"
                  )}
                  style={{
                    width: animated ? `${item.percentage}%` : "0%",
                    transitionDelay: `${index * 120}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
