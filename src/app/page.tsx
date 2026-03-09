import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";

// Real member companies — logos only (no text labels)
// invert: true → dark logo on transparent bg, needs CSS invert for dark background
// wide: true → wordmark logos that need extra width to display properly
const MEMBER_COMPANIES = [
  { name: "NVIDIA", logo: "/logos/nvidia.png", wide: true },
  { name: "Google", logo: "/logos/google.png" },
  { name: "Samsung", logo: "/logos/samsung.png", wide: true },
  { name: "Meta", logo: "/logos/meta.png" },
  { name: "Snowflake", logo: "/logos/snowflake.png" },
  { name: "AWS", logo: "/logos/aws.png" },
  { name: "LG", logo: "/logos/lg.png" },
  { name: "Coupang", logo: "/logos/coupang.png" },
  { name: "Hyundai", logo: "/logos/hyundai.png" },
  { name: "Microsoft", logo: "/logos/microsoft.png" },
  { name: "현대카드", logo: "/logos/hyundaicard.png" },
  { name: "Kakao", logo: "/logos/kakaocorp.png" },
  { name: "S-OIL", logo: "/logos/s-oil.png", wide: true, invert: true },
  { name: "Naver", logo: "/logos/naver.png" },
  { name: "Uber", logo: "/logos/uber.png" },
  { name: "LINE", logo: "/logos/line.png" },
  { name: "Notion", logo: "/logos/notion.png", invert: true },
  { name: "CJ Oliveyoung", logo: "/logos/oliveyoung.png" },
  { name: "Karrot", logo: "/logos/daangn.png" },
  { name: "Twelve Labs", logo: "/logos/twelvelabs.png", invert: true },
  { name: "Bucketplace", logo: "/logos/ohou.png" },
];

