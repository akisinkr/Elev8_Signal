"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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

type PreviewData = {
  signalNumber: number;
  question: string;
  category: string;
  distribution: DistributionItem[];
  quoteCount: number;
};

export default function SignalPreviewPage() {
  const [data, setData] = React.useState<PreviewData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

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
        {/* Signal header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-primary uppercase tracking-wider">
              Signal #{data.signalNumber}
            </span>
            <span className="text-xs text-muted-foreground">
              {data.category.replace(/_/g, " ")}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold leading-snug">
            {data.question}
          </h1>
        </div>

        {/* Donut chart */}
        <DonutChart distribution={data.distribution} />

        {/* Blurred quotes */}
        <BlurredQuotes quoteCount={data.quoteCount} />

        {/* CTA */}
        <div
          className="rounded-2xl border border-border/60 bg-card p-8 text-center space-y-4"
          style={{ animation: "fadeInUp 0.6s ease-out both" }}
        >
          <h3 className="text-lg font-semibold">
            Want the full picture?
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            Elev8 members see every insight, quote, and trend — unfiltered.
            Join the conversation that senior leaders don&apos;t have anywhere else.
          </p>
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
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `,
        }}
      />
    </div>
  );
}

function DonutChart({
  distribution,
}: {
  distribution: DistributionItem[];
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
    item: DistributionItem;
  }[] = [];
  let accumulated = 0;

  distribution.forEach((item, i) => {
    if (item.percentage === 0) return;
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
      <h3 className="text-sm font-semibold">Vote Distribution</h3>

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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary mb-1"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="text-xs text-muted-foreground">
              Members only
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
                  <span className="text-muted-foreground select-none" style={{ filter: "blur(5px)" }}>
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

function BlurredQuotes({ quoteCount }: { quoteCount: number }) {
  if (quoteCount === 0) return null;

  const placeholders = [
    "The real challenge isn't the technology itself, it's getting the leadership team aligned on what...",
    "We tried this approach last quarter and the results were surprising because our team found that...",
    "I've seen three companies handle this differently — the one that succeeded focused on building...",
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Peer Perspectives</h3>
        <span className="text-xs text-muted-foreground">
          {quoteCount} {quoteCount === 1 ? "response" : "responses"}
        </span>
      </div>

      <div className="space-y-2">
        {placeholders.map((text, i) => (
          <blockquote
            key={i}
            className="relative overflow-hidden rounded-lg border-l-2 border-primary/40 bg-muted/50 px-4 py-4 text-sm text-foreground"
          >
            <span className="select-none" style={{ filter: "blur(5px)" }}>
              {text}
            </span>
            {i === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-card/60 backdrop-blur-[1px]">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
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
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Members only
                </div>
              </div>
            )}
          </blockquote>
        ))}
      </div>
    </div>
  );
}
