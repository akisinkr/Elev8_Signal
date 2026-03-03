"use client";

import { Lock } from "lucide-react";

interface SignalVoteGateProps {
  hasVoted: boolean;
  signalNumber: number;
  status?: string;
  children: React.ReactNode;
}

export function SignalVoteGate({
  hasVoted,
  signalNumber,
  status,
  children,
}: SignalVoteGateProps) {
  if (hasVoted) return <>{children}</>;

  const isClosed = status === "CLOSED" || status === "PUBLISHED";

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 py-16 text-center">
      <Lock className="mb-4 size-10 text-muted-foreground" />
      {isClosed ? (
        <>
          <h3 className="text-lg font-semibold">Voting closed</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Voting for Signal #{signalNumber} has ended. Results are only available to members who voted.
          </p>
        </>
      ) : (
        <>
          <h3 className="text-lg font-semibold">Vote to unlock results</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Submit your vote on Signal #{signalNumber} to see how peers responded.
          </p>
        </>
      )}
    </div>
  );
}
