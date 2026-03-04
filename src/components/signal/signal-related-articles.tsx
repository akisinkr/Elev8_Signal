"use client";

import { ExternalLink, Newspaper } from "lucide-react";
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

const SECTION_TITLE = {
  en: "Related Reading",
  kr: "관련 기사",
};

export function SignalRelatedArticles({
  articles,
  lang = "en",
}: SignalRelatedArticlesProps) {
  const filtered = (articles || []).filter((a) => a.lang === lang);

  if (filtered.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b px-5 py-3">
        <div className="flex items-center justify-center size-6 rounded-md bg-muted">
          <Newspaper className="size-3.5 text-foreground" />
        </div>
        <span className="text-sm font-semibold">{SECTION_TITLE[lang]}</span>
      </div>

      <div className="divide-y">
        {filtered.map((article, i) => (
          <a
            key={i}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 px-5 py-3.5 hover:bg-muted/50 transition-colors group"
          >
            <div className="flex-1 min-w-0 space-y-0.5">
              <p className="text-sm font-medium leading-snug group-hover:text-primary transition-colors">
                {article.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {article.source}
              </p>
            </div>
            <ExternalLink className="size-3.5 text-muted-foreground mt-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        ))}
      </div>
    </div>
  );
}
