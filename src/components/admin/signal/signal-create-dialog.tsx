"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SignalQuestionForm } from "@/components/admin/signal/signal-question-form";

export function SignalCreateDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
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
        questionKr: data.questionKr || undefined,
        optionAKr: data.optionAKr || undefined,
        optionBKr: data.optionBKr || undefined,
        optionCKr: data.optionCKr || undefined,
        optionDKr: data.optionDKr || undefined,
        optionEKr: data.optionEKr || undefined,
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

      toast.success("Signal created!");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          New Signal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Signal</DialogTitle>
          <DialogDescription>
            Create a new signal question. It will be saved as a draft.
          </DialogDescription>
        </DialogHeader>
        <SignalQuestionForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Create Signal"
        />
      </DialogContent>
    </Dialog>
  );
}
