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
    marqueeLabel: "8개 도메인의 시니어 리더들이 활동 중",
    signOff: "감사합니다.",
    envelopeTitle: "AN INVITATION",
    envelopeDesc: "Elev8 파운딩 멤버로\n초대합니다",
    nvidia: {
      date: "2025년 11월",
      title: "NVIDIA x Elev8 Executive Roundtable",
      desc: "시니어 AI 및 엔지니어링 리더들이 AI 인프라, 개발자 지원, 엔지니어링 속도 유지에 대해 논의했습니다.",
    },
    notion: {
      date: "2025년 10월",
      title: "Notion x Elev8 Tech Executive Roundtable",
      desc: "AI 에이전트가 생산성, 의사결정, 조직 설계를 어떻게 변화시키고 있는지 탐구한 비공개 라운드테이블.",
    },
    moreLink: "AngelHack HackSeoul 2025",
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
    marqueeLabel: "Tech leaders across 8 domains, from",
    signOff: "Thank you.",
    envelopeTitle: "AN INVITATION",
    envelopeDesc: "You are invited to join\nElev8 as a Founding Member",
    nvidia: {
      date: "November 2025",
      title: "NVIDIA x Elev8 Executive Roundtable",
      desc: "Senior AI and engineering leaders gathered to discuss AI infrastructure, developer enablement, and sustaining engineering velocity.",
    },
    notion: {
      date: "October 2025",
      title: "Notion x Elev8 Tech Executive Roundtable",
      desc: "A closed-door roundtable exploring how AI agents are reshaping productivity, decision-making, and organizational design.",
    },
    moreLink: "AngelHack HackSeoul 2025",
  },
};

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
      {/* Ambient glow — top */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 15%, rgba(200,168,78,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Secondary glow — bottom */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 30% at 50% 85%, rgba(200,168,78,0.04) 0%, transparent 70%)",
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
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(200,168,78,0.08); }
          50% { box-shadow: 0 0 50px rgba(200,168,78,0.18); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes particle-drift {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          20% { opacity: 0.6; }
          80% { opacity: 0.6; }
          100% { transform: translateY(-80px) translateX(15px); opacity: 0; }
        }
        @keyframes line-reveal {
          from { width: 0; }
          to { width: 60%; }
        }
        /* Envelope opening animation */
        @keyframes flap-open {
          0% { transform: rotateX(0deg); }
          100% { transform: rotateX(180deg); }
        }
        @keyframes letter-rise {
          0% { transform: translateY(0); opacity: 0.5; }
          100% { transform: translateY(-60px); opacity: 1; }
        }
        @keyframes envelope-glow {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(200,168,78,0.1)); }
          50% { filter: drop-shadow(0 0 40px rgba(200,168,78,0.25)); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .fade-up { animation: fadeUp 0.8s ease-out both; }
        .fade-up-1 { animation-delay: 0.15s; }
        .fade-up-2 { animation-delay: 0.35s; }
        .fade-up-3 { animation-delay: 0.55s; }
        .fade-up-4 { animation-delay: 0.75s; }
        .fade-up-5 { animation-delay: 0.95s; }
        .shimmer-text {
          background: linear-gradient(90deg, #C8A84E 0%, #E8D5A0 25%, #C8A84E 50%, #E8D5A0 75%, #C8A84E 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .gold-border-shimmer {
          position: relative;
        }
        .gold-border-shimmer::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 16px;
          padding: 1px;
          background: linear-gradient(135deg, rgba(200,168,78,0.3), rgba(200,168,78,0.05), rgba(200,168,78,0.3), rgba(200,168,78,0.05));
          background-size: 300% 300%;
          animation: shimmer 6s linear infinite;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          pointer-events: none;
        }
        /* Envelope styles */
        .envelope-wrapper {
          perspective: 800px;
          animation: float-gentle 5s ease-in-out infinite;
        }
        .envelope {
          position: relative;
          width: 280px;
          height: 200px;
          margin: 0 auto;
          animation: envelope-glow 4s ease-in-out infinite;
        }
        @media (min-width: 640px) {
          .envelope { width: 320px; height: 220px; }
        }
        .envelope-body {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 65%;
          background: linear-gradient(135deg, #1a1608 0%, #2a2210 50%, #1a1608 100%);
          border-radius: 0 0 12px 12px;
          border: 1px solid rgba(200,168,78,0.2);
          border-top: none;
          z-index: 3;
        }
        .envelope-back {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 65%;
          background: linear-gradient(180deg, #1e1a0e 0%, #151108 100%);
          border-radius: 0 0 12px 12px;
          z-index: 0;
        }
        /* The letter that rises out */
        .envelope-letter {
          position: absolute;
          left: 8%;
          right: 8%;
          bottom: 15%;
          height: 75%;
          background: linear-gradient(180deg, #1a1608 0%, #12100a 100%);
          border: 1px solid rgba(200,168,78,0.15);
          border-radius: 8px 8px 4px 4px;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 16px;
          animation: letter-rise 1.2s ease-out 0.8s both;
        }
        /* Flap (top triangle) */
        .envelope-flap {
          position: absolute;
          top: 35%;
          left: 0;
          width: 100%;
          height: 40%;
          z-index: 4;
          transform-origin: top center;
          animation: flap-open 1s ease-in-out 0.3s both;
        }
        .envelope-flap-inner {
          width: 0;
          height: 0;
          border-left: 140px solid transparent;
          border-right: 140px solid transparent;
          border-top: 80px solid #1e1a0e;
          position: relative;
        }
        @media (min-width: 640px) {
          .envelope-flap-inner {
            border-left: 160px solid transparent;
            border-right: 160px solid transparent;
            border-top: 90px solid #1e1a0e;
          }
        }
        .envelope-flap-inner::after {
          content: '';
          position: absolute;
          top: -80px;
          left: -140px;
          right: -140px;
          bottom: 0;
          border-left: 140px solid transparent;
          border-right: 140px solid transparent;
          border-top: 80px solid rgba(200,168,78,0.08);
        }
        @media (min-width: 640px) {
          .envelope-flap-inner::after {
            top: -90px;
            left: -160px;
            right: -160px;
            border-left: 160px solid transparent;
            border-right: 160px solid transparent;
            border-top: 90px solid rgba(200,168,78,0.08);
          }
        }
        /* Front triangular flaps (decorative V shape) */
        .envelope-front-left {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 0;
          border-bottom: 130px solid #1e1a0e;
          border-right: 140px solid transparent;
          border-radius: 0 0 0 12px;
          z-index: 3;
        }
        .envelope-front-right {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 0;
          height: 0;
          border-bottom: 130px solid #1e1a0e;
          border-left: 140px solid transparent;
          border-radius: 0 0 12px 0;
          z-index: 3;
        }
        @media (min-width: 640px) {
          .envelope-front-left {
            border-bottom-width: 143px;
            border-right-width: 160px;
          }
          .envelope-front-right {
            border-bottom-width: 143px;
            border-left-width: 160px;
          }
        }
        /* Gold wax seal */
        .envelope-seal {
          position: absolute;
          bottom: 42%;
          left: 50%;
          transform: translateX(-50%);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: radial-gradient(circle at 40% 35%, #E8D5A0 0%, #C8A84E 40%, #8A7030 100%);
          border: 2px solid rgba(200,168,78,0.4);
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: #0A0A0A;
          letter-spacing: 0.05em;
          box-shadow: 0 2px 12px rgba(200,168,78,0.3);
        }
        /* Sparkle particles around envelope */
        .sparkle {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: radial-gradient(circle, #E8D5A0, #C8A84E);
        }
      `}</style>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6">
        <span
          className="text-[13px] font-semibold tracking-[0.3em] uppercase shimmer-text"
        >
          ELEV8
        </span>
        <button
          onClick={() => setLang(lang === "kr" ? "en" : "kr")}
          className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium tracking-wide transition-all hover:scale-105"
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
        <div className="max-w-xl w-full space-y-20">

          {/* Hero — Animated Envelope */}
          <section className="text-center space-y-10 fade-up fade-up-1">
            {/* Envelope */}
            <div className="relative pt-16 pb-4">
              {/* Sparkle particles */}
              {[
                { top: "5%", left: "15%", delay: "0s", dur: "2.5s" },
                { top: "10%", right: "18%", delay: "0.8s", dur: "3s" },
                { top: "30%", left: "8%", delay: "1.5s", dur: "2.8s" },
                { top: "25%", right: "10%", delay: "0.3s", dur: "3.2s" },
                { top: "60%", left: "12%", delay: "2s", dur: "2.6s" },
                { top: "55%", right: "14%", delay: "1.2s", dur: "2.9s" },
              ].map((s, i) => (
                <div
                  key={i}
                  className="sparkle absolute"
                  style={{
                    ...s,
                    animation: `sparkle ${s.dur} ease-in-out ${s.delay} infinite`,
                  }}
                />
              ))}

              {/* Floating particles rising from envelope */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={`p-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: 2,
                    height: 2,
                    backgroundColor: "rgba(200,168,78,0.35)",
                    left: `${30 + i * 8}%`,
                    top: "45%",
                    animation: `particle-drift ${3.5 + i * 0.4}s ease-in-out infinite`,
                    animationDelay: `${1.5 + i * 0.5}s`,
                  }}
                />
              ))}

              <div className="envelope-wrapper">
                <div className="envelope">
                  {/* Back of envelope */}
                  <div className="envelope-back" />

                  {/* Letter rising out */}
                  <div className="envelope-letter">
                    <p
                      className="text-[9px] tracking-[0.3em] uppercase font-medium mb-2"
                      style={{ color: "#C8A84E" }}
                    >
                      {t.envelopeTitle}
                    </p>
                    <p
                      className="text-[12px] sm:text-[13px] leading-[1.6] font-medium text-center whitespace-pre-line"
                      style={{ color: "#D0CAC0" }}
                    >
                      {t.envelopeDesc}
                    </p>
                  </div>

                  {/* Front body */}
                  <div className="envelope-body" />

                  {/* Front V flaps */}
                  <div className="envelope-front-left" />
                  <div className="envelope-front-right" />

                  {/* Flap (opens) */}
                  <div className="envelope-flap">
                    <div className="envelope-flap-inner" />
                  </div>

                  {/* Gold wax seal */}
                  <div className="envelope-seal">E8</div>
                </div>
              </div>
            </div>

            {/* Headline with shimmer */}
            <div className="space-y-4">
              <p
                className="text-[10px] tracking-[0.3em] uppercase font-medium"
                style={{ color: "#C8A84E" }}
              >
                {t.badge}
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] shimmer-text">
                {t.headline}
              </h1>
              <p
                className="text-[13px] tracking-widest uppercase"
                style={{ color: "#5A5650" }}
              >
                {t.subline}
              </p>
              {/* Decorative line */}
              <div className="flex justify-center pt-2">
                <div
                  style={{
                    height: 1,
                    background: "linear-gradient(to right, transparent, rgba(200,168,78,0.3), transparent)",
                    animation: "line-reveal 1.5s ease-out 0.5s both",
                  }}
                />
              </div>
            </div>
          </section>

          {/* Personal Message */}
          <section className="space-y-5 fade-up fade-up-2">
            <p
              className="text-[15px] sm:text-[16px] leading-[1.8]"
              style={{ color: "#C0BAB0" }}
            >
              {t.intro}
            </p>
            <p
              className="text-[14px] sm:text-[15px] leading-[1.8]"
              style={{ color: "#8A847A" }}
            >
              {t.body}
            </p>
          </section>

          {/* Section Divider */}
          <div className="flex justify-center">
            <div
              style={{
                width: "40%",
                height: 1,
                background: "linear-gradient(to right, transparent, rgba(200,168,78,0.2), transparent)",
              }}
            />
          </div>

          {/* Events Section Header */}
          <div className="text-center fade-up fade-up-3">
            <p
              className="text-[10px] tracking-[0.3em] uppercase font-medium"
              style={{ color: "#C8A84E" }}
            >
              {t.sectionEvents}
            </p>
          </div>

          {/* NVIDIA — Image + Video combined */}
          <section className="space-y-4 fade-up fade-up-3">
            <div className="gold-border-shimmer rounded-2xl overflow-hidden" style={{ backgroundColor: "rgba(200,168,78,0.02)" }}>
              {/* Image card */}
              <div className="overflow-hidden">
                <Image
                  src="/invite/nvidia-roundtable.png"
                  alt={t.nvidia.title}
                  width={472}
                  height={333}
                  className="w-full h-auto"
                />
              </div>
              {/* Info */}
              <div className="px-5 py-4">
                <p
                  className="text-[10px] tracking-widest uppercase mb-1"
                  style={{ color: "#C8A84E" }}
                >
                  {t.nvidia.date}
                </p>
                <p
                  className="text-[16px] font-semibold mb-2"
                  style={{ color: "#E8E4DD" }}
                >
                  {t.nvidia.title}
                </p>
                <p
                  className="text-[13px] leading-relaxed"
                  style={{ color: "#7A7670" }}
                >
                  {t.nvidia.desc}
                </p>
              </div>
              {/* Video */}
              <div className="px-4 pb-4">
                <div
                  className="overflow-hidden rounded-xl"
                  style={{ aspectRatio: "16/9" }}
                >
                  <iframe
                    src="https://player.vimeo.com/video/1170480959?h=2d60ab04f6"
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Notion — Image + Video combined */}
          <section className="space-y-4 fade-up fade-up-4">
            <div className="gold-border-shimmer rounded-2xl overflow-hidden" style={{ backgroundColor: "rgba(200,168,78,0.02)" }}>
              {/* Image card */}
              <div className="overflow-hidden">
                <Image
                  src="/invite/notion-roundtable.png"
                  alt={t.notion.title}
                  width={472}
                  height={333}
                  className="w-full h-auto"
                />
              </div>
              {/* Info */}
              <div className="px-5 py-4">
                <p
                  className="text-[10px] tracking-widest uppercase mb-1"
                  style={{ color: "#C8A84E" }}
                >
                  {t.notion.date}
                </p>
                <p
                  className="text-[16px] font-semibold mb-2"
                  style={{ color: "#E8E4DD" }}
                >
                  {t.notion.title}
                </p>
                <p
                  className="text-[13px] leading-relaxed"
                  style={{ color: "#7A7670" }}
                >
                  {t.notion.desc}
                </p>
              </div>
              {/* Video */}
              <div className="px-4 pb-4">
                <div
                  className="overflow-hidden rounded-xl"
                  style={{ aspectRatio: "16/9" }}
                >
                  <iframe
                    src="https://player.vimeo.com/video/1170481169?h=0e9f5f82ca"
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* More Link — HackSeoul only */}
          <section className="fade-up fade-up-4">
            <a
              href="https://www.linkedin.com/posts/angelhack_hackseoul-2025-was-unreal-heres-a-quick-activity-7396426943350497280-WtEI/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between rounded-xl border px-5 py-4 transition-all hover:scale-[1.01]"
              style={{
                borderColor: "rgba(200,168,78,0.12)",
                backgroundColor: "rgba(200,168,78,0.03)",
              }}
            >
              <span
                className="text-[13px] font-medium"
                style={{ color: "#B0AAA0" }}
              >
                {t.moreLink}
              </span>
              <span
                className="transition-transform group-hover:translate-x-1"
                style={{ color: "#C8A84E" }}
              >
                &rarr;
              </span>
            </a>
          </section>

          {/* Section Divider */}
          <div className="flex justify-center">
            <div
              style={{
                width: "40%",
                height: 1,
                background: "linear-gradient(to right, transparent, rgba(200,168,78,0.2), transparent)",
              }}
            />
          </div>

          {/* Founding Member CTA — Premium card */}
          <section className="fade-up fade-up-5">
            <div
              className="gold-border-shimmer rounded-2xl px-6 py-10 text-center relative overflow-hidden"
              style={{
                backgroundColor: "rgba(200,168,78,0.03)",
                animation: "pulse-glow 4s ease-in-out infinite",
              }}
            >
              {/* Inner glow effect */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: "radial-gradient(ellipse at center top, rgba(200,168,78,0.06) 0%, transparent 60%)",
                }}
              />

              <div className="relative">
                <p
                  className="text-[10px] tracking-[0.3em] uppercase font-medium mb-4"
                  style={{ color: "#C8A84E" }}
                >
                  {t.founding}
                </p>
                <p
                  className="text-[16px] sm:text-[17px] leading-relaxed max-w-sm mx-auto font-medium"
                  style={{ color: "#E8E4DD" }}
                >
                  {t.foundingBody}
                </p>

                <div className="mt-8">
                  <a
                    href={GOOGLE_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-flex items-center gap-2.5 rounded-xl px-10 py-4 text-[15px] font-semibold tracking-wide transition-all active:scale-[0.98] hover:scale-[1.02]"
                    style={{
                      backgroundColor: "#C8A84E",
                      color: "#0A0A0A",
                      boxShadow:
                        "0 0 30px rgba(200,168,78,0.2), 0 0 60px rgba(200,168,78,0.08), 0 4px 20px rgba(0,0,0,0.3)",
                    }}
                  >
                    {t.cta}
                  </a>
                  <p
                    className="mt-4 text-[11px]"
                    style={{ color: "#5A5650" }}
                  >
                    {t.ctaSub}
                  </p>
                </div>
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
                className="inline-block text-[11px] mt-1 transition-colors hover:underline"
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
