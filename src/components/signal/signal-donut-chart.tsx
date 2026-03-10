"use client";

import * as React from "react";
import type { Lang } from "@/lib/signal-translations";
import { tr } from "@/lib/signal-translations";

interface DistributionItem {
  answer: string;
  label: string;
  labelKr?: string | null;
  count: number;
  percentage: number;
}

interface SignalDonutChartProps {
  distribution: DistributionItem[];
  totalVotes: number;
  memberAnswer: string | null;
  lang: Lang;
}

const COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
];

export function SignalDonutChart({
  distribution,
  totalVotes,
  memberAnswer,
  lang,
}: SignalDonutChartProps) {
  const [animated, setAnimated] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const radius = 80;
  const strokeWidth = 28;
  const circumference = 2 * Math.PI * radius;
  const center = radius + strokeWidth / 2;
  const size = center * 2;

  // Build segments
  const segments: { offset: number; length: number; color: string; item: DistributionItem }[] = [];
  let accumulated = 0;

  distribution.forEach((item, i) => {
    if (item.count === 0) return;
    const length = (item.percentage / 100) * circumference;
    segments.push({
      offset: accumulated,
      length,
      color: COLORS[i % COLORS.length],
      item,
    });
    accumulated += length;
  });

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">{tr("voteDistribution", lang)}</h3>

      <div className="flex flex-col items-center gap-6">
        {/* Donut */}
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            {/* Background circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth={strokeWidth}
            />
            {/* Segments */}
            {segments.map((seg, i) => (
              <circle
                key={i}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${animated ? seg.length : 0} ${circumference}`}
                strokeDashoffset={-seg.offset}
                strokeLinecap="butt"
                className="transition-all duration-1000 ease-out"
                style={{ transitionDelay: `${i * 150}ms` }}
              />
            ))}
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">{totalVotes}</span>
            <span className="text-xs text-muted-foreground">
              {totalVotes === 1 ? tr("leaderWeighedIn", lang) : tr("leadersWeighedIn", lang)}
            </span>
          </div>
        </div>

        {/* Legend — full width below */}
        <div className="w-full space-y-2.5">
          {distribution.map((item, i) => {
            const isPick = item.answer === memberAnswer;
            return (
              <div key={item.answer} className="flex items-start gap-3 text-sm">
                <span
                  className="mt-1 inline-block size-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.answer}.</span>
                    <span className="text-muted-foreground">{item.percentage}% ({item.count})</span>
                    {isPick && (
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        {tr("you", lang)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/80 leading-snug mt-0.5">
                    {(lang === "kr" && item.labelKr) ? item.labelKr : item.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
