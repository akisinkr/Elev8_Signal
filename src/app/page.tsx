import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  // If already signed in, go straight to profile
  if (userId) {
    redirect("/profile");
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden" style={{ backgroundColor: "#0A0A0A" }}>
      {/* Subtle ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 40%, rgba(200,168,78,0.04) 0%, transparent 70%)",
        }}
      />

      {/* Grain texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6">
        <span
          className="text-[13px] font-semibold tracking-[0.3em] uppercase"
          style={{ color: "#C8A84E", textShadow: "0 0 20px rgba(200,168,78,0.15)" }}
        >
          ELEV8
        </span>
        <LangToggle />
      </header>

      {/* Hero — centered */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="max-w-xl space-y-6">
          {/* Headline */}
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.15]"
            style={{ color: "#C8A84E" }}
          >
            Every leader has one.
            <br />
            Few can name it.
          </h1>

          {/* Subtext */}
          <p
            className="text-[15px] sm:text-base leading-relaxed max-w-md mx-auto"
            style={{ color: "#E8E4DD" }}
          >
            Your <span style={{ color: "#C8A84E" }}>Superpower</span> is the one thing people
            consistently come to you for.
            <br className="hidden sm:block" />
            Define yours in 90 seconds.
          </p>

          {/* CTA */}
          <div className="pt-4">
            <Link
              href="/sign-in"
              className="group relative inline-flex items-center gap-2.5 rounded-xl px-8 py-3.5 text-[14px] font-semibold tracking-wide transition-all active:scale-[0.98]"
              style={{
                backgroundColor: "#C8A84E",
                color: "#0A0A0A",
                boxShadow: "0 0 30px rgba(200,168,78,0.15), 0 0 60px rgba(200,168,78,0.05)",
              }}
            >
              <span style={{ color: "#0A0A0A" }}>&#10022;</span>
              Build Your Card
            </Link>
          </div>

          {/* Social proof */}
          <div className="pt-8 flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {[
                { bg: "#2A2520", border: "#3A3530" },
                { bg: "#252A28", border: "#353A38" },
                { bg: "#28252A", border: "#38353A" },
                { bg: "#2A2825", border: "#3A3835" },
              ].map((s, i) => (
                <div
                  key={i}
                  className="size-7 rounded-full border-2"
                  style={{ backgroundColor: s.bg, borderColor: "#0A0A0A" }}
                />
              ))}
            </div>
            <span className="text-[11px] tracking-wide" style={{ color: "#7A7670" }}>
              Invite-only leadership community
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center">
        <p className="text-[10px] tracking-[0.15em]" style={{ color: "#7A7670" }}>
          &copy; 2026 Elev8. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

// ── Language toggle (client island) ──
function LangToggle() {
  return (
    <div className="flex items-center gap-0 rounded-full border overflow-hidden" style={{ borderColor: "#1F1F1F" }}>
      <button
        className="px-3 py-1.5 text-[11px] font-medium tracking-wide transition-colors"
        style={{ backgroundColor: "#1A1A1A", color: "#E8E4DD" }}
      >
        EN
      </button>
      <button
        className="px-3 py-1.5 text-[11px] font-medium tracking-wide transition-colors"
        style={{ color: "#7A7670" }}
      >
        KR
      </button>
    </div>
  );
}
