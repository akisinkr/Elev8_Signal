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
    <div className="inline-flex items-center rounded-full border bg-muted p-0.5 text-xs font-medium">
      <button
        type="button"
        onClick={() => onLangChange("en")}
        className={cn(
          "rounded-full px-3 py-1 transition-all",
          lang === "en"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
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
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        KR
      </button>
    </div>
  );
}
