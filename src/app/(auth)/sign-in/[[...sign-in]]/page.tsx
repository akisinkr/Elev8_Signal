"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

  // Auto-focus first digit input when entering code step
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
    if (!/^\d*$/.test(value)) return; // digits only

    const newDigits = [...digits];
    newDigits[index] = value.slice(-1); // only last char
    setDigits(newDigits);
    setError("");

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
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

      // Success — redirect to vote
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
        setError("New code sent!");
      }
    } catch { /* silent */ }
    setSending(false);
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#0A0A0A" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 35%, rgba(200,168,78,0.04) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6">
        <Link href="/">
          <span
            className="text-[13px] font-semibold tracking-[0.3em] uppercase cursor-pointer"
            style={{ color: "#C8A84E", textShadow: "0 0 20px rgba(200,168,78,0.15)" }}
          >
            ELEV8
          </span>
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-12">
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-lg font-semibold tracking-tight" style={{ color: "#E8E4DD" }}>
            This week&apos;s Signal is live
          </h1>
          <p className="text-[13px]" style={{ color: "#7A7670" }}>
            {step === "email"
              ? "Enter your email to vote"
              : `Enter the code sent to ${email}`}
          </p>
        </div>

        <div className="w-full max-w-sm">
          <div
            className="rounded-xl border p-6"
            style={{
              backgroundColor: "#141414",
              borderColor: "#1F1F1F",
              boxShadow: "0 0 40px rgba(0,0,0,0.5)",
            }}
          >
            {step === "email" ? (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-[12px] font-medium mb-1.5"
                    style={{ color: "#7A7670" }}
                  >
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
                    className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none transition-colors"
                    style={{
                      backgroundColor: "#1A1A1A",
                      border: "1px solid #1F1F1F",
                      color: "#E8E4DD",
                    }}
                  />
                </div>

                {error && (
                  <p className="text-[12px]" style={{ color: "#E57373" }}>{error}</p>
                )}

                <button
                  type="submit"
                  disabled={sending || !email.trim()}
                  className="w-full py-2.5 rounded-lg text-[14px] font-semibold transition-all disabled:opacity-50"
                  style={{
                    backgroundColor: "#C8A84E",
                    color: "#0A0A0A",
                    boxShadow: "0 0 20px rgba(200,168,78,0.15)",
                  }}
                >
                  {sending ? "Sending..." : "Continue"}
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                {/* 6-digit code input */}
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
                      className="w-11 h-13 text-center text-xl font-mono rounded-lg outline-none transition-colors disabled:opacity-50"
                      style={{
                        backgroundColor: "#1A1A1A",
                        border: `1px solid ${digit ? "rgba(200,168,78,0.4)" : "#1F1F1F"}`,
                        color: "#E8E4DD",
                      }}
                    />
                  ))}
                </div>

                {step === "verifying" && (
                  <p className="text-center text-[13px]" style={{ color: "#7A7670" }}>
                    Verifying...
                  </p>
                )}

                {error && (
                  <p className="text-center text-[12px]" style={{ color: error === "New code sent!" ? "#C8A84E" : "#E57373" }}>
                    {error}
                  </p>
                )}

                <div className="flex items-center justify-between text-[12px]">
                  <button
                    onClick={() => { setStep("email"); setDigits(["", "", "", "", "", ""]); setError(""); }}
                    style={{ color: "#7A7670" }}
                    className="hover:underline"
                  >
                    Change email
                  </button>
                  <button
                    onClick={handleResend}
                    disabled={sending}
                    style={{ color: "#C8A84E" }}
                    className="hover:underline disabled:opacity-50"
                  >
                    {sending ? "Sending..." : "Resend code"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-[11px]" style={{ color: "#4A4640" }}>
          Invite-only
        </p>
      </main>
    </div>
  );
}
