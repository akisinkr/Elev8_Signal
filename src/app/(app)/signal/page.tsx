import Link from "next/link";
import { getCurrentSignal } from "@/lib/signal";
import { prisma } from "@/lib/db";
import { SignalCountdown } from "@/components/signal/signal-countdown";
import { Button } from "@/components/ui/button";

export default async function SignalPage() {
  const liveSignal = await getCurrentSignal();

  // --- LIVE signal ---
  if (liveSignal) {
    return (
      <div className="space-y-8">
        <h1 className="text-lg font-semibold tracking-tight">Signal</h1>

        <div className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            Signal #{liveSignal.signalNumber} — Live Now
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold leading-snug tracking-tight">
            {liveSignal.question}
          </h2>
          {liveSignal.voteDeadline && (
            <SignalCountdown
              deadline={liveSignal.voteDeadline.toISOString()}
            />
          )}

          <Button asChild size="lg" className="w-full">
            <Link href={`/signal/${liveSignal.signalNumber}/vote`}>
              Enter Email to Vote
            </Link>
          </Button>
        </div>

        <footer className="text-center pt-4">
          <Link
            href="/signal/archive"
            className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
          >
            View past results
          </Link>
        </footer>
      </div>
    );
  }

  // --- No LIVE signal: show most recent PUBLISHED ---
  const recentPublished = await prisma.signalQuestion.findFirst({
    where: { status: "PUBLISHED" },
    orderBy: { signalNumber: "desc" },
  });

  if (recentPublished) {
    return (
      <div className="space-y-8">
        <h1 className="text-lg font-semibold tracking-tight">Signal</h1>

        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Latest results — Signal #{recentPublished.signalNumber}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold leading-snug tracking-tight">
            {recentPublished.question}
          </h2>

          <Button asChild size="lg" className="w-full" variant="outline">
            <Link href={`/signal/${recentPublished.signalNumber}`}>
              Enter Email to See Results
            </Link>
          </Button>
        </div>

        <footer className="text-center pt-4">
          <Link
            href="/signal/archive"
            className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
          >
            View past results
          </Link>
        </footer>
      </div>
    );
  }

  // --- Nothing available ---
  return (
    <div className="space-y-8">
      <h1 className="text-lg font-semibold tracking-tight">Signal</h1>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-lg font-semibold">No active Signal</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          There are no Signal questions right now. Check back soon.
        </p>
      </div>

      <footer className="text-center pt-4">
        <Link
          href="/signal/archive"
          className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
        >
          View past results
        </Link>
      </footer>
    </div>
  );
}
