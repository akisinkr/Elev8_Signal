"use client";

import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SignalVoteGateProps {
  hasVoted: boolean;
  signalNumber: number;
  children: React.ReactNode;
}

export function SignalVoteGate({
  hasVoted,
  signalNumber,
  children,
}: SignalVoteGateProps) {
  if (hasVoted) return <>{children}</>;

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 py-16 text-center">
      <Lock className="mb-4 size-10 text-muted-foreground" />
      <h3 className="text-lg font-semibold">Vote to unlock results</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Submit your vote on Signal #{signalNumber} to see how peers responded.
      </p>
      <Button asChild className="mt-6">
        <Link href={`/signal/${signalNumber}/vote`}>Cast Your Vote</Link>
      </Button>
    </div>
  );
}
