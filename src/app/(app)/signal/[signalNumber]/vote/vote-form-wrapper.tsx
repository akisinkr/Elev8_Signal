"use client";

import * as React from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

interface VoteFormWrapperProps {
  signalNumber: number;
  question: string;
  options: { key: string; label: string }[];
  deadline?: string | null;
  signalStatus?: string;
}

type Step = "email" | "vote" | "thanks" | "closed" | "not-member";

export function VoteFormWrapper({
  signalNumber,
  question,
  options,
  deadline,
  signalStatus,
}: VoteFormWrapperProps) {
  const isClosed = signalStatus === "CLOSED" || signalStatus === "PUBLISHED";
  const [step, setStep] = React.useState<Step>(isClosed ? "closed" : "email");
  const [email, setEmail] = React.useState("");
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = React.useState(false);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [why, setWhy] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setEmailError(null);
    setIsCheckingEmail(true);

    try {
      const res = await fetch(`/api/signal/${signalNumber}/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStep("not-member");
        return;
      }

      // Signal is closed or published — can't vote anymore
      if (data.signalStatus === "CLOSED" || data.signalStatus === "PUBLISHED") {
        setStep("closed");
        return;
      }

      if (data.alreadyVoted) {
        setEmailError(
          "You've already shared your perspective. Results coming soon."
        );
        return;
      }

      setStep("vote");
    } catch {
      setEmailError("Something went wrong. Please try again.");
    } finally {
      setIsCheckingEmail(false);
    }
  }

  async function handleSubmit() {
    if (!selected) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/signal/${signalNumber}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer: selected,
          why: why || undefined,
          email: email.trim().toLowerCase(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 409) {
          toast.error("You've already shared your perspective.");
        } else {
          toast.error(data.error || "Failed to submit vote");
        }
        return;
      }

      setStep("thanks");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- CLOSED SIGNAL SCREEN ---
  if (step === "closed") {
    return (
      <div className="flex flex-col min-h-[60vh] justify-center items-center px-4">
        <div
          className="w-full max-w-md mx-auto"
          style={{ animation: "fadeInUp 0.6s ease-out both" }}
        >
          <div className="rounded-2xl border border-border/60 bg-card p-8 text-center shadow-lg space-y-6">
            {/* Lock icon with pulse */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 animate-pulse">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                This Signal has closed
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Stay tuned for the next one — your vote unlocks exclusive peer insights!
              </p>
            </div>

            <Link
              href={`/signal/archive${email ? `?email=${encodeURIComponent(email)}` : ""}`}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 active:scale-[0.98]"
              )}
            >
              View Past Results
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
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
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}} />
      </div>
    );
  }

  // --- NOT A MEMBER SCREEN ---
  if (step === "not-member") {
    return (
      <div className="flex flex-col min-h-[60vh] justify-center items-center px-4">
        <div
          className="w-full max-w-md mx-auto"
          style={{ animation: "fadeInUp 0.6s ease-out both" }}
        >
          <div className="rounded-2xl border border-border/60 bg-card p-8 text-center shadow-lg space-y-6">
            {/* Sparkle icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 animate-pulse">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                This is an invite-only community
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Elev8 Signal is where top leaders share their real perspective. Interested in joining?
              </p>
            </div>

            <a
              href="mailto:andrewkim@elev8here.com?subject=Interested%20in%20Elev8%20Signal"
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 active:scale-[0.98]"
              )}
            >
              Request Access
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
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
            </a>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}} />
      </div>
    );
  }

  // --- THANKS SCREEN ---
  if (step === "thanks") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="relative mb-6">
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <CheckCircle2 className="relative size-16 text-primary" />
        </div>
        <h1
          className="text-2xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom-2 duration-500"
        >
          You&apos;re in.
        </h1>
        <p
          className="mt-3 text-muted-foreground text-sm animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200"
          style={{ animationDelay: "200ms", animationFillMode: "both" }}
        >
          Your perspective has been recorded.
        </p>
        <p
          className="mt-1 text-muted-foreground text-xs animate-in fade-in slide-in-from-bottom-2 duration-500 delay-400"
          style={{ animationDelay: "400ms", animationFillMode: "both" }}
        >
          We&apos;ll share results once voting closes.
        </p>
      </div>
    );
  }

  // --- EMAIL SCREEN ---
  if (step === "email") {
    return (
      <div className="flex flex-col min-h-[80vh] justify-center px-4">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Signal #{signalNumber}
            </p>
            <h1 className="text-xl sm:text-2xl font-bold leading-snug">
              Welcome to Elev8 Signal
            </h1>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold leading-snug text-center">
              {question}
            </h2>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Your email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(null);
                }}
                className={cn(
                  "flex h-12 w-full rounded-xl border bg-background px-4 text-sm",
                  "placeholder:text-muted-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  emailError
                    ? "border-destructive"
                    : "border-border"
                )}
              />
              {emailError && (
                <p className="text-sm text-destructive">{emailError}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isCheckingEmail || !email.trim()}
              className={cn(
                "w-full rounded-xl py-4 text-base font-semibold transition-all",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 active:scale-[0.98]",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isCheckingEmail ? "Checking..." : "Continue"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- VOTE SCREEN ---
  return (
    <div className="flex flex-col min-h-[80vh] justify-center px-4">
      <div className="w-full max-w-lg mx-auto space-y-8">
        {deadline && (
          <p className="text-xs text-muted-foreground text-center">
            Signal #{signalNumber}
          </p>
        )}

        <h1 className="text-xl sm:text-2xl font-bold leading-snug text-center">
          {question}
        </h1>

        <div className="space-y-3">
          {options.map((option) => (
            <button
              key={option.key}
              type="button"
              disabled={isSubmitting}
              onClick={() => setSelected(option.key)}
              className={cn(
                "flex w-full items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all",
                "text-sm sm:text-base font-medium",
                "active:scale-[0.98]",
                selected === option.key
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/50"
              )}
            >
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                  selected === option.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {option.key}
              </span>
              <span className="flex-1">{option.label}</span>
            </button>
          ))}
        </div>

        {selected && (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">
                Why? (optional)
              </label>
              <span className="text-xs text-muted-foreground">
                {why.length}/280
              </span>
            </div>
            <Textarea
              placeholder="Share your reasoning..."
              value={why}
              onChange={(e) => setWhy(e.target.value.slice(0, 280))}
              maxLength={280}
              rows={3}
              className="resize-none"
            />
          </div>
        )}

        {selected && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className={cn(
              "w-full rounded-xl py-4 text-base font-semibold transition-all",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 active:scale-[0.98]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "animate-in fade-in slide-in-from-bottom-2 duration-200"
            )}
          >
            {isSubmitting ? "Submitting..." : "Submit Vote"}
          </button>
        )}
      </div>
    </div>
  );
}
