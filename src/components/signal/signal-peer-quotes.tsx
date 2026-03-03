interface SignalPeerQuotesProps {
  quotes: string[];
}

export function SignalPeerQuotes({ quotes }: SignalPeerQuotesProps) {
  if (quotes.length === 0) return null;

  const displayed = quotes.slice(0, 5);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Peer Perspectives</h3>
      <div className="space-y-2">
        {displayed.map((quote, i) => (
          <blockquote
            key={i}
            className="rounded-lg border-l-2 border-primary/40 bg-muted/50 px-4 py-3 text-sm text-foreground"
          >
            &ldquo;{quote}&rdquo;
          </blockquote>
        ))}
      </div>
    </div>
  );
}
