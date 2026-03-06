"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function WelcomeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = React.useState<"loading" | "valid" | "invalid">("loading");
  const [data, setData] = React.useState<{ name: string; email: string } | null>(null);

  React.useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }

    fetch(`/api/welcome/verify?token=${encodeURIComponent(token)}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((d) => {
        setData(d);
        setState("valid");
      })
      .catch(() => setState("invalid"));
  }, [token]);

  if (state === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (state === "invalid") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Invalid or Expired Link</h2>
            <p className="text-sm text-muted-foreground mb-6">
              This invitation link is no longer valid. Please contact us if you believe this is an error.
            </p>
            <Link
              href="/request-access"
              className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:bg-primary/90 transition-all"
            >
              Request Access
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const signUpUrl = `/sign-up?email=${encodeURIComponent(data?.email || "")}`;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* Brand */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-px w-8 bg-primary/40" />
          <div className="size-1.5 rounded-full bg-primary" />
          <div className="h-px w-8 bg-primary/40" />
        </div>
        <h1 className="text-2xl font-bold tracking-[0.2em] text-foreground">
          ELEV8
        </h1>
      </div>

      <div className="w-full max-w-md">
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-lg">
          {/* Welcome badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-50" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              APPROVED
            </span>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl font-bold mb-2">
              Welcome to the Table{data?.name ? `, ${data.name.split(" ")[0]}` : ""}.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your application has been reviewed and approved by the Elev8 membership committee.
              You now have access to exclusive peer insights from senior leaders.
            </p>
          </div>

          {/* What you get */}
          <div className="rounded-lg bg-muted/50 p-4 mb-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
              As a member, you can
            </p>
            <div className="space-y-2.5">
              {[
                "Vote on weekly Signal questions alongside senior leaders",
                "See how your perspective compares with peers",
                "Access curated insights and peer commentary",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <div className="mt-1 size-1.5 rounded-full bg-primary shrink-0" />
                  <p className="text-sm text-foreground leading-snug">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Link
            href={signUpUrl}
            className="flex w-full items-center justify-center rounded-xl bg-primary text-primary-foreground py-3.5 text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            Create Your Account
          </Link>

          <p className="text-xs text-muted-foreground text-center mt-4">
            You&apos;ll create a secure account using <span className="text-foreground font-medium">{data?.email}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <WelcomeContent />
    </Suspense>
  );
}
