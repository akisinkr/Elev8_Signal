"use client";

import { TrendingUp, Eye, Lightbulb, Target, ArrowRight } from "lucide-react";
import type { Lang } from "@/lib/signal-translations";

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
  lang,
}: SignalHeadlineProps) {
  const parsed = parseInsight(headline);
  if (!parsed) return null;

  const points = lang === "kr" ? parsed.kr : parsed.en;
  const labels = POINT_LABELS[lang];

  return (
    <div className="space-y-0">
      {points.map((point, i) => {
        const Icon = POINT_ICONS[i % POINT_ICONS.length];
        const label = labels[i] ?? "";

        return (
          <div key={i} className="flex gap-3.5 py-4 border-b border-white/[0.04] last:border-b-0">
            <div className="flex-shrink-0 mt-0.5">
              <div className="flex items-center justify-center size-7 rounded-lg bg-[#C8A84E]/10">
                <Icon className="size-3.5 text-[#C8A84E]/60" />
              </div>
            </div>
            <div className="space-y-1 min-w-0">
              {label && (
                <p className="text-[10px] tracking-[0.12em] uppercase text-[#C8A84E]/50">
                  {label}
                </p>
              )}
              <p className="text-[14px] font-light leading-relaxed text-white/70">
                {point}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
