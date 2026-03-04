"use client";

import { useState, useEffect } from "react";
import { useSignIn, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

type Step = "credentials" | "totp" | "phone_code";

export default function AdminLoginPage() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn, signOut } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<Step>("credentials");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // If already signed in, check admin role and redirect or sign out
  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      fetch("/api/admin/auth/check-role", { method: "POST" })
        .then((res) => res.json())
        .then((data) => {
          if (data.isAdmin) {
            router.push("/admin");
          } else {
            signOut().then(() => setChecking(false));
          }
        })
        .catch(() => {
          signOut().then(() => setChecking(false));
        });
    } else {
      setChecking(false);
    }
  }, [isLoaded, isSignedIn, router, signOut]);

  async function handleAdminCheck() {
    const res = await fetch("/api/admin/auth/check-role", { method: "POST" });
    const data = await res.json();
    if (data.isAdmin) {
      router.push("/admin");
    } else {
      setError("You are not authorized to access the admin panel.");
    }
  }

  async function handleComplete(sessionId: string | null | undefined) {
    if (setActive) {
      await setActive({ session: sessionId ?? null });
    }
    await handleAdminCheck();
  }

  async function handleNeedsSecondFactor() {
    if (!signIn) return;
    // Determine which second factor is available
    const secondFactors = signIn.supportedSecondFactors;
    const hasTotp = secondFactors?.some(
      (f) => f.strategy === "totp"
    );
    const hasPhone = secondFactors?.some(
      (f) => f.strategy === "phone_code"
    );

    if (hasTotp) {
      setStep("totp");
    } else if (hasPhone) {
      await signIn.prepareSecondFactor({ strategy: "phone_code" });
      setStep("phone_code");
    } else {
      // Show what Clerk actually reports for debugging
      setError(
        `No supported 2FA found. Available: ${JSON.stringify(secondFactors)}`
      );
    }
  }

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setError("");
    setLoading(true);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await handleComplete(result.createdSessionId);
      } else if (result.status === "needs_first_factor") {
        const firstFactor = await signIn.attemptFirstFactor({
          strategy: "password",
          password,
        });

        if (firstFactor.status === "complete") {
          await handleComplete(firstFactor.createdSessionId);
        } else if (firstFactor.status === "needs_second_factor") {
          await handleNeedsSecondFactor();
        } else {
          setError("Authentication failed. Please try again.");
        }
      } else if (result.status === "needs_second_factor") {
        await handleNeedsSecondFactor();
      } else {
        setError("Authentication failed. Please try again.");
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      setError(clerkError.errors?.[0]?.message ?? "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setError("");
    setLoading(true);

    try {
      const result = await signIn.attemptSecondFactor({
        strategy: step === "totp" ? "totp" : "phone_code",
        code,
      });

      if (result.status === "complete") {
        await handleComplete(result.createdSessionId);
      } else {
        setError("Verification failed. Please try again.");
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      setError(clerkError.errors?.[0]?.message ?? "Invalid code.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-500">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Elev8 Admin</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {step === "credentials"
              ? "Sign in to continue"
              : step === "totp"
                ? "Enter your authenticator code"
                : "Enter the code sent to your phone"}
          </p>
        </div>

        {step === "credentials" ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-400 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent"
                placeholder="admin@elev8.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-400 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading || !isLoaded}
              className="w-full py-2 px-4 bg-white text-zinc-950 font-medium rounded-md hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-zinc-400 mb-1"
              >
                {step === "totp" ? "Authenticator Code" : "Verification Code"}
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent text-center text-lg tracking-widest"
                placeholder="000000"
                maxLength={6}
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading || !isLoaded}
              className="w-full py-2 px-4 bg-white text-zinc-950 font-medium rounded-md hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("credentials");
                setCode("");
                setError("");
              }}
              className="w-full py-2 px-4 text-zinc-500 text-sm hover:text-zinc-300 transition-colors"
            >
              Back to sign in
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
