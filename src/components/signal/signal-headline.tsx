interface SignalHeadlineProps {
  headline: string | null;
  signalNumber: number;
}

export function SignalHeadline({
  headline,
  signalNumber,
}: SignalHeadlineProps) {
  if (!headline) return null;

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-primary">
        Signal #{signalNumber} Insight
      </p>
      <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
        {headline}
      </p>
    </div>
  );
}
