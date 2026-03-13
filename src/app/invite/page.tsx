"use client";

import { useState } from "react";
import Image from "next/image";

const MEMBER_COMPANIES = [
  { name: "NVIDIA", logo: "/logos/nvidia.png" },
  { name: "Google", logo: "/logos/google.png" },
  { name: "Samsung", logo: "/logos/samsung.png" },
  { name: "Meta", logo: "/logos/meta.png" },
  { name: "Snowflake", logo: "/logos/snowflake.png" },
  { name: "AWS", logo: "/logos/aws.png" },
  { name: "LG", logo: "/logos/lg.png" },
  { name: "Coupang", logo: "/logos/coupang.png" },
  { name: "Hyundai", logo: "/logos/hyundai.png" },
  { name: "Microsoft", logo: "/logos/microsoft.png" },
  { name: "현대카드", logo: "/logos/hyundaicard.png" },
  { name: "Kakao", logo: "/logos/kakaocorp.png" },
  { name: "S-OIL", logo: "/logos/s-oil.png" },
  { name: "Naver", logo: "/logos/naver.png" },
  { name: "Uber", logo: "/logos/uber.png" },
  { name: "LINE", logo: "/logos/line.png" },
  { name: "Notion", logo: "/logos/notion.png" },
  { name: "CJ Oliveyoung", logo: "/logos/oliveyoung.png" },
  { name: "Karrot", logo: "/logos/daangn.png" },
  { name: "Twelve Labs", logo: "/logos/twelvelabs.png" },
  { name: "Bucketplace", logo: "/logos/ohou.png" },
];

const content = {
  kr: {
    badge: "파운딩 멤버 초대",
    headline: "리더가 모이는 곳",
    subline: "Where Leaders Connect",
    intro:
      "안녕하세요, Elev8 대표 Andrew Kim입니다. 드디어 Elev8이 공식 런칭을 하게 되어 이렇게 연락드립니다.",
    body: "그동안 실질적으로 멤버에게 도움이 되는 멤버 네트워킹 행사와 프로그램을 테스트했고, 요즘 나름 잘 나가는 핫한 글로벌 기업들과 파트너십도 맺으며 차근차근 준비했습니다.",
    sectionEvents: "지금까지의 여정",
    founding: "파운딩 멤버",
    foundingBody:
      "딱 100명만 모시고 있습니다. 소수의 파운딩 멤버를 초대하여 Elev8을 함께 만들어갈 진정한 동료를 찾고 있습니다.",
    cta: "등록하기",
    ctaSub: "등록은 30초도 안 걸립니다",
    videoSection: "직접 확인해보세요",
    moreLinks: "더 알아보기",
    marqueeLabel: "8개 도메인의 시니어 리더들이 활동 중",
    signOff: "감사합니다.",
    events: {
      newsletter: { date: "2026", title: "Executive Newsletter Issue #1" },
      hackseoul: {
        date: "2025년 11월",
        title: "hackseoul 2025 Leadership Contribution",
      },
      nvidia: {
        date: "2025년 11월",
        title: "NVIDIA x Elev8 Executive Roundtable",
      },
      notion: {
        date: "2025년 10월",
        title: "Notion x Elev8 Tech Executive Roundtable",
      },
      dinners: {
        date: "2025년 4-6월",
        title: "Private Executive Dinners",
      },
      aiData: {
        date: "2025년 4월",
        title: "AI & Data Revolution Night",
      },
    },
  },
  en: {
    badge: "Founding Member Invitation",
    headline: "Where Leaders Connect",
    subline: "리더가 모이는 곳",
    intro:
      "Hi, I'm Andrew Kim, Founder & CEO of Elev8. We've officially launched, and I wanted to personally reach out to you.",
    body: "Over the past year, we've been building and testing real programs for senior tech leaders — executive roundtables, private dinners, and partnerships with top global companies. We're now ready to open the doors.",
    sectionEvents: "Our Journey So Far",
    founding: "Founding Member",
    foundingBody:
      "We're inviting a small group of just 100 founding members to help shape Elev8 as true peers at the table.",
    cta: "Register Now",
    ctaSub: "Takes only 30 seconds",
    videoSection: "See It In Action",
    moreLinks: "Learn More",
    marqueeLabel: "Tech leaders across 8 domains, from",
    signOff: "Thank you.",
    events: {
      newsletter: { date: "2026", title: "Executive Newsletter Issue #1" },
      hackseoul: {
        date: "November 2025",
        title: "hackseoul 2025 Leadership Contribution",
      },
      nvidia: {
        date: "November 2025",
        title: "NVIDIA x Elev8 Executive Roundtable",
      },
      notion: {
        date: "October 2025",
        title: "Notion x Elev8 Tech Executive Roundtable",
      },
      dinners: {
        date: "Apr–Jun 2025",
        title: "Private Executive Dinners",
      },
      aiData: {
        date: "April 2025",
        title: "AI & Data Revolution Night",
      },
    },
  },
};

