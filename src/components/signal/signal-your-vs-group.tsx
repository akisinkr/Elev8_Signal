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

export function SignalYourVsGroup({
  memberAnswer,
  topAnswer,
  totalVotes,
  memberPercentage,
  topPercentage,
  lang = "en",
}: SignalYourVsGroupProps) {
  const isMatch = memberAnswer?.key === topAnswer.key;

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
    <div className="space-y-4">
      {/* Your answer — single compact line */}
      {memberAnswer && (
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#C8A84E]/15 text-[#C8A84E] text-sm font-medium">
            {memberAnswer.key}
          </span>
          <div className="min-w-0">
            <p className="text-[10px] tracking-[0.12em] uppercase text-white/30">
              {tr("yourPick", lang)}
            </p>
            <p className="text-[14px] font-light text-white/70 leading-snug truncate">
              {memberAnswer.label}
            </p>
          </div>
        </div>
      )}

      {/* Narrative */}
      {narrative && (
        <p
          className={cn(
            "rounded-xl px-4 py-2.5 text-center text-[13px] font-light",
            isMatch
              ? "bg-[#C8A84E]/10 text-[#C8A84E]/80 border border-[#C8A84E]/15"
              : "bg-white/[0.03] text-white/50 border border-white/[0.06]"
          )}
        >
          {narrative}
        </p>
      )}
    </div>
  );
}
