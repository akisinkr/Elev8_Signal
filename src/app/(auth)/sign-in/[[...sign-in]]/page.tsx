"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const urlError = params?.get("error");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong");
        setStatus("error");
        return;
      }

      setStatus("sent");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
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
            Enter your email to receive a login link
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
            {status === "sent" ? (
              <div className="text-center py-4 space-y-3">
                <div
                  className="mx-auto w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(200,168,78,0.1)" }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3 10L8 15L17 5" stroke="#C8A84E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-[15px] font-medium" style={{ color: "#E8E4DD" }}>
                  Check your email
                </p>
                <p className="text-[13px] leading-relaxed" style={{ color: "#7A7670" }}>
                  We sent a login link to<br/>
                  <span style={{ color: "#C8A84E" }}>{email}</span>
                </p>
                <p className="text-[11px] pt-2" style={{ color: "#4A4640" }}>
                  Link expires in 15 minutes
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); }}
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

                {(errorMsg || urlError) && (
                  <p className="text-[12px]" style={{ color: "#E57373" }}>
                    {errorMsg ||
                      (urlError === "expired" ? "Link expired. Please request a new one." :
                       urlError === "not-member" ? "Email not registered as an Elev8 member." :
                       "Something went wrong. Please try again.")}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending" || !email.trim()}
                  className="w-full py-2.5 rounded-lg text-[14px] font-semibold transition-all disabled:opacity-50"
                  style={{
                    backgroundColor: "#C8A84E",
                    color: "#0A0A0A",
                    boxShadow: "0 0 20px rgba(200,168,78,0.15)",
                  }}
                >
                  {status === "sending" ? "Sending..." : "Send login link"}
                </button>
              </form>
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
