import { cn } from "@/lib/utils";

interface AnswerOption {
  key: string;
  label: string;
}

interface SignalYourVsGroupProps {
  memberAnswer: AnswerOption | null;
  topAnswer: AnswerOption;
  totalVotes: number;
}

export function SignalYourVsGroup({
  memberAnswer,
  topAnswer,
  totalVotes,
}: SignalYourVsGroupProps) {
  const isMatch = memberAnswer?.key === topAnswer.key;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Your Pick
          </p>
          {memberAnswer ? (
            <>
              <p className="text-2xl font-bold text-primary">
                {memberAnswer.key}
              </p>
              <p className="mt-1 text-sm text-foreground">
                {memberAnswer.label}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No vote</p>
          )}
        </div>

        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Group Consensus
          </p>
          <p className="text-2xl font-bold text-primary">{topAnswer.key}</p>
          <p className="mt-1 text-sm text-foreground">{topAnswer.label}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {totalVotes} votes
          </p>
        </div>
      </div>

      {isMatch && (
        <p
          className={cn(
            "rounded-md bg-primary/10 px-3 py-2 text-center text-sm font-medium text-primary"
          )}
        >
          You&apos;re with the majority
        </p>
      )}
    </div>
  );
}
