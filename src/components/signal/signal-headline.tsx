"use client";

import { Sparkles, Lock, TrendingUp, Eye, Lightbulb, Target, ArrowRight } from "lucide-react";
import type { Lang } from "@/lib/signal-translations";
import { tr } from "@/lib/signal-translations";

interface ParsedInsight {
  en: string[];
  kr: string[];
}

const POINT_ICONS = [TrendingUp, Eye, Lightbulb, Target, ArrowRight];

const POINT_LABELS = {
  en: ["The Signal", "Contrarian Edge", "Hidden Pattern", "Your Move", "What's Next"],
  kr: ["시그널", "반대 의견", "숨겨진 패턴", "실행 전략", "앞으로의 전망"],
};

function parseInsight(raw: string | null): ParsedInsight | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed.en && parsed.kr) {
      return {
        en: Array.isArray(parsed.en) ? parsed.en : [parsed.en],
        kr: Array.isArray(parsed.kr) ? parsed.kr : [parsed.kr],
      };
    }
  } catch {
    // plain text fallback
  }
  return { en: [raw], kr: [raw] };
}

interface SignalHeadlineProps {
  headline: string | null;
  signalNumber: number;
  lang: Lang;
}

export function SignalHeadline({
  headline,
  signalNumber,
  lang,
}: SignalHeadlineProps) {
  const parsed = parseInsight(headline);
  if (!parsed) return null;

  const points = lang === "kr" ? parsed.kr : parsed.en;
  const labels = POINT_LABELS[lang];

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-6 rounded-md bg-primary/10">
            <Sparkles className="size-3.5 text-primary" />
          </div>
          <span className="text-sm font-semibold">
            {tr("signalInsight", lang)} #{signalNumber}
          </span>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
          <Lock className="size-2.5 text-muted-foreground" />
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            {tr("elev8MembersOnly", lang)}
          </span>
        </div>
      </div>

      {/* Insights */}
      <div className="divide-y">
        {points.map((point, i) => {
          const Icon = POINT_ICONS[i % POINT_ICONS.length];
          const label = labels[i] ?? "";

          return (
            <div key={i} className="flex gap-4 px-5 py-4">
              <div className="flex-shrink-0 mt-0.5">
                <div className="flex items-center justify-center size-8 rounded-lg bg-muted">
                  <Icon className="size-4 text-foreground" />
                </div>
              </div>
              <div className="space-y-1 min-w-0">
                {label && (
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                    {label}
                  </p>
                )}
                <p className="text-sm leading-relaxed text-foreground">
                  {point}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
