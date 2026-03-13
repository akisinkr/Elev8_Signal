"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

/* ── Elev8 Gold ── */
const GOLD = {
  primary: "#C8A84E",
  light: "#E8D48B",
  dark: "#8B7332",
  glow: "#C8A84E",
};

/* ── Starfield ── */
function StarField() {
  const [stars, setStars] = useState<
    { x: number; y: number; size: number; delay: number }[]
  >([]);

  useEffect(() => {
    setStars(
      Array.from({ length: 50 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 3,
      }))
    );
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {stars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{ opacity: [0.05, 0.4, 0.05] }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: star.delay,
          }}
        />
      ))}
    </div>
  );
}

/* ── Floating Gold Particles ── */
function GoldParticles() {
  const [particles, setParticles] = useState<
    { x: number; y: number; size: number; delay: number; duration: number }[]
  >([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, () => ({
        x: 40 + Math.random() * 20,
        y: 30 + Math.random() * 30,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 4,
        duration: 4 + Math.random() * 3,
      }))
    );
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: GOLD.primary,
            boxShadow: `0 0 ${p.size * 3}px ${GOLD.primary}60`,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ── Elev8 Logo SVG ── */
function Elev8Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Infinity/8 shape */}
      <path
        d="M60 45c-8-12-20-18-30-12s-12 20 0 30 22 12 30 6c8 6 20 4 30-6s10-24 0-30-22 0-30 12z"
        stroke="url(#goldGrad)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* E shape */}
      <path
        d="M44 50h16M44 60h12M44 70h16"
        stroke="url(#goldGrad)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Vertical bar of E */}
      <path
        d="M44 50v20"
        stroke="url(#goldGrad)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* 8 numeral */}
      <circle cx="78" cy="54" r="7" stroke="url(#goldGrad)" strokeWidth="2.5" fill="none" />
      <circle cx="78" cy="68" r="8" stroke="url(#goldGrad)" strokeWidth="2.5" fill="none" />
      <defs>
        <linearGradient id="goldGrad" x1="30" y1="30" x2="100" y2="90">
          <stop offset="0%" stopColor={GOLD.light} />
          <stop offset="50%" stopColor={GOLD.primary} />
          <stop offset="100%" stopColor={GOLD.dark} />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function VaultPage() {
  const [logoLanded, setLogoLanded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if already authenticated
    fetch("/api/vault/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: "" }) })
      .catch(() => {});

    const timer = setTimeout(() => setLogoLanded(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  // Check cookie on mount — redirect if already authenticated
  useEffect(() => {
    if (document.cookie.includes("elev8-vault-auth")) {
      router.push("/vault/docs");
    }
  }, [router]);

  function handleEnterClick() {
    setShowPassword(true);
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/vault/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/vault/docs");
    } else {
      setError("Invalid password");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-end overflow-hidden"
      style={{ background: "oklch(0.10 0.02 260)" }}>
      <StarField />
      <GoldParticles />

      {/* Logo rising from bottom — slow & dramatic */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 z-10"
        initial={{ bottom: "-200px" }}
        animate={{ bottom: "calc(50% + 80px)" }}
        transition={{ duration: 3.2, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Gold exhaust trail */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 top-full w-[3px]"
          style={{
            background: `linear-gradient(to bottom, ${GOLD.primary}80, ${GOLD.light}40, transparent)`,
          }}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: [0, 300, 600, 200], opacity: [0, 0.8, 0.6, 0] }}
          transition={{ duration: 3.2, ease: "easeOut" }}
        />

        {/* Wider exhaust glow */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 top-full w-8 blur-md"
          style={{
            background: `linear-gradient(to bottom, ${GOLD.primary}40, ${GOLD.light}20, transparent)`,
          }}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: [0, 200, 400, 100], opacity: [0, 0.5, 0.3, 0] }}
          transition={{ duration: 3.2, ease: "easeOut" }}
        />

        {/* Gold particle sparks */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-full rounded-full"
            style={{
              left: `calc(50% + ${(i % 2 === 0 ? 1 : -1) * (8 + i * 4)}px)`,
              width: 3,
              height: 3,
              background: i % 2 === 0 ? GOLD.light : GOLD.primary,
            }}
            initial={{ y: 0, opacity: 0 }}
            animate={{
              y: [0, 80 + i * 30, 200 + i * 20],
              opacity: [0, 0.8, 0],
              x: [(i % 2 === 0 ? 1 : -1) * 5, (i % 2 === 0 ? 1 : -1) * 25],
            }}
            transition={{
              duration: 1.5,
              delay: 0.8 + i * 0.25,
              repeat: 2,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Orbital ring 1 — rotating gold ring */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1, rotate: 360 }}
          transition={{
            opacity: { delay: 1.5, duration: 1 },
            scale: { delay: 1.5, duration: 1 },
            rotate: { delay: 1.5, duration: 20, repeat: Infinity, ease: "linear" },
          }}
        >
          <div
            className="w-48 h-48 rounded-full"
            style={{ border: `1px solid ${GOLD.primary}30` }}
          />
        </motion.div>

        {/* Orbital ring 2 — counter-rotating */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1, rotate: -360 }}
          transition={{
            opacity: { delay: 2, duration: 1 },
            scale: { delay: 2, duration: 1 },
            rotate: { delay: 2, duration: 30, repeat: Infinity, ease: "linear" },
          }}
        >
          <div
            className="w-64 h-64 rounded-full border-dashed"
            style={{ border: `1px dashed ${GOLD.primary}18` }}
          />
        </motion.div>

        {/* Orbital ring 3 — subtle outer ring */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 0.5, scale: 1, rotate: 180 }}
          transition={{
            opacity: { delay: 2.5, duration: 1.5 },
            scale: { delay: 2.5, duration: 1.5 },
            rotate: { delay: 2.5, duration: 40, repeat: Infinity, ease: "linear" },
          }}
        >
          <div
            className="w-80 h-80 rounded-full"
            style={{ border: `1px solid ${GOLD.primary}0D` }}
          />
        </motion.div>

        {/* The Logo Container */}
        <motion.div
          className="relative z-10 w-36 h-36 rounded-2xl flex items-center justify-center backdrop-blur-sm"
          style={{
            background: `linear-gradient(135deg, ${GOLD.primary}20, ${GOLD.dark}08)`,
            border: `1.5px solid ${GOLD.primary}35`,
            boxShadow: `0 0 40px ${GOLD.primary}15`,
          }}
          animate={
            logoLanded
              ? {
                  boxShadow: [
                    `0 0 40px ${GOLD.primary}15`,
                    `0 0 80px ${GOLD.primary}30`,
                    `0 0 40px ${GOLD.primary}15`,
                  ],
                }
              : undefined
          }
          transition={
            logoLanded
              ? { duration: 3, repeat: Infinity, ease: "easeInOut" }
              : { duration: 1 }
          }
        >
          <Elev8Logo className="w-20 h-20" />

          {/* Pulsing gold dot */}
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
            style={{
              backgroundColor: GOLD.primary,
              boxShadow: `0 0 8px ${GOLD.primary}80`,
            }}
            animate={{
              opacity: [0.6, 1, 0.6],
              boxShadow: [
                `0 0 6px ${GOLD.primary}60`,
                `0 0 14px ${GOLD.primary}90`,
                `0 0 6px ${GOLD.primary}60`,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>

      {/* Text content */}
      <div className="absolute inset-x-0 bottom-0 top-1/2 flex items-start justify-center z-20 pointer-events-none pt-8 font-sans">
        <div className="text-center px-6 max-w-2xl">
          {/* Label */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={logoLanded ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0 }}
          >
            <span
              className="text-[13px] font-medium tracking-[0.35em] uppercase"
              style={{ color: "#94A3B8" }}
            >
              elev8
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="text-[44px] sm:text-[52px] font-bold tracking-[-0.02em] mb-4 mt-5 leading-[1.1]"
            initial={{ y: 20, opacity: 0 }}
            animate={logoLanded ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-[#E2E8F0]">The </span>
            <span style={{ color: GOLD.primary }}>Vault</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-[18px] font-medium mb-10 tracking-[0.01em]"
            style={{ color: "#94A3B8" }}
            initial={{ y: 15, opacity: 0 }}
            animate={logoLanded ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.35 }}
          >
            Private Intelligence Hub
          </motion.p>

          {/* Button or Password Input */}
          <AnimatePresence mode="wait">
            {!showPassword ? (
              <motion.button
                key="enter-btn"
                onClick={handleEnterClick}
                className="pointer-events-auto font-sans group inline-flex items-center gap-3 px-12 py-4 rounded-lg font-semibold text-[17px] tracking-[0.02em] transition-all hover:scale-105 active:scale-95"
                style={{
                  background: GOLD.primary,
                  color: "#0A0A0A",
                }}
                initial={{ y: 15, opacity: 0 }}
                animate={logoLanded ? { y: 0, opacity: 1 } : {}}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                whileHover={{
                  boxShadow: `0 0 40px ${GOLD.primary}50`,
                }}
              >
                Enter
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </motion.button>
            ) : (
              <motion.div
                key="password-form"
                className="pointer-events-auto flex flex-col items-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <form
                  onSubmit={handlePasswordSubmit}
                  className="flex items-center gap-3"
                >
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    className="w-[220px] h-14 px-5 text-center text-[16px] font-medium rounded-lg bg-white/[0.08] border border-white/[0.15] text-[#E2E8F0] placeholder-[#64748B] outline-none transition-colors"
                    style={{
                      borderColor: password ? `${GOLD.primary}50` : undefined,
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = `${GOLD.primary}80`;
                      e.target.style.boxShadow = `0 0 0 1px ${GOLD.primary}40`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255,255,255,0.15)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="submit"
                    disabled={loading || !password}
                    className="h-14 px-10 rounded-lg font-semibold text-[17px] tracking-[0.02em] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    style={{
                      background: GOLD.primary,
                      color: "#0A0A0A",
                    }}
                  >
                    {loading ? "..." : "Enter"}
                  </button>
                </form>
                {error && (
                  <p className="text-[14px] mt-3" style={{ color: "#E94B22" }}>
                    {error}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tagline */}
          <motion.p
            className="text-[12px] font-medium mt-8 tracking-[0.25em] uppercase"
            style={{ color: "#64748B" }}
            initial={{ opacity: 0 }}
            animate={logoLanded ? { opacity: 1 } : {}}
            transition={{ delay: 0.8 }}
          >
            by Elev8
          </motion.p>
        </div>
      </div>
    </div>
  );
}
