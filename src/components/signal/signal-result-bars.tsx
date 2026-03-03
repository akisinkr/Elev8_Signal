import { cn } from "@/lib/utils";

interface DistributionItem {
  answer: string;
  label: string;
  count: number;
  percentage: number;
}

interface SignalResultBarsProps {
  distribution: DistributionItem[];
  totalVotes: number;
  memberAnswer: string | null;
}

export function SignalResultBars({
  distribution,
  totalVotes,
  memberAnswer,
}: SignalResultBarsProps) {
  const maxPercentage = Math.max(...distribution.map((d) => d.percentage));

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
      </p>

      <div className="space-y-2">
        {distribution.map((item) => {
          const isTop = item.percentage === maxPercentage && item.percentage > 0;
          const isPick = item.answer === memberAnswer;

          return (
            <div key={item.answer} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {item.answer}. {item.label}
                  </span>
                  {isPick && (
                    <span className="text-xs text-primary font-medium">
                      Your pick
                    </span>
                  )}
                </div>
                <span className="text-muted-foreground">
                  {item.percentage}% ({item.count})
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    isTop ? "bg-primary" : "bg-primary/40"
                  )}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
