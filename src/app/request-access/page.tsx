"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type FormState = "idle" | "submitting" | "submitted" | "error";

export default function RequestAccessPage() {
  const [formState, setFormState] = React.useState<FormState>("idle");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [linkedin, setLinkedin] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [serverError, setServerError] = React.useState<string | null>(null);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "This field is required.";
    if (!email.trim()) {
      newErrors.email = "This field is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!linkedin.trim()) {
      newErrors.linkedin = "This field is required.";
    } else if (
      !/^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?/.test(linkedin.trim())
    ) {
      newErrors.linkedin = "Please enter a valid LinkedIn profile URL.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setFormState("submitting");
    setServerError(null);

    try {
      const res = await fetch("/api/access-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          linkedinUrl: linkedin.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setServerError(data.error || "Something went wrong.");
        setFormState("error");
        return;
      }
      setFormState("submitted");
    } catch {
      setServerError("Something went wrong. Please try again.");
      setFormState("error");
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* Brand header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-px w-8 bg-primary/40" />
          <div className="size-1.5 rounded-full bg-primary" />
          <div className="h-px w-8 bg-primary/40" />
        </div>
        <h1 className="text-2xl font-bold tracking-[0.2em] text-foreground">
          ELEV8
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          The Room Senior Leaders Don&apos;t Leave
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-lg">
          {formState !== "submitted" ? (
            <>
              <div className="mb-6">
                <h2 className="text-xs font-medium uppercase tracking-wider text-primary mb-2">
                  Join the Table
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Elev8 members are hand-selected senior executives who share
                  the expertise that took them decades to build. Every applicant
                  is reviewed and approved by current members.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-muted-foreground"
                  >
                    Your Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jane Rodriguez"
                    className={cn(
                      "flex h-11 w-full rounded-lg border bg-background px-3 text-sm",
                      "placeholder:text-muted-foreground/50",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      errors.name ? "border-destructive" : "border-border"
                    )}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-muted-foreground"
                  >
                    Work Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className={cn(
                      "flex h-11 w-full rounded-lg border bg-background px-3 text-sm",
                      "placeholder:text-muted-foreground/50",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      errors.email ? "border-destructive" : "border-border"
                    )}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="linkedin"
                    className="block text-sm font-medium text-muted-foreground"
                  >
                    LinkedIn
                  </label>
                  <input
                    id="linkedin"
                    type="url"
                    required
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="linkedin.com/in/yourprofile"
                    className={cn(
                      "flex h-11 w-full rounded-lg border bg-background px-3 text-sm",
                      "placeholder:text-muted-foreground/50",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      errors.linkedin ? "border-destructive" : "border-border"
                    )}
                  />
                  {errors.linkedin && (
                    <p className="text-xs text-destructive">
                      {errors.linkedin}
                    </p>
                  )}
                </div>

                {serverError && (
                  <p className="text-sm text-destructive">{serverError}</p>
                )}

                <button
                  type="submit"
                  disabled={formState === "submitting"}
                  className={cn(
                    "w-full rounded-xl py-3 text-sm font-semibold transition-all mt-2",
                    "bg-primary text-primary-foreground",
                    "hover:bg-primary/90 active:scale-[0.98]",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {formState === "submitting"
                    ? "Sending..."
                    : "Request My Invitation"}
                </button>
              </form>

              <p className="text-xs text-muted-foreground text-center mt-5 leading-relaxed">
                All applications are reviewed by current Elev8 members.
                <br />
                Expect to hear back within 48 hours.
              </p>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="relative mx-auto mb-5 flex size-12 items-center justify-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                <CheckCircle2 className="relative size-10 text-primary" />
              </div>

              <h2 className="text-xs font-medium uppercase tracking-wider text-primary mb-3">
                You&apos;re on Our Radar
              </h2>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Thank you,{" "}
                <span className="text-foreground font-medium">{name}</span>.
                Your application is now with our membership committee. We take
                every review seriously — sit tight.
              </p>

              <p className="text-sm text-muted-foreground mt-2">
                We&apos;ll reach out to{" "}
                <span className="text-foreground font-medium">{email}</span>{" "}
                with next steps.
              </p>

              <div className="my-6 h-px bg-border" />

              <p className="text-xs text-muted-foreground mb-3">
                While you wait, get a preview of what members are talking about.
              </p>

              <Link
                href="/signal"
                className={cn(
                  "inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all",
                  "border border-border text-foreground",
                  "hover:bg-muted/50 active:scale-[0.98]"
                )}
              >
                Preview Elev8 Signal
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
