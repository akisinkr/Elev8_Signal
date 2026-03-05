import Link from "next/link";
import { getCurrentSignal } from "@/lib/signal";
import { prisma } from "@/lib/db";
import { SignalCountdown } from "@/components/signal/signal-countdown";
import { SignalLivePulse } from "@/components/signal/signal-live-pulse";

const CATEGORY_LABELS: Record<string, string> = {
  AI_STRATEGY: "AI Strategy",
  KOREA_TACTICAL: "Korea Tactical",
  LEADERSHIP: "Leadership",
  WILDCARD: "Wildcard",
  SYNTHESIS: "Synthesis",
};

export default async function SignalPage() {
  const liveSignal = await getCurrentSignal();

  // --- LIVE signal ---
  if (liveSignal) {
    // Get vote count for social proof
    const totalVotes = await prisma.signalVote.count({
      where: { questionId: liveSignal.id },
    });

    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] px-2">
        <div
          className="w-full max-w-2xl mx-auto space-y-8 sm:space-y-10"
          style={{ animation: "fadeInUp 0.7s ease-out both" }}
        >
          {/* Brand flourish */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px w-8 bg-primary/30" />
              <div className="size-1.5 rounded-full bg-primary" />
              <div className="h-px w-8 bg-primary/30" />
            </div>
            <p className="text-xs font-semibold tracking-[0.25em] text-muted-foreground/70 uppercase">
              Elev8
            </p>
          </div>

          {/* Signal number + live badge */}
          <div className="flex items-center justify-center gap-3">
            <span className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
              Signal #{liveSignal.signalNumber}
            </span>
            <SignalLivePulse />
          </div>

          {/* Category tag */}
          {liveSignal.category && (
            <div className="flex justify-center">
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-semibold tracking-[0.15em] text-primary uppercase">
                {CATEGORY_LABELS[liveSignal.category] || liveSignal.category}
              </span>
            </div>
          )}

          {/* THE QUESTION -- the hero */}
          <div className="text-center px-2 sm:px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-snug sm:leading-tight tracking-tight text-foreground">
              {liveSignal.question}
            </h1>
          </div>

          {/* Social proof */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-border/50 bg-card/60 px-4 py-2">
              <div className="flex -space-x-1">
                {[...Array(Math.min(totalVotes, 5))].map((_, i) => (
                  <div
                    key={i}
                    className="size-5 rounded-full bg-primary/20 border-2 border-background"
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {totalVotes === 0 ? (
                  "Be the first to weigh in"
                ) : (
                  <>
                    <span className="font-semibold text-foreground">{totalVotes}</span>
                    {" "}{totalVotes === 1 ? "leader has" : "leaders have"} weighed in
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Countdown */}
          {liveSignal.voteDeadline && (
            <SignalCountdown
              deadline={liveSignal.voteDeadline.toISOString()}
            />
          )}

          {/* CTA */}
          <div className="flex flex-col items-center gap-4">
            <Link
              href={`/signal/${liveSignal.signalNumber}/vote`}
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] shadow-lg shadow-primary/20"
            >
              Cast Your Vote
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:translate-x-0.5"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>

            {/* Trust signals */}
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50 tracking-wide">
              <span>Anonymous</span>
              <span className="text-muted-foreground/30">--</span>
              <span>30 seconds</span>
              <span className="text-muted-foreground/30">--</span>
              <span>Members only</span>
            </div>
          </div>

          {/* Archive link */}
          <footer className="text-center pt-2 pb-8">
            <Link
              href="/signal/archive"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              View past signals
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </footer>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(24px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}} />
      </div>
    );
  }

  // --- No LIVE signal: show most recent PUBLISHED ---
  const recentPublished = await prisma.signalQuestion.findFirst({
    where: { status: "PUBLISHED" },
    orderBy: { signalNumber: "desc" },
    include: { votes: true },
  });

  if (recentPublished) {
    const totalVotes = recentPublished.votes.length;

    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] px-2">
        <div
          className="w-full max-w-2xl mx-auto space-y-8 sm:space-y-10"
          style={{ animation: "fadeInUp 0.7s ease-out both" }}
        >
          {/* Brand flourish */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px w-8 bg-primary/30" />
              <div className="size-1.5 rounded-full bg-primary" />
              <div className="h-px w-8 bg-primary/30" />
            </div>
            <p className="text-xs font-semibold tracking-[0.25em] text-muted-foreground/70 uppercase">
              Elev8
            </p>
          </div>

          {/* Signal number + results badge */}
          <div className="flex items-center justify-center gap-3">
            <span className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
              Signal #{recentPublished.signalNumber}
            </span>
            <span className="inline-flex items-center rounded-full border border-border/50 bg-card px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              Results
            </span>
          </div>

          {/* Category tag */}
          {recentPublished.category && (
            <div className="flex justify-center">
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-semibold tracking-[0.15em] text-primary uppercase">
                {CATEGORY_LABELS[recentPublished.category] || recentPublished.category}
              </span>
            </div>
          )}

          {/* THE QUESTION */}
          <div className="text-center px-2 sm:px-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-snug sm:leading-tight tracking-tight text-foreground">
              {recentPublished.question}
            </h1>
          </div>

          {/* Social proof */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-border/50 bg-card/60 px-4 py-2">
              <span className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{totalVotes}</span>
                {" "}{totalVotes === 1 ? "leader" : "leaders"} voted
              </span>
            </div>
          </div>

          {/* Headline insight if available */}
          {recentPublished.headlineInsight && (
            <div className="mx-auto max-w-md text-center">
              <p className="text-sm text-muted-foreground/80 italic leading-relaxed">
                &ldquo;{recentPublished.headlineInsight}&rdquo;
              </p>
            </div>
          )}

          {/* CTA */}
          <div className="flex flex-col items-center gap-4">
            <Link
              href={`/signal/${recentPublished.signalNumber}`}
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-8 py-4 text-base font-semibold text-foreground transition-all hover:bg-muted/50 active:scale-[0.98]"
            >
              See How Leaders Voted
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:translate-x-0.5"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Archive link */}
          <footer className="text-center pt-2 pb-8">
            <Link
              href="/signal/archive"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              View past signals
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </footer>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(24px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}} />
      </div>
    );
  }

  // --- Nothing available ---
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] px-2">
      <div
        className="w-full max-w-md mx-auto text-center space-y-6"
        style={{ animation: "fadeInUp 0.7s ease-out both" }}
      >
        {/* Brand flourish */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-px w-8 bg-primary/30" />
            <div className="size-1.5 rounded-full bg-primary" />
            <div className="h-px w-8 bg-primary/30" />
          </div>
          <p className="text-xs font-semibold tracking-[0.25em] text-muted-foreground/70 uppercase">
            Elev8 Signal
          </p>
        </div>

        {/* Radar animation */}
        <div className="mx-auto flex size-20 items-center justify-center">
          <span className="absolute size-16 animate-ping rounded-full bg-primary/10" />
          <div className="relative size-16 rounded-full border border-border/40 bg-card/50 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary/60"
            >
              <path d="M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10" />
              <path d="M2 12h20" />
            </svg>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Next Signal Incoming
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The next question drops soon. Watch your inbox.
          </p>
        </div>

        <footer className="pt-4">
          <Link
            href="/signal/archive"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            View past signals
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
