"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface VoteOption {
  key: string;
  label: string;
}

interface SignalVoteCardProps {
  question: string;
  options: VoteOption[];
  onVote: (answer: string, why?: string) => void;
  isSubmitting: boolean;
  lang?: "en" | "kr";
}

export function SignalVoteCard({
  question,
  options,
  onVote,
  isSubmitting,
  lang = "en",
}: SignalVoteCardProps) {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [why, setWhy] = React.useState("");

  const whyLabel = lang === "kr" ? "한 줄 의견 (선택사항)" : "Why? (optional)";
  const whyPlaceholder = lang === "kr" ? "이유를 간단히 적어도 좋습니다..." : "Share your reasoning...";
  const submitLabel = lang === "kr" ? "의견 제출하기" : "Submit Vote";
  const submittingLabel = lang === "kr" ? "제출 중..." : "Submitting...";

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold leading-snug">{question}</h2>

      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            disabled={isSubmitting}
            onClick={() => setSelected(option.key)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors",
              selected === option.key
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card hover:bg-muted"
            )}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-bold",
                selected === option.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {option.key}
            </span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-muted-foreground">
              {whyLabel}
            </label>
            <span className="text-xs text-muted-foreground">
              {why.length}/280
            </span>
          </div>
          <Textarea
            placeholder={whyPlaceholder}
            value={why}
            onChange={(e) => setWhy(e.target.value.slice(0, 280))}
            maxLength={280}
            rows={3}
          />
        </div>
      )}

      <Button
        className="w-full"
        size="lg"
        disabled={!selected || isSubmitting}
        onClick={() => selected && onVote(selected, why || undefined)}
      >
        {isSubmitting ? submittingLabel : submitLabel}
      </Button>
    </div>
  );
}
