"use client";

import * as React from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Lightbulb } from "lucide-react";

interface SignalSuggestQuestionProps {
  email: string;
}

export function SignalSuggestQuestion({ email }: SignalSuggestQuestionProps) {
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
        toast.error(data.error || "Failed to submit suggestion");
        return;
      }

      toast.success("Question submitted! We'll review it soon.");
      setSubmitted(true);
      setQuestion("");
      setContext("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center">
        <Lightbulb className="mx-auto size-6 text-primary" />
        <p className="mt-2 text-sm font-medium">Thanks for your suggestion!</p>
        <p className="mt-1 text-xs text-muted-foreground">
          We&apos;ll review it and may include it in a future Signal.
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
          Shape the next Signal
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Suggest a question that matters to you — your peers will vote on it
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
          Submit a question
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
        </span>
      </button>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">Suggest a Question</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="suggest-question" className="text-xs font-medium">
            Your question
          </label>
          <textarea
            id="suggest-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What would you like to ask other senior leaders?"
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
            Why does this matter?{" "}
            <span className="text-muted-foreground">(optional)</span>
          </label>
          <textarea
            id="suggest-context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Brief context on why this is relevant right now..."
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
            Cancel
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
            {isSubmitting ? "Submitting..." : "Submit Question"}
          </button>
        </div>
      </form>
    </div>
  );
}
