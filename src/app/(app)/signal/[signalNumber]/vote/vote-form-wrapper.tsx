"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SignalVoteCard } from "@/components/signal/signal-vote-card";

interface VoteFormWrapperProps {
  signalNumber: number;
  question: string;
  options: { key: string; label: string }[];
}

export function VoteFormWrapper({
  signalNumber,
  question,
  options,
}: VoteFormWrapperProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleVote(answer: string, why?: string) {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/signal/${signalNumber}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer, why }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to submit vote");
        return;
      }

      toast.success("Vote submitted!");
      router.push(`/signal/${signalNumber}`);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SignalVoteCard
      question={question}
      options={options}
      onVote={handleVote}
      isSubmitting={isSubmitting}
    />
  );
}
