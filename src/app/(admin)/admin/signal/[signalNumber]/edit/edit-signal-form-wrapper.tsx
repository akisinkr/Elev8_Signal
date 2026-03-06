"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SignalQuestionForm } from "@/components/admin/signal/signal-question-form";

interface EditSignalFormWrapperProps {
  signalNumber: number;
  initialData: {
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
  };
}

export function EditSignalFormWrapper({
  signalNumber,
  initialData,
}: EditSignalFormWrapperProps) {
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
    questionKr: string;
    optionAKr: string;
    optionBKr: string;
    optionCKr: string;
    optionDKr: string;
    optionEKr: string;
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
        questionKr: data.questionKr || null,
        optionAKr: data.optionAKr || null,
        optionBKr: data.optionBKr || null,
        optionCKr: data.optionCKr || null,
        optionDKr: data.optionDKr || null,
        optionEKr: data.optionEKr || null,
      };
      if (data.voteDeadline) {
        body.voteDeadline = new Date(data.voteDeadline).toISOString();
      }

      const res = await fetch(`/api/admin/signal/${signalNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to update signal");
        return;
      }

      toast.success("Signal updated!");
      router.push(`/admin/signal/${signalNumber}`);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SignalQuestionForm
      initialData={initialData}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Update Signal"
    />
  );
}