const EVENT_IMAGES = [
  { key: "nvidia" as const, src: "/invite/nvidia-roundtable.png", w: 472, h: 333 },
  { key: "notion" as const, src: "/invite/notion-roundtable.png", w: 472, h: 333 },
  { key: "hackseoul" as const, src: "/invite/hackseoul.png", w: 472, h: 314 },
  { key: "dinners" as const, src: "/invite/executive-dinners.png", w: 472, h: 333 },
  { key: "aiData" as const, src: "/invite/ai-data-night.png", w: 472, h: 333 },
];

const GOOGLE_FORM_URL = "https://forms.gle/e9RHprk4bXXE5JL6A";

export default function InvitePage() {
  const [lang, setLang] = useState<"kr" | "en">("kr");
  const t = content[lang];
  const marqueeItems = [...MEMBER_COMPANIES, ...MEMBER_COMPANIES];

  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{ backgroundColor: "#0A0A0A" }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(200,168,78,0.05) 0%, transparent 70%)",
        }}
      />

      {/* Grain texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
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
        <button
          onClick={() => setLang(lang === "kr" ? "en" : "kr")}
          className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium tracking-wide transition-colors"
          style={{
            borderColor: "rgba(200,168,78,0.2)",
            color: "#C8A84E",
            backgroundColor: "rgba(200,168,78,0.05)",
          }}
        >
          <span style={{ opacity: lang === "kr" ? 1 : 0.4 }}>KR</span>
          <span style={{ color: "#4A4640" }}>/</span>
          <span style={{ opacity: lang === "en" ? 1 : 0.4 }}>EN</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 flex-col items-center px-6 pt-4 pb-8">
        <div className="max-w-xl w-full space-y-16">

          {/* Hero */}
          <section className="text-center space-y-6 fade-up fade-up-1">
            {/* Invitation hero image */}
            <div className="mx-auto max-w-[280px] sm:max-w-[320px]">
              <Image
                src="/invite/invitation-hero.png"
                alt="Elev8 Invitation"
                width={320}
                height={503}
                className="w-full h-auto rounded-xl"
                priority
              />
            </div>

            <div className="space-y-3 pt-2">
              <p
                className="text-[10px] tracking-[0.25em] uppercase font-medium"
                style={{ color: "#C8A84E" }}
              >
                {t.badge}
              </p>
              <h1
                className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-[1.15]"
                style={{ color: "#E8E4DD" }}
              >
                {t.headline}
              </h1>
              <p
                className="text-[13px] tracking-wide"
                style={{ color: "#5A5650" }}
              >
                {t.subline}
              </p>
            </div>
          </section>

          {/* Personal Message */}
          <section className="space-y-4 fade-up fade-up-2">
            <p
              className="text-[14px] sm:text-[15px] leading-relaxed"
              style={{ color: "#B0AAA0" }}
            >
              {t.intro}
            </p>
            <p
              className="text-[14px] sm:text-[15px] leading-relaxed"
              style={{ color: "#8A847A" }}
            >
              {t.body}
            </p>
          </section>

          {/* Events Section */}
          <section className="space-y-8 fade-up fade-up-3">
            <div className="text-center">
              <p
                className="text-[10px] tracking-[0.25em] uppercase font-medium"
                style={{ color: "#C8A84E" }}
              >
                {t.sectionEvents}
              </p>
            </div>

            <div className="space-y-6">
              {EVENT_IMAGES.map((img) => {
                const ev = t.events[img.key];
                return (
                  <div key={img.key} className="space-y-3">
                    <div
                      className="overflow-hidden rounded-xl border"
                      style={{ borderColor: "rgba(200,168,78,0.08)" }}
                    >
                      <Image
                        src={img.src}
                        alt={ev.title}
                        width={img.w}
                        height={img.h}
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="px-1">
                      <p
                        className="text-[10px] tracking-wide uppercase"
                        style={{ color: "#C8A84E" }}
                      >
                        {ev.date}
                      </p>
                      <p
                        className="text-[14px] font-medium mt-0.5"
                        style={{ color: "#E8E4DD" }}
                      >
                        {ev.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Video Section */}
          <section className="space-y-6">
            <div className="text-center">
              <p
                className="text-[10px] tracking-[0.25em] uppercase font-medium"
                style={{ color: "#C8A84E" }}
              >
                {t.videoSection}
              </p>
            </div>

            <div className="space-y-4">
              {[
                "https://player.vimeo.com/video/1170480959?h=2d60ab04f6",
                "https://player.vimeo.com/video/1170481169?h=0e9f5f82ca",
              ].map((src, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-xl border"
                  style={{
                    borderColor: "rgba(200,168,78,0.08)",
                    aspectRatio: "16/9",
                  }}
                >
                  <iframe
                    src={src}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Social Proof Links */}
          <section className="space-y-4">
            <div className="text-center">
              <p
                className="text-[10px] tracking-[0.25em] uppercase font-medium"
                style={{ color: "#C8A84E" }}
              >
                {t.moreLinks}
              </p>
            </div>
            <div className="space-y-3">
              {[
                {
                  label: "AngelHack HackSeoul 2025",
                  url: "https://www.linkedin.com/posts/angelhack_hackseoul-2025-was-unreal-heres-a-quick-activity-7396426943350497280-WtEI/",
                },
                {
                  label: "AI & Data Revolution Night w/ Coupang",
                  url: "https://www.changbal.org/post/ai-data-revolution-night-w-coupang-%ED%9B%84%EA%B8%B0",
                },
              ].map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border px-4 py-3.5 transition-colors"
                  style={{
                    borderColor: "rgba(200,168,78,0.12)",
                    backgroundColor: "rgba(200,168,78,0.03)",
                  }}
                >
                  <span
                    className="text-[13px] font-medium"
                    style={{ color: "#B0AAA0" }}
                  >
                    {link.label}
                  </span>
                  <span style={{ color: "#C8A84E" }}>&rarr;</span>
                </a>
              ))}
            </div>
          </section>

          {/* Founding Member CTA */}
          <section className="space-y-6 fade-up fade-up-4">
            <div
              className="rounded-2xl border px-6 py-8 text-center"
              style={{
                borderColor: "rgba(200,168,78,0.15)",
                backgroundColor: "rgba(200,168,78,0.03)",
                animation: "pulse-glow 4s ease-in-out infinite",
              }}
            >
              <p
                className="text-[10px] tracking-[0.25em] uppercase font-medium mb-3"
                style={{ color: "#C8A84E" }}
              >
                {t.founding}
              </p>
              <p
                className="text-[15px] sm:text-[16px] leading-relaxed max-w-sm mx-auto"
                style={{ color: "#E8E4DD" }}
              >
                {t.foundingBody}
              </p>

              <div className="mt-6">
                <a
                  href={GOOGLE_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-xl px-8 py-3.5 text-[14px] font-semibold tracking-wide transition-all active:scale-[0.98]"
                  style={{
                    backgroundColor: "#C8A84E",
                    color: "#0A0A0A",
                    boxShadow:
                      "0 0 30px rgba(200,168,78,0.15), 0 0 60px rgba(200,168,78,0.05)",
                  }}
                >
                  {t.cta}
                </a>
                <p
                  className="mt-3 text-[11px]"
                  style={{ color: "#5A5650" }}
                >
                  {t.ctaSub}
                </p>
              </div>
            </div>
          </section>

          {/* Logo Marquee */}
          <section className="py-8">
            <div
              className="mx-auto mb-8"
              style={{
                width: "60%",
                height: 1,
                background:
                  "linear-gradient(to right, transparent, rgba(200,168,78,0.15), transparent)",
              }}
            />
            <p
              className="text-[9px] tracking-[0.2em] uppercase text-center mb-5"
              style={{ color: "#5A5650" }}
            >
              {t.marqueeLabel}
            </p>
            <div
              className="relative overflow-hidden"
              style={{
                maskImage:
                  "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
              }}
            >
              <div
                className="flex items-center gap-8 sm:gap-12 w-max"
                style={{ animation: "marquee 45s linear infinite" }}
              >
                {marqueeItems.map((c, i) => (
                  <div
                    key={`${c.name}-${i}`}
                    className="shrink-0 flex items-center justify-center"
                    style={{ height: 20 }}
                  >
                    <Image
                      src={c.logo}
                      alt={c.name}
                      width={100}
                      height={20}
                      className="object-contain"
                      style={{
                        maxHeight: 20,
                        width: "auto",
                        opacity: 0.35,
                        filter: "brightness(0) invert(1)",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Signature */}
          <section className="space-y-4 text-center pb-4">
            <p
              className="text-[14px] leading-relaxed"
              style={{ color: "#8A847A" }}
            >
              {t.signOff}
            </p>
            <div className="space-y-1">
              <p
                className="text-[15px] font-semibold"
                style={{ color: "#E8E4DD" }}
              >
                Andrew Kim
              </p>
              <p className="text-[12px]" style={{ color: "#7A7670" }}>
                Founder &amp; CEO
              </p>
              <p className="text-[12px]" style={{ color: "#7A7670" }}>
                <strong style={{ color: "#B0AAA0" }}>Elev8</strong>{" "}
                <span style={{ color: "#4A4640" }}>&mdash;</span> Where Leaders
                Connect
              </p>
              <p className="text-[11px] mt-1" style={{ color: "#4A4640" }}>
                Seoul &middot; Singapore &middot; San Francisco &middot; Seattle
              </p>
              <a
                href="https://www.linkedin.com/in/andrewkim"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-[11px] mt-1"
                style={{ color: "#C8A84E" }}
              >
                LinkedIn
              </a>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center">
        <p
          className="text-[10px] tracking-[0.15em]"
          style={{ color: "#3A3630" }}
        >
          &copy; 2026 Elev8
        </p>
      </footer>
    </div>
  );
}
