"use client";

import { cn } from "@/lib/utils";
import type { Lang } from "@/lib/signal-translations";

interface SignalLanguageToggleProps {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
}

export function SignalLanguageToggle({
  lang,
  onLangChange,
}: SignalLanguageToggleProps) {
  return (
    <div className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] p-0.5 text-xs">
      <button
        type="button"
        onClick={() => onLangChange("en")}
        className={cn(
          "rounded-full px-3 py-1 transition-all",
          lang === "en"
            ? "bg-white/[0.08] text-white/80"
            : "text-white/30 hover:text-white/50"
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => onLangChange("kr")}
        className={cn(
          "rounded-full px-3 py-1 transition-all",
          lang === "kr"
            ? "bg-white/[0.08] text-white/80"
            : "text-white/30 hover:text-white/50"
        )}
      >
        KR
      </button>
    </div>
  );
}
