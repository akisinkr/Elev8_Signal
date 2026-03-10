"use client";

import * as React from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Lightbulb } from "lucide-react";
import type { Lang } from "@/lib/signal-translations";
import { tr } from "@/lib/signal-translations";

interface SignalSuggestQuestionProps {
  email: string;
  lang?: Lang;
}

export function SignalSuggestQuestion({ email, lang = "en" }: SignalSuggestQuestionProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [question, setQuestion] = React.useState("");
  const [context, setContext] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/signal/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          rawQuestion: question.trim(),
          context: context.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || (lang === "kr" ? "제출에 실패했습니다." : "Failed to submit suggestion"));
        return;
      }

      toast.success(lang === "kr" ? "질문을 제안해 주셔서 감사합니다." : "Question submitted! We'll review it soon.");
      setSubmitted(true);
      setQuestion("");
      setContext("");
    } catch {
      toast.error(lang === "kr" ? "문제가 발생했습니다. 다시 시도해 주세요." : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center">
        <Lightbulb className="mx-auto size-6 text-primary" />
        <p className="mt-2 text-sm font-medium">{tr("suggestThanks", lang)}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {tr("suggestThanksBody", lang)}
        </p>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="group w-full rounded-2xl border border-primary/20 bg-primary/[0.06] p-6 text-center transition-all hover:border-primary/40 hover:bg-primary/[0.1] hover:shadow-[0_0_24px_-6px_var(--color-electric)]"
      >
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/15 transition-transform group-hover:scale-110">
          <Lightbulb className="size-6 text-primary" />
        </div>
        <p className="mt-3 text-base font-semibold text-foreground">
          {tr("suggestShapeNext", lang)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {tr("suggestSubtitle", lang)}
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
          {tr("suggestCTA", lang)}
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
        </span>
      </button>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">{tr("suggestTitle", lang)}</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="suggest-question" className="text-xs font-medium">
            {tr("suggestQuestionLabel", lang)}
          </label>
          <textarea
            id="suggest-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={tr("suggestQuestionPlaceholder", lang)}
            maxLength={500}
            rows={3}
            className={cn(
              "flex w-full rounded-lg border bg-background px-3 py-2 text-sm",
              "placeholder:text-muted-foreground resize-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            )}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="suggest-context" className="text-xs font-medium">
            {tr("suggestWhyLabel", lang)}{" "}
            <span className="text-muted-foreground">({tr("suggestWhyOptional", lang)})</span>
          </label>
          <textarea
            id="suggest-context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder={tr("suggestWhyPlaceholder", lang)}
            maxLength={300}
            rows={2}
            className={cn(
              "flex w-full rounded-lg border bg-background px-3 py-2 text-sm",
              "placeholder:text-muted-foreground resize-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            )}
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {tr("suggestCancel", lang)}
          </button>
          <button
            type="submit"
            disabled={!question.trim() || isSubmitting}
            className={cn(
              "flex-1 rounded-lg py-2 text-sm font-semibold transition-all",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 active:scale-[0.98]",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isSubmitting ? tr("suggestSubmitting", lang) : tr("suggestSubmit", lang)}
          </button>
        </div>
      </form>
    </div>
  );
}
