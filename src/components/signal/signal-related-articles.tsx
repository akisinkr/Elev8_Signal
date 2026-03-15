"use client";

import { ExternalLink } from "lucide-react";
import type { Lang } from "@/lib/signal-translations";

interface Article {
  title: string;
  url: string;
  source: string;
  lang: "en" | "kr";
}

interface SignalRelatedArticlesProps {
  articles: Article[];
  lang?: Lang;
}

export function SignalRelatedArticles({
  articles,
  lang = "en",
}: SignalRelatedArticlesProps) {
  const filtered = (articles || []).filter((a) => a.lang === lang);

  if (filtered.length === 0) return null;

  return (
    <div className="space-y-1">
      {filtered.map((article, i) => (
        <a
          key={i}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 rounded-lg px-3 py-3 hover:bg-white/[0.03] transition-colors group"
        >
          <div className="flex-1 min-w-0 space-y-0.5">
            <p className="text-[14px] font-light leading-snug text-white/70 group-hover:text-[#C8A84E]/80 transition-colors">
              {article.title}
            </p>
            <p className="text-[11px] text-white/25">
              {article.source}
            </p>
          </div>
          <ExternalLink className="size-3.5 text-white/15 mt-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      ))}
    </div>
  );
}
