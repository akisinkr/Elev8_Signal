"use client";

import * as React from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface VoteFormWrapperProps {
  signalNumber: number;
  question: string;
  options: { key: string; label: string }[];
  deadline?: string | null;
}

export function VoteFormWrapper({
  signalNumber,
  question,
  options,
  deadline,
}: VoteFormWrapperProps) {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [why, setWhy] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  async function handleSubmit() {
    if (!selected) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/signal/${signalNumber}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: selected, why: why || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to submit vote");
        return;
      }

      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <CheckCircle2 className="size-16 text-primary mb-6" />
        <h1 className="text-2xl font-bold tracking-tight">Thanks!</h1>
        <p className="mt-2 text-muted-foreground text-sm">
          We&apos;ll share results soon.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[80vh] justify-center px-4">
      <div className="w-full max-w-lg mx-auto space-y-8">
        {/* Deadline hint */}
        {deadline && (
          <p className="text-xs text-muted-foreground text-center">
            Signal #{signalNumber}
          </p>
        )}

        {/* Question */}
        <h1 className="text-xl sm:text-2xl font-bold leading-snug text-center">
          {question}
        </h1>

        {/* Options — big tappable buttons */}
        <div className="space-y-3">
          {options.map((option) => (
            <button
              key={option.key}
              type="button"
              disabled={isSubmitting}
              onClick={() => setSelected(option.key)}
              className={cn(
                "flex w-full items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all",
                "text-sm sm:text-base font-medium",
                "active:scale-[0.98]",
                selected === option.key
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/50"
              )}
            >
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                  selected === option.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {option.key}
              </span>
              <span className="flex-1">{option.label}</span>
            </button>
          ))}
        </div>

        {/* Why field — appears after selection */}
        {selected && (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">
                Why? (optional)
              </label>
              <span className="text-xs text-muted-foreground">
                {why.length}/280
              </span>
            </div>
            <Textarea
              placeholder="Share your reasoning..."
              value={why}
              onChange={(e) => setWhy(e.target.value.slice(0, 280))}
              maxLength={280}
              rows={3}
              className="resize-none"
            />
          </div>
        )}

        {/* Submit button */}
        {selected && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className={cn(
              "w-full rounded-xl py-4 text-base font-semibold transition-all",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 active:scale-[0.98]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "animate-in fade-in slide-in-from-bottom-2 duration-200"
            )}
          >
            {isSubmitting ? "Submitting..." : "Submit Vote"}
          </button>
        )}
      </div>
    </div>
  );
}