// How it works — 3-step flow
const STEPS = [
  {
    num: "01",
    title: "Vote",
    desc: "One question a week. One tap. See how peers at your level answered.",
  },
  {
    num: "02",
    title: "Insights",
    desc: "Get a curated report — what leaders across 8 domains are actually thinking.",
  },
  {
    num: "03",
    title: "Connect",
    desc: "Discover who has the expertise you need. Request a 1:1 Superpower Exchange.",
  },
];

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/profile");

  // Double the list for seamless infinite scroll
  const marqueeItems = [...MEMBER_COMPANIES, ...MEMBER_COMPANIES];

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden" style={{ backgroundColor: "#0A0A0A" }}>
      {/* Subtle ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(200,168,78,0.05) 0%, transparent 70%)",
        }}
      />

      {/* Grain texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Animations */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(200,168,78,0.08); }
          50% { box-shadow: 0 0 40px rgba(200,168,78,0.15); }
        }
        .fade-up { animation: fadeUp 0.7s ease-out both; }
        .fade-up-1 { animation-delay: 0.1s; }
        .fade-up-2 { animation-delay: 0.25s; }
        .fade-up-3 { animation-delay: 0.4s; }
        .fade-up-4 { animation-delay: 0.55s; }
      `}</style>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6">
        <span
          className="text-[13px] font-semibold tracking-[0.3em] uppercase"
          style={{ color: "#C8A84E", textShadow: "0 0 20px rgba(200,168,78,0.15)" }}
        >
          ELEV8
        </span>
        <Link
          href="/sign-in"
          className="text-[12px] font-medium tracking-wide transition-colors"
          style={{ color: "#7A7670" }}
        >
          Sign in
        </Link>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pt-4 pb-2">
        <div className="max-w-lg w-full space-y-10">

          {/* Signal Card — the hero */}
          <div className="fade-up fade-up-1">
            <div
              className="mx-auto max-w-md rounded-2xl border px-6 py-5 text-left"
              style={{
                borderColor: "rgba(200,168,78,0.15)",
                backgroundColor: "rgba(200,168,78,0.03)",
                animation: "pulse-glow 4s ease-in-out infinite",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[9px] tracking-[0.25em] uppercase font-medium" style={{ color: "#C8A84E" }}>
                  This week&apos;s Signal
                </p>
                <span className="text-[9px] tracking-wide" style={{ color: "#4A4640" }}>
                  W11 &middot; 2026
                </span>
              </div>
              <p className="text-[15px] sm:text-[16px] leading-relaxed font-medium" style={{ color: "#E8E4DD" }}>
                &ldquo;Be honest: is your AI infrastructure roadmap actually funded, or still a slide deck?&rdquo;
              </p>

              {/* Fake voting options — blurred/locked */}
              <div className="mt-4 space-y-2">
                {[
                  { label: "Fully funded & executing", pct: 72 },
                  { label: "Approved but not staffed", pct: 18 },
                  { label: "Still a slide deck", pct: 10 },
                ].map((opt, i) => (
                  <div key={i} className="relative overflow-hidden rounded-lg px-3 py-2" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
                    {/* Background bar */}
                    <div
                      className="absolute inset-y-0 left-0 rounded-lg"
                      style={{
                        width: `${opt.pct}%`,
                        backgroundColor: i === 0 ? "rgba(200,168,78,0.12)" : "rgba(255,255,255,0.03)",
                        filter: "blur(2px)",
                      }}
                    />
                    <div className="relative flex justify-between items-center">
                      <span className="text-[12px]" style={{ color: "#7A7670", filter: "blur(3px)" }}>
                        {opt.label}
                      </span>
                      <span className="text-[11px] font-medium" style={{ color: "#7A7670", filter: "blur(3px)" }}>
                        {opt.pct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-[10px]" style={{ color: "#5A5650" }}>
                Sign in to vote and see how your peers answered
              </p>
            </div>
          </div>

          {/* Headline + Subline */}
          <div className="text-center space-y-3 fade-up fade-up-2">
            <h1
              className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-[1.15]"
              style={{ color: "#E8E4DD" }}
            >
              One question.<br />
              <span style={{ color: "#C8A84E" }}>Every answer matters.</span>
            </h1>
            <p
              className="text-[14px] sm:text-[15px] leading-relaxed max-w-sm mx-auto"
              style={{ color: "#7A7670" }}
            >
              A weekly pulse on what senior tech leaders are actually thinking — not what they post online.
            </p>
          </div>

          {/* CTA */}
          <div className="text-center fade-up fade-up-3">
            <Link
              href="/sign-in"
              className="group relative inline-flex items-center gap-2.5 rounded-xl px-8 py-3.5 text-[14px] font-semibold tracking-wide transition-all active:scale-[0.98]"
              style={{
                backgroundColor: "#C8A84E",
                color: "#0A0A0A",
                boxShadow: "0 0 30px rgba(200,168,78,0.15), 0 0 60px rgba(200,168,78,0.05)",
              }}
            >
              Vote This Week&apos;s Signal
            </Link>
            <p className="mt-3 text-[11px]" style={{ color: "#4A4640" }}>
              Invite-only &middot; Takes 30 seconds
            </p>
          </div>
        </div>
      </main>

      {/* How It Works — 3 steps */}
      <section className="relative z-10 px-6 py-10 fade-up fade-up-4">
        <div className="max-w-2xl mx-auto">
          {/* Connecting line behind steps */}
          <div className="relative">
            <div className="hidden sm:block absolute top-[14px] left-[10%] right-[10%] h-px" style={{ backgroundColor: "rgba(200,168,78,0.1)" }} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
              {STEPS.map((step) => (
                <div key={step.num} className="text-center">
                  <span className="inline-block text-[10px] font-mono mb-3 px-2 py-0.5 rounded-full" style={{ color: "#C8A84E", backgroundColor: "rgba(200,168,78,0.08)" }}>
                    {step.num}
                  </span>
                  <p className="text-[13px] font-semibold tracking-wide mb-1.5" style={{ color: "#E8E4DD" }}>
                    {step.title}
                  </p>
                  <p className="text-[12px] leading-relaxed max-w-[220px] mx-auto" style={{ color: "#5A5650" }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Logo marquee — scrolling company logos */}
      <div className="relative z-10 py-6">
        <p className="text-[9px] tracking-[0.2em] uppercase text-center mb-4" style={{ color: "#5A5650" }}>
          Tech leaders across 8 domains, from
        </p>
        <div className="relative overflow-hidden">
          {/* Fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-24 z-10" style={{ background: "linear-gradient(to right, #0A0A0A, transparent)" }} />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-10" style={{ background: "linear-gradient(to left, #0A0A0A, transparent)" }} />
          {/* Scrolling track */}
          <div
            className="flex items-center gap-10 sm:gap-14 w-max"
            style={{ animation: "marquee 30s linear infinite" }}
          >
            {marqueeItems.map((c, i) => (
              <div key={`${c.name}-${i}`} className="shrink-0 flex items-center" style={{ height: 36 }}>
                <Image
                  src={c.logo}
                  alt={c.name}
                  width={c.wide ? 80 : 36}
                  height={c.wide ? 18 : 36}
                  className="object-contain"
                  style={{
                    opacity: 0.75,
                    ...(c.invert ? { filter: "invert(1) brightness(0.85)" } : {}),
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center">
        <p className="text-[10px] tracking-[0.15em]" style={{ color: "#3A3630" }}>
          &copy; 2026 Elev8
        </p>
      </footer>
    </div>
  );
}
