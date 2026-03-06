"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { SignalHeadline } from "@/components/signal/signal-headline";
import { SignalLanguageToggle } from "@/components/signal/signal-language-toggle";
import type { Lang } from "@/lib/signal-translations";
import { tr } from "@/lib/signal-translations";
import { Newspaper, ChevronLeft, ChevronRight } from "lucide-react";

const COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
];

type DistributionItem = {
  answer: string;
  label: string;
  percentage: number;
};

type Article = {
  title: string;
  url: string;
  source: string;
  lang: "en" | "kr";
};

type PreviewData = {
  signalNumber: number;
  question: string;
  category: string;
  distribution: DistributionItem[];
  topAnswer: string;
  topAnswerLabel: string;
  topPercentage: number;
  quoteCount: number;
  headlineInsight: string | null;
};

export default function SignalPreviewPage() {
  const [data, setData] = React.useState<PreviewData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [lang, setLang] = React.useState<Lang>("en");

  React.useEffect(() => {
    fetch("/api/signal/preview")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const articles = React.useMemo(() => {
    if (!data?.headlineInsight) return [];
    try {
      const parsed = JSON.parse(data.headlineInsight);
      return (parsed.articles || []) as Article[];
    } catch {
      return [];
    }
  }, [data?.headlineInsight]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-lg font-semibold">No Signal available yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Check back soon — the first Signal is coming.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between">
            <span className="text-sm font-semibold tracking-tight">
              Elev8 Signal
            </span>
            <span className="text-xs text-muted-foreground rounded-full border border-border px-2.5 py-0.5">
              Preview
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Language toggle */}
        <div className="flex justify-end">
          <SignalLanguageToggle lang={lang} onLangChange={setLang} />
        </div>

        {/* Signal header */}
        <h1 className="text-lg font-semibold tracking-tight">
          Signal #{data.signalNumber}
        </h1>

        <h2 className="text-xl font-bold leading-snug">{data.question}</h2>

        {/* Headline Insight */}
        <SignalHeadline
          headline={data.headlineInsight}
          signalNumber={data.signalNumber}
          lang={lang}
        />

        {/* Related Articles — non-clickable */}
        <PreviewArticles articles={articles} lang={lang} />

        {/* Your Vote vs Group — blurred */}
        <PreviewYourVsGroup
          topAnswer={data.topAnswer}
          topAnswerLabel={data.topAnswerLabel}
          topPercentage={data.topPercentage}
          lang={lang}
        />

        {/* Donut chart */}
        <PreviewDonutChart distribution={data.distribution} lang={lang} />

        {/* Peer Perspectives — blurred */}
        <PreviewPeerQuotes quoteCount={data.quoteCount} lang={lang} />

        {/* Reminder */}
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your request is being reviewed by our membership committee.
            <br />
            We&apos;ll be in touch within 48 hours.
          </p>
        </div>
      </main>
    </div>
  );
}

/* ─── Related Articles (non-clickable) ─── */

const ARTICLE_SECTION_TITLE = { en: "Related Reading", kr: "관련 기사" };

function PreviewArticles({
  articles,
  lang,
}: {
  articles: Article[];
  lang: Lang;
}) {
  const filtered = articles.filter((a) => a.lang === lang);
  if (filtered.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b px-5 py-3">
        <div className="flex items-center justify-center size-6 rounded-md bg-muted">
          <Newspaper className="size-3.5 text-foreground" />
        </div>
        <span className="text-sm font-semibold">
          {ARTICLE_SECTION_TITLE[lang]}
        </span>
      </div>

      <div className="divide-y">
        {filtered.map((article, i) => (
          <div
            key={i}
            className="flex items-start gap-3 px-5 py-3.5"
          >
            <div className="flex-1 min-w-0 space-y-0.5">
              <p className="text-sm font-medium leading-snug text-foreground">
                {article.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {article.source}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Your Vote vs Group (blurred numbers) ─── */

function PreviewYourVsGroup({
  topAnswer,
  topAnswerLabel,
  topPercentage,
  lang,
}: {
  topAnswer: string;
  topAnswerLabel: string;
  topPercentage: number;
  lang: Lang;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {tr("yourPick", lang)}
          </p>
          <p className="text-2xl font-bold text-primary select-none" style={{ filter: "blur(6px)" }}>
            ?
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "kr" ? "멤버 전용" : "Members only"}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {tr("groupConsensus", lang)}
          </p>
          <p className="text-2xl font-bold text-primary">{topAnswer}</p>
          <p className="mt-1 text-sm text-foreground">{topAnswerLabel}</p>
          <p className="mt-1 text-xs text-muted-foreground select-none" style={{ filter: "blur(5px)" }}>
            {topPercentage}%
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Donut Chart (blurred percentages) ─── */

function PreviewDonutChart({
  distribution,
  lang,
}: {
  distribution: DistributionItem[];
  lang: Lang;
}) {
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

  const segments: {
    offset: number;
    length: number;
    color: string;
  }[] = [];
  let accumulated = 0;

  distribution.forEach((item, i) => {
    if (item.percentage === 0) return;
    const length = (item.percentage / 100) * circumference;
    segments.push({
      offset: accumulated,
      length,
      color: COLORS[i % COLORS.length],
    });
    accumulated += length;
  });

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">{tr("voteDistribution", lang)}</h3>

      <div className="flex flex-col items-center gap-6">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth={strokeWidth}
            />
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
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs font-medium text-primary uppercase tracking-wider">
              Signal
            </span>
          </div>
        </div>

        <div className="w-full space-y-2.5">
          {distribution.map((item, i) => (
            <div key={item.answer} className="flex items-start gap-3 text-sm">
              <span
                className="mt-1 inline-block size-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.answer}.</span>
                  <span
                    className="text-muted-foreground select-none"
                    style={{ filter: "blur(5px)" }}
                  >
                    {item.percentage}%
                  </span>
                </div>
                <p className="text-sm text-foreground/80 leading-snug mt-0.5">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Peer Perspectives (blurred quotes) ─── */

const PLACEHOLDER_QUOTES = {
  en: [
    "The real challenge isn't the technology itself, it's getting the leadership team aligned on what matters most before making any...",
    "We tried this approach last quarter and the results were surprising because our team discovered that the conventional wisdom about...",
    "I've seen three companies handle this differently — the one that succeeded focused on building trust with stakeholders first...",
  ],
  kr: [
    "진짜 문제는 기술 자체가 아니라 리더십 팀이 가장 중요한 것에 합의하는 과정에서 발생하는...",
    "지난 분기에 이 방식을 시도했는데, 기존의 통념과는 다른 결과가 나와서 팀 전체가 놀랐습니다...",
    "세 회사가 각각 다르게 접근했는데, 성공한 곳은 이해관계자와의 신뢰를 먼저 구축하는 데 집중한...",
  ],
};

function PreviewPeerQuotes({
  quoteCount,
  lang,
}: {
  quoteCount: number;
  lang: Lang;
}) {
  const [current, setCurrent] = React.useState(0);

  const quotes = PLACEHOLDER_QUOTES[lang];
  const displayed = quotes.slice(0, Math.min(quoteCount, 3));

  if (displayed.length === 0) return null;

  function prev() {
    setCurrent((c) => (c - 1 + displayed.length) % displayed.length);
  }

  function next() {
    setCurrent((c) => (c + 1) % displayed.length);
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">{tr("peerPerspectives", lang)}</h3>

      <div className="relative">
        <blockquote className="rounded-lg border-l-2 border-primary/40 bg-muted/50 px-4 py-4 text-sm text-foreground min-h-[80px] flex items-center">
          <span
            className="select-none"
            key={`${lang}-${current}`}
            style={{ filter: "blur(5px)" }}
          >
            &ldquo;{displayed[current]}&rdquo;
          </span>
        </blockquote>

        {displayed.length > 1 && (
          <div className="flex items-center justify-between mt-3">
            <button
              type="button"
              onClick={prev}
              className="rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Previous quote"
            >
              <ChevronLeft className="size-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {displayed.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrent(i)}
                  className={cn(
                    "size-1.5 rounded-full transition-all",
                    i === current
                      ? "bg-primary w-3"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                  aria-label={`Go to quote ${i + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={next}
              className="rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Next quote"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
