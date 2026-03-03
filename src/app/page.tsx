import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { BarChart3, Lock, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold tracking-tight">Elev8 Signal</span>
        </div>
        <div>
          {userId ? (
            <Button asChild>
              <Link href="/signal">Go to Signal</Link>
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Invite-Only Peer Survey
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            One question.
            <br />
            <span className="text-primary">Fifty leaders.</span>
            <br />
            Real signal.
          </h1>
          <p className="mx-auto max-w-lg text-lg text-muted-foreground">
            Biweekly pulse check for Korea&apos;s top tech executives.
            Vote in 10 seconds, unlock what your peers really think.
          </p>
          <div className="flex flex-col items-center gap-3 pt-4 sm:flex-row sm:justify-center">
            {userId ? (
              <Button size="lg" asChild>
                <Link href="/signal">
                  View Current Signal <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link href="/sign-up">
                    Join the Community <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="border-t border-border/40 bg-muted/30 px-6 py-16 md:px-12">
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">10-Second Vote</h3>
            <p className="text-sm text-muted-foreground">
              One question, five options. Tap and done. No surveys, no fatigue.
            </p>
          </div>
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Vote to Unlock</h3>
            <p className="text-sm text-muted-foreground">
              See how peers voted only after you share your own perspective.
            </p>
          </div>
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Peer Insights</h3>
            <p className="text-sm text-muted-foreground">
              Anonymous quotes from fellow execs. Real talk, no politics.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 text-center text-sm text-muted-foreground">
        Elev8 &middot; Invite-only leadership community
      </footer>
    </div>
  );
}
