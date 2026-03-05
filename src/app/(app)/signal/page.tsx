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

        <div className="space-y-6">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            Signal #{liveSignal.signalNumber} — Live Now
          </p>
          <div className="rounded-xl border border-border bg-card/50 px-5 py-6 sm:px-7 sm:py-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight">
              {liveSignal.question}
            </h2>
          </div>
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

        <div className="space-y-6">
          <p className="text-xs text-muted-foreground">
            Latest results — Signal #{recentPublished.signalNumber}
          </p>
          <div className="rounded-xl border border-border bg-card/50 px-5 py-6 sm:px-7 sm:py-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight">
              {recentPublished.question}
            </h2>
          </div>

          <Button asChild size="lg" className="w-full" variant="outline">
            <Link href={`/signal/${recentPublished.signalNumber}`}>
              Enter Email to See Results
            </Link>
          </Button>
        </div>
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
    </div>
  );
}
