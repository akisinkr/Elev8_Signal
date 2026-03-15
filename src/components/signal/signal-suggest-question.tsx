"use client";

import * as React from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
        toast.error(data.error || (lang === "kr" ? "제출에 실패했습니다." : "Failed to submit"));
        return;
      }

      toast.success(lang === "kr" ? "질문을 제안해 주셔서 감사합니다." : "Question submitted!");
      setSubmitted(true);
      setQuestion("");
      setContext("");
    } catch {
      toast.error(lang === "kr" ? "문제가 발생했습니다." : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <p className="text-center text-[12px] text-white/25">
        {tr("suggestThanks", lang)}
      </p>
    );
  }

  if (!isOpen) {
    return (
      <p className="text-center text-[12px] text-white/25">
        {lang === "kr" ? "다음 Signal의 주제는 멤버가 결정합니다." : "Members shape what gets asked next."}{" "}
        <button
          onClick={() => setIsOpen(true)}
          className="text-[#C8A84E]/50 hover:text-[#C8A84E]/80 transition-colors"
        >
          {lang === "kr" ? "질문 제안하기 →" : "Submit yours →"}
        </button>
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={tr("suggestQuestionPlaceholder", lang)}
          maxLength={500}
          rows={2}
          className="flex w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white/70 placeholder:text-white/20 resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A84E]/20 focus-visible:border-[#C8A84E]/20"
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-xl px-4 py-2 text-[13px] text-white/30 hover:text-white/50 transition-colors"
          >
            {tr("suggestCancel", lang)}
          </button>
          <button
            type="submit"
            disabled={!question.trim() || isSubmitting}
            className={cn(
              "flex-1 rounded-xl py-2.5 text-sm font-medium transition-all",
              "bg-[#C8A84E] text-[#0A0F1C]",
              "hover:bg-[#C8A84E]/90",
              "disabled:opacity-30"
            )}
          >
            {isSubmitting ? tr("suggestSubmitting", lang) : tr("suggestSubmit", lang)}
          </button>
        </div>
      </form>
    </div>
  );
}
