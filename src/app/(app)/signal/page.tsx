import { redirect } from "next/navigation";
import { getCurrentSignal } from "@/lib/signal";
import { prisma } from "@/lib/db";

export default async function SignalPage() {
  // Redirect to the current live signal's vote page
  const liveSignal = await getCurrentSignal();

  if (liveSignal) {
    redirect(`/signal/${liveSignal.signalNumber}/vote`);
  }

  // Fallback: redirect to most recent published signal's results
  const recentPublished = await prisma.signalQuestion.findFirst({
    where: { status: "PUBLISHED" },
    orderBy: { signalNumber: "desc" },
  });

  if (recentPublished) {
    redirect(`/signal/${recentPublished.signalNumber}`);
  }

  // Nothing available
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-lg font-semibold">No active Signal</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        There are no Signal questions right now. Check back soon.
      </p>
    </div>
  );
}
