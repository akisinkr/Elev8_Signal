"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SignalStatusBadge } from "@/components/signal/signal-status-badge";
import { SignalHeadline } from "@/components/signal/signal-headline";
import { SignalRelatedArticles } from "@/components/signal/signal-related-articles";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Article {
  title: string;
  url: string;
  source: string;
  lang: "en" | "kr";
}

interface SignalPublishPanelProps {
  headlineInsight: string | null;
  status: string;
  signalNumber: number;
  onPublish: (headline: string) => void;
  onSaveInsight?: (headline: string) => void;
  onStatusChange: (status: string) => void;
  onInsightChange?: (payload: string | null) => void;
  isSubmitting: boolean;
}

const STATUS_FLOW: Record<string, string> = {
  DRAFT: "LIVE",
  LIVE: "CLOSED",
  CLOSED: "PUBLISHED",
};

function parseExistingInsight(raw: string | null): {
  en: string;
  kr: string;
  articles: Article[];
} {
  if (!raw) return { en: "", kr: "", articles: [] };
  try {
    const parsed = JSON.parse(raw);
    if (parsed.en && parsed.kr) {
      const en = Array.isArray(parsed.en) ? parsed.en.join("\n") : parsed.en;
      const kr = Array.isArray(parsed.kr) ? parsed.kr.join("\n") : parsed.kr;
      return { en, kr, articles: parsed.articles || [] };
    }
  } catch {
    // plain text fallback
  }
  return { en: raw, kr: "", articles: [] };
}

export function SignalPublishPanel({
  headlineInsight,
  status,
  signalNumber,
  onPublish,
  onSaveInsight,
  onStatusChange,
  onInsightChange,
  isSubmitting,
}: SignalPublishPanelProps) {
  const initial = parseExistingInsight(headlineInsight);
  const [enInsight, setEnInsight] = React.useState(initial.en);
  const [krInsight, setKrInsight] = React.useState(initial.kr);
  const [articles, setArticles] = React.useState<Article[]>(initial.articles);
  const [activeTab, setActiveTab] = React.useState<"en" | "kr">("en");
  const [isGenerating, setIsGenerating] = React.useState(false);

  // Notify parent of current insight payload whenever it changes
  React.useEffect(() => {
    if (onInsightChange) {
      const payload = enInsight.trim() ? buildInsightPayload() : null;
      onInsightChange(payload);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enInsight, krInsight, articles]);

  const nextStatus = STATUS_FLOW[status];
  const canPublish = status === "CLOSED" && enInsight.trim().length > 0;

  function buildInsightPayload(): string {
    if (krInsight.trim()) {
      const en = enInsight.trim().split("\n").filter(Boolean);
      const kr = krInsight.trim().split("\n").filter(Boolean);
      const payload: Record<string, unknown> = { en, kr };
      if (articles.length > 0) {
        payload.articles = articles;
      }
      return JSON.stringify(payload);
    }
    return enInsight.trim();
  }

  async function handleGenerateInsight() {
    setIsGenerating(true);
    try {
      const res = await fetch(
        `/api/admin/signal/${signalNumber}/generate-insight`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to generate insight");
        return;
      }

      const insight = data.insight;
      if (insight.en && insight.kr) {
        setEnInsight(
          Array.isArray(insight.en) ? insight.en.join("\n") : insight.en
        );
        setKrInsight(
          Array.isArray(insight.kr) ? insight.kr.join("\n") : insight.kr
        );
        if (insight.articles) {
          setArticles(insight.articles);
        }
        const articleCount = insight.articles?.length || 0;
        toast.success(
          `Generated insights${articleCount > 0 ? ` + ${articleCount} articles` : ""}`
        );
      } else {
        setEnInsight(typeof insight === "string" ? insight : JSON.stringify(insight));
      }
    } catch {
      toast.error("Failed to generate insight");
    } finally {
      setIsGenerating(false);
    }
  }

  const currentValue = activeTab === "en" ? enInsight : krInsight;
  const setCurrentValue = activeTab === "en" ? setEnInsight : setKrInsight;

  // Build a preview-friendly headline string for the formatted card
  const previewInsight = enInsight.trim()
    ? buildInsightPayload()
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Current status:</span>
        <SignalStatusBadge status={status} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="headline">Insight</Label>
          {(status === "CLOSED" || status === "PUBLISHED") && (
            <Button
              variant="outline"
              size="sm"
              disabled={isGenerating}
              onClick={handleGenerateInsight}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  Generate with AI
                </>
              )}
            </Button>
          )}
        </div>

        {/* Language tabs */}
        <div className="flex gap-1 border-b">
          <button
            type="button"
            onClick={() => setActiveTab("en")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium transition-colors",
              activeTab === "en"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("kr")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium transition-colors",
              activeTab === "kr"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            한국어
          </button>
        </div>

        <Textarea
          id="headline"
          placeholder={
            activeTab === "en"
              ? "Write or generate insights..."
              : "인사이트를 작성하거나 AI로 생성하세요..."
          }
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          rows={8}
        />
      </div>

      <div className="flex gap-2">
        {nextStatus && nextStatus !== "PUBLISHED" && (
          <Button
            variant="outline"
            disabled={isSubmitting}
            onClick={() => onStatusChange(nextStatus)}
          >
            Move to {nextStatus}
          </Button>
        )}

        {canPublish && (
          <Button
            disabled={isSubmitting}
            onClick={() => onPublish(buildInsightPayload())}
          >
            {isSubmitting ? "Publishing..." : "Publish Results"}
          </Button>
        )}

        {status === "PUBLISHED" && enInsight.trim().length > 0 && onSaveInsight && (
          <Button
            disabled={isSubmitting}
            onClick={() => onSaveInsight(buildInsightPayload())}
          >
            {isSubmitting ? "Saving..." : "Save Insight"}
          </Button>
        )}
      </div>

      {/* Formatted insight preview */}
      {previewInsight && (
        <div className="space-y-4 pt-4 border-t">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Formatted Preview
          </p>
          <SignalHeadline
            headline={previewInsight}
            signalNumber={signalNumber}
            lang={activeTab}
          />
          {articles.length > 0 && (
            <SignalRelatedArticles articles={articles} lang={activeTab} />
          )}
        </div>
      )}
    </div>
  );
}
