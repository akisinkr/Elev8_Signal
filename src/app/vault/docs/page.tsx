"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FileText, ExternalLink, ArrowLeft, Lock } from "lucide-react";

const GOLD = "#C8A84E";

interface VaultDoc {
  slug: string;
  title: string;
  description: string;
  date: string;
}

const documents: VaultDoc[] = [
  {
    slug: "elev8-superpower-engine",
    title: "Superpower Engine",
    description:
      "Complete AI-driven member profiling, matching, and feedback flywheel system",
    date: "2026-03-12",
  },
];

function StarField() {
  const [stars, setStars] = useState<
    { x: number; y: number; size: number; delay: number }[]
  >([]);

  useEffect(() => {
    setStars(
      Array.from({ length: 30 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.5 + 0.5,
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
          animate={{ opacity: [0.05, 0.3, 0.05] }}
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

export default function VaultDocsPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Simple cookie check — server-side middleware handles real auth
    if (document.cookie.includes("elev8-vault-auth")) {
      setAuthenticated(true);
    } else {
      router.push("/vault");
    }
  }, [router]);

  if (!authenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.10 0.02 260)" }}
      >
        <Lock className="w-6 h-6 animate-pulse" style={{ color: GOLD }} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative"
      style={{ background: "oklch(0.10 0.02 260)" }}
    >
      <StarField />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <button
            onClick={() => router.push("/vault")}
            className="inline-flex items-center gap-2 text-[13px] font-medium tracking-wide mb-8 transition-opacity hover:opacity-80"
            style={{ color: "#64748B" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-3 mb-2">
            <span
              className="text-[13px] font-medium tracking-[0.3em] uppercase"
              style={{ color: GOLD }}
            >
              elev8
            </span>
            <span className="text-[13px]" style={{ color: "#334155" }}>
              /
            </span>
            <span
              className="text-[13px] font-medium tracking-[0.15em] uppercase"
              style={{ color: "#94A3B8" }}
            >
              vault
            </span>
          </div>

          <h1
            className="text-[32px] sm:text-[38px] font-bold tracking-[-0.02em] mb-2"
            style={{ color: "#E2E8F0" }}
          >
            Documents
          </h1>
          <p
            className="text-[16px] mb-12"
            style={{ color: "#64748B" }}
          >
            Private presentations and intelligence reports
          </p>
        </motion.div>

        {/* Document Cards */}
        <div className="space-y-4">
          {documents.map((doc, i) => (
            <motion.a
              key={doc.slug}
              href={`/vault/${doc.slug}.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="block group rounded-xl p-6 transition-all cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              whileHover={{
                borderColor: `${GOLD}40`,
                boxShadow: `0 0 30px ${GOLD}10`,
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      background: `${GOLD}15`,
                      border: `1px solid ${GOLD}25`,
                    }}
                  >
                    <FileText className="w-5 h-5" style={{ color: GOLD }} />
                  </div>
                  <div>
                    <h3
                      className="text-[18px] font-semibold mb-1 group-hover:text-[#C8A84E] transition-colors"
                      style={{ color: "#E2E8F0" }}
                    >
                      {doc.title}
                    </h3>
                    <p
                      className="text-[14px] leading-relaxed"
                      style={{ color: "#94A3B8" }}
                    >
                      {doc.description}
                    </p>
                    <p
                      className="text-[12px] mt-2 font-medium"
                      style={{ color: "#475569" }}
                    >
                      {doc.date}
                    </p>
                  </div>
                </div>
                <ExternalLink
                  className="w-4 h-4 shrink-0 mt-1 opacity-0 group-hover:opacity-60 transition-opacity"
                  style={{ color: "#94A3B8" }}
                />
              </div>
            </motion.a>
          ))}
        </div>

        {/* Footer */}
        <motion.p
          className="text-center text-[11px] font-medium tracking-[0.2em] uppercase mt-16"
          style={{ color: "#334155" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Confidential — Elev8 Leadership Only
        </motion.p>
      </div>
    </div>
  );
}
