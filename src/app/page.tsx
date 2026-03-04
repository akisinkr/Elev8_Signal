import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { BarChart3, ArrowRight } from "lucide-react";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      {/* Subtle radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 45%, oklch(0.55 0.22 265 / 8%) 0%, transparent 70%)",
        }}
      />

      {/* Floating grid lines for depth */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(1 0 0 / 20%) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 20%) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Signal pulse rings */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ top: "5%" }}>
        <div className="relative size-[600px] sm:size-[700px]">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border border-primary/[0.07]"
              style={{
                animation: `signalPulse 4s ease-out ${i * 1}s infinite`,
                transform: "scale(0.2)",
                opacity: 0,
              }}
            />
          ))}
          {/* Static subtle rings for depth */}
          <div className="absolute inset-[15%] rounded-full border border-primary/[0.04]" />
          <div className="absolute inset-[30%] rounded-full border border-primary/[0.06]" />
          <div className="absolute inset-[45%] rounded-full border border-primary/[0.03]" />
        </div>
      </div>

      {/* Content */}
      <main className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Logo */}
        <div className="mb-12 flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15">
            <BarChart3 className="size-5 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Elev8 Signal
          </span>
        </div>

        {/* Tagline */}
        <h1 className="max-w-lg text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          <span className="text-foreground">One question.</span>
          <br />
          <span className="text-primary">Top leaders.</span>
        </h1>

        <p className="mt-4 text-base text-muted-foreground tracking-wide">
          Your perspective shapes the signal.
        </p>

        {/* CTA */}
        <Link
          href="/signal"
          className="group relative mt-10 inline-flex items-center gap-3 rounded-2xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_30px_oklch(0.55_0.22_265_/_25%)] active:scale-[0.98]"
        >
          Send Your Signal
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>

        {/* Subtle social proof */}
        <div className="mt-16 flex items-center gap-3">
          <div className="flex -space-x-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="size-7 rounded-full border-2 border-background"
                style={{
                  background: `oklch(${0.28 + i * 0.04} 0.03 ${255 + i * 8})`,
                }}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground tracking-wide">
            Invite-only leadership community
          </span>
        </div>
      </main>

      {/* Keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes signalPulse {
          0% {
            transform: scale(0.2);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
      `}} />
    </div>
  );
}
