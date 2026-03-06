"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface FormData {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string;
  category: string;
  voteDeadline: string;
  questionKr: string;
  optionAKr: string;
  optionBKr: string;
  optionCKr: string;
  optionDKr: string;
  optionEKr: string;
}

interface SignalQuestionFormProps {
  initialData?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  isSubmitting: boolean;
  submitLabel?: string;
}

const CATEGORIES = [
  { value: "AI_STRATEGY", label: "AI & Strategy" },
  { value: "KOREA_TACTICAL", label: "Korea Tactical" },
  { value: "LEADERSHIP", label: "Leadership" },
  { value: "WILDCARD", label: "Wildcard" },
  { value: "SYNTHESIS", label: "Synthesis" },
];

const OPTION_KEYS = ["A", "B", "C", "D", "E"] as const;

export function SignalQuestionForm({
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel = "Save Signal",
}: SignalQuestionFormProps) {
  const [form, setForm] = React.useState<FormData>({
    question: initialData?.question ?? "",
    optionA: initialData?.optionA ?? "",
    optionB: initialData?.optionB ?? "",
    optionC: initialData?.optionC ?? "",
    optionD: initialData?.optionD ?? "",
    optionE: initialData?.optionE ?? "",
    category: initialData?.category ?? "WILDCARD",
    voteDeadline: initialData?.voteDeadline ?? "",
    questionKr: initialData?.questionKr ?? "",
    optionAKr: initialData?.optionAKr ?? "",
    optionBKr: initialData?.optionBKr ?? "",
    optionCKr: initialData?.optionCKr ?? "",
    optionDKr: initialData?.optionDKr ?? "",
    optionEKr: initialData?.optionEKr ?? "",
  });
  const [isTranslating, setIsTranslating] = React.useState(false);

  function update(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  async function handleTranslate() {
    if (!form.question || !form.optionA || !form.optionB || !form.optionC || !form.optionD || !form.optionE) {
      toast.error("Fill in the English question and all options first.");
      return;
    }

    setIsTranslating(true);
    try {
      const res = await fetch("/api/admin/signal/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: form.question,
          optionA: form.optionA,
          optionB: form.optionB,
          optionC: form.optionC,
          optionD: form.optionD,
          optionE: form.optionE,
        }),
      });

      if (!res.ok) {
        toast.error("Translation failed. Please try again.");
        return;
      }

      const data = await res.json();
      setForm((prev) => ({
        ...prev,
        questionKr: data.questionKr,
        optionAKr: data.optionAKr,
        optionBKr: data.optionBKr,
        optionCKr: data.optionCKr,
        optionDKr: data.optionDKr,
        optionEKr: data.optionEKr,
      }));
      toast.success("Korean translation generated!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* English Question */}
      <div className="space-y-2">
        <Label htmlFor="question">Question (English)</Label>
        <Textarea
          id="question"
          placeholder="What leadership challenge are you facing this quarter?"
          value={form.question}
          onChange={(e) => update("question", e.target.value)}
          rows={3}
          required
        />
      </div>

      {/* English Options */}
      <div className="space-y-3">
        <Label>Answer Options (English)</Label>
        {OPTION_KEYS.map((key) => {
          const field = `option${key}` as keyof FormData;
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
                {key}
              </span>
              <Input
                placeholder={`Option ${key}`}
                value={form[field]}
                onChange={(e) => update(field, e.target.value)}
                required
              />
            </div>
          );
        })}
      </div>

      {/* Generate Korean Translation Button */}
      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold">Korean Translation</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              AI-generated — review and edit before saving
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTranslate}
            disabled={isTranslating}
          >
            {isTranslating ? "Translating..." : form.questionKr ? "Re-translate" : "Generate Korean"}
          </Button>
        </div>

        {/* Korean Question */}
        <div className="space-y-2 mb-4">
          <Label htmlFor="questionKr">Question (Korean)</Label>
          <Textarea
            id="questionKr"
            placeholder="AI가 한국어 번역을 생성합니다..."
            value={form.questionKr}
            onChange={(e) => update("questionKr", e.target.value)}
            rows={3}
          />
        </div>

        {/* Korean Options */}
        <div className="space-y-3">
          <Label>Answer Options (Korean)</Label>
          {OPTION_KEYS.map((key) => {
            const field = `option${key}Kr` as keyof FormData;
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
                  {key}
                </span>
                <Input
                  placeholder={`선택지 ${key}`}
                  value={form[field]}
                  onChange={(e) => update(field, e.target.value)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Category & Deadline */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="deadline">Vote Deadline</Label>
          <Input
            id="deadline"
            type="date"
            value={form.voteDeadline}
            onChange={(e) => update("voteDeadline", e.target.value)}
          />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
