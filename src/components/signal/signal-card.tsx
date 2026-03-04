import Link from "next/link";
import { ArrowUpRight, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SignalCardProps {
  signalNumber: number;
  question: string;
  category: string;
  totalVotes: number;
  topAnswer: string;
  publishedAt: string;
  hasVoted: boolean;
  email?: string;
}

export function SignalCard({
  signalNumber,
  question,
  category,
  totalVotes,
  topAnswer,
  publishedAt,
  hasVoted,
  email,
}: SignalCardProps) {
  const href = email
    ? `/signal/${signalNumber}?email=${encodeURIComponent(email)}`
    : `/signal/${signalNumber}`;

  return (
    <Link href={href} className="group block">
      <Card
        className={cn(
          "relative overflow-hidden border-white/[0.06] bg-navy-light py-0 transition-all duration-300",
          "hover:border-primary/30 hover:shadow-[0_0_24px_-6px_var(--color-electric)]",
          hasVoted && "border-l-2 border-l-primary"
        )}
      >
        <CardContent className="flex flex-col gap-4 p-5">
          {/* Top row: signal number + category */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-medium tracking-widest text-muted-foreground/60 uppercase">
              Signal {signalNumber}
            </span>
            <Badge
              variant="secondary"
              className="bg-white/[0.06] text-[11px] font-normal text-muted-foreground"
            >
              {category}
            </Badge>
          </div>

          {/* Question — the hero of the card */}
          <p className="line-clamp-2 text-[15px] font-medium leading-relaxed tracking-tight text-foreground/95">
            {question}
          </p>

          {/* Top answer as a quiet pull-quote */}
          <div className="rounded-lg bg-white/[0.03] px-3.5 py-2.5">
            <p className="text-[13px] leading-snug text-muted-foreground">
              <span className="mr-1 text-primary/70">Top answer:</span>
              <span className="text-foreground/80">{topAnswer}</span>
            </p>
          </div>

          {/* Footer: vote count + arrow */}
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-1.5 text-muted-foreground/50">
              <Users className="size-3" />
              <span className="text-[11px] font-medium">
                {totalVotes}
              </span>
            </div>
            <ArrowUpRight className="size-3.5 text-muted-foreground/30 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
