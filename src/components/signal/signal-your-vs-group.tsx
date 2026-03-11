import { cn } from "@/lib/utils";
import type { Lang } from "@/lib/signal-translations";
import { tr } from "@/lib/signal-translations";

interface AnswerOption {
  key: string;
  label: string;
}

interface SignalYourVsGroupProps {
  memberAnswer: AnswerOption | null;
  topAnswer: AnswerOption;
  totalVotes: number;
  memberPercentage?: number;
  topPercentage?: number;
  lang?: Lang;
}

const MIN_VOTES_FOR_PERCENTAGES = 10;

export function SignalYourVsGroup({
  memberAnswer,
  topAnswer,
  totalVotes,
  memberPercentage,
  topPercentage,
  lang = "en",
}: SignalYourVsGroupProps) {
  const isMatch = memberAnswer?.key === topAnswer.key;
  const showPercentages = totalVotes >= MIN_VOTES_FOR_PERCENTAGES;

  function getNarrative() {
    if (!memberAnswer) return null;
    if (isMatch) return tr("withMajority", lang);
    if (memberPercentage !== undefined && memberPercentage <= 15) {
      return `${tr("boldPick", lang)} ${memberPercentage}% ${tr("choseThis", lang)}`;
    }
    if (memberPercentage !== undefined && memberPercentage >= 40) {
      return tr("closeCall", lang);
    }
    return tr("differentDirection", lang);
  }

  const narrative = getNarrative();

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {tr("yourPick", lang)}
          </p>
          {memberAnswer ? (
            <>
              <p className="text-2xl font-bold text-primary">
                {memberAnswer.key}
              </p>
              <p className="mt-1 text-sm text-foreground">
                {memberAnswer.label}
              </p>
              {showPercentages && memberPercentage !== undefined && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {memberPercentage}% {tr("ofVotes", lang)}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{tr("noVote", lang)}</p>
          )}
        </div>

        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {tr("groupConsensus", lang)}
          </p>
          <p className="text-2xl font-bold text-primary">{topAnswer.key}</p>
          <p className="mt-1 text-sm text-foreground">{topAnswer.label}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {showPercentages && topPercentage !== undefined ? `${topPercentage}% · ` : ""}
            {totalVotes} {tr("votes", lang)}
          </p>
        </div>
      </div>

      {narrative && (
        <p
          className={cn(
            "rounded-md px-3 py-2 text-center text-sm font-medium",
            isMatch
              ? "bg-primary/10 text-primary"
              : "bg-muted text-foreground"
          )}
        >
          {narrative}
        </p>
      )}
    </div>
  );
}
