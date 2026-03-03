import Link from "next/link";
import { Lock, Unlock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SignalStatusBadge } from "./signal-status-badge";

interface SignalCardProps {
  signalNumber: number;
  question: string;
  category: string;
  totalVotes: number;
  topAnswer: string;
  publishedAt: string;
  hasVoted: boolean;
}

export function SignalCard({
  signalNumber,
  question,
  category,
  totalVotes,
  topAnswer,
  publishedAt,
  hasVoted,
}: SignalCardProps) {
  return (
    <Link href={`/signal/${signalNumber}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
            #{signalNumber}
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <p className="line-clamp-2 text-sm font-medium leading-snug">
              {question}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{category}</Badge>
              <span className="text-xs text-muted-foreground">
                {totalVotes} votes
              </span>
              <span className="text-xs text-muted-foreground">
                Top: {topAnswer}
              </span>
            </div>
          </div>

          <div className="shrink-0 pt-1 text-muted-foreground">
            {hasVoted ? (
              <Unlock className="size-4" />
            ) : (
              <Lock className="size-4" />
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
