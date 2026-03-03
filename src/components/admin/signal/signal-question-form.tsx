"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface FormData {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string;
  category: string;
  voteDeadline: string;
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
  });

  function update(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="question">Question</Label>
        <Textarea
          id="question"
          placeholder="What leadership challenge are you facing this quarter?"
          value={form.question}
          onChange={(e) => update("question", e.target.value)}
          rows={3}
          required
        />
      </div>

      <div className="space-y-3">
        <Label>Answer Options</Label>
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
