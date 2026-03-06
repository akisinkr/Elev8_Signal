"use client";

import * as React from "react";

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

