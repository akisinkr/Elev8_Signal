"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Step = "email" | "code" | "verifying";

export default function SignInPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === "code") {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setSending(false);
        return;
      }

      setOtpToken(data.token);
      setStep("code");
    } catch {
      setError("Network error. Please try again.");
    }
    setSending(false);
  }

  function handleDigitChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = newDigits.join("");
    if (fullCode.length === 6) {
      verifyCode(fullCode);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || "";
    }
    setDigits(newDigits);

    if (pasted.length === 6) {
      verifyCode(pasted);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  }

  async function verifyCode(code: string) {
    setStep("verifying");
    setError("");

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: otpToken, code }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid code");
        setStep("code");
        setDigits(["", "", "", "", "", ""]);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
        return;
      }

      router.push(data.redirectTo);
    } catch {
      setError("Network error. Please try again.");
      setStep("code");
    }
  }

  async function handleResend() {
    setDigits(["", "", "", "", "", ""]);
    setError("");
    setSending(true);

    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpToken(data.token);
        setError("Code resent!");
      }
    } catch { /* silent */ }
    setSending(false);
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center px-6 sm:px-10 py-5 border-b border-border/40">
        <Link href="/" className="text-sm font-semibold tracking-tight text-foreground">
          Elev8 Signal
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-12">
        <div className="w-full max-w-sm space-y-6">

          {/* Header */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px w-8 bg-[#C8A84E]/30" />
              <div className="relative">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#C8A84E]/20" />
                <div className="relative size-2 rounded-full bg-[#C8A84E]" />
              </div>
              <div className="h-px w-8 bg-[#C8A84E]/30" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">
              {step === "email" ? "This week's Signal is live" : "Check your email"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {step === "email"
                ? "Enter your email to vote"
                : `We sent a 6-digit code to ${email}`}
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            {step === "email" ? (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="you@company.com"
                    required
                    autoFocus
                    className={cn(
                      "flex h-11 w-full rounded-xl border bg-background px-4 text-sm",
                      "placeholder:text-muted-foreground/50",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A84E]/40",
                      error ? "border-destructive" : "border-border"
                    )}
                  />
                </div>

                {error && (
                  <p className="text-xs text-destructive">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={sending || !email.trim()}
                  className={cn(
                    "w-full rounded-xl py-3 text-sm font-semibold transition-all",
                    "bg-[#C8A84E] text-[#0A0F1C]",
                    "hover:bg-[#C8A84E]/90 active:scale-[0.98]",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {sending ? "Sending code..." : "Continue"}
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                {/* 6-digit code */}
                <div className="flex justify-center gap-2" onPaste={handlePaste}>
                  {digits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      disabled={step === "verifying"}
                      className={cn(
                        "w-11 h-12 text-center text-lg font-mono rounded-xl border bg-background",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A84E]/40",
                        "transition-colors disabled:opacity-50",
                        digit ? "border-[#C8A84E]/40 text-foreground" : "border-border text-foreground"
                      )}
                    />
                  ))}
                </div>

                {step === "verifying" && (
                  <p className="text-center text-sm text-muted-foreground">Verifying...</p>
                )}

                {error && (
                  <p className={cn(
                    "text-center text-xs",
                    error === "Code resent!" ? "text-[#C8A84E]" : "text-destructive"
                  )}>
                    {error}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <button
                    onClick={() => { setStep("email"); setDigits(["", "", "", "", "", ""]); setError(""); }}
                    className="hover:text-foreground transition-colors"
                  >
                    Change email
                  </button>
                  <button
                    onClick={handleResend}
                    disabled={sending}
                    className="text-[#C8A84E]/70 hover:text-[#C8A84E] transition-colors disabled:opacity-50"
                  >
                    {sending ? "Sending..." : "Resend code"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground/40">Invite-only</p>
        </div>
      </main>
    </div>
  );
}
