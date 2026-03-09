"use client";

import { useState } from "react";

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

export function HowItWorks() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative z-10 text-center">
      {/* Arrow toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex flex-col items-center gap-1 transition-opacity hover:opacity-80"
        style={{ color: "#4A4640" }}
        aria-label={open ? "Hide how it works" : "How it works"}
      >
        <span className="text-[10px] tracking-[0.15em] uppercase">
          {open ? "" : "How it works"}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="transition-transform duration-300"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Collapsible content */}
      <div
        className="overflow-hidden transition-all duration-500 ease-out"
        style={{
          maxHeight: open ? "600px" : "0px",
          opacity: open ? 1 : 0,
        }}
      >
        <div className="px-6 pt-6 pb-2">
          <div className="max-w-2xl mx-auto">
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
        </div>
      </div>
    </div>
  );
}
