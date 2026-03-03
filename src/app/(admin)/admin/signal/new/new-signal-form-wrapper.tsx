"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SignalQuestionForm } from "@/components/admin/signal/signal-question-form";

export function NewSignalFormWrapper() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleSubmit(data: {
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    optionE: string;
    category: string;
    voteDeadline: string;
  }) {
    setIsSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        question: data.question,
        optionA: data.optionA,
        optionB: data.optionB,
        optionC: data.optionC,
        optionD: data.optionD,
        optionE: data.optionE,
        category: data.category,
      };
      if (data.voteDeadline) {
        body.voteDeadline = new Date(data.voteDeadline).toISOString();
      }

      const res = await fetch("/api/admin/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to create signal");
        return;
      }

      const signal = await res.json();
      toast.success("Signal created!");
      router.push(`/admin/signal/${signal.signalNumber}`);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SignalQuestionForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
  );
}
