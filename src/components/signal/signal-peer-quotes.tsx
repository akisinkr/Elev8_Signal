"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Lang } from "@/lib/signal-translations";
import { tr } from "@/lib/signal-translations";

interface SignalPeerQuotesProps {
  quotes: string[];
  lang?: Lang;
}

export function SignalPeerQuotes({ quotes, lang = "en" }: SignalPeerQuotesProps) {
  const [current, setCurrent] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  const displayed = quotes.slice(0, 5);

  React.useEffect(() => {
    if (displayed.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % displayed.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [displayed.length, isPaused]);

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

      <div
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <blockquote className="rounded-lg border-l-2 border-primary/40 bg-muted/50 px-4 py-4 text-sm text-foreground min-h-[80px] flex items-center">
          <span className="animate-in fade-in duration-300" key={current}>
            &ldquo;{displayed[current]}&rdquo;
          </span>
        </blockquote>

        {displayed.length > 1 && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
