"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SignalHeadline } from "@/components/signal/signal-headline";
import { SignalRelatedArticles } from "@/components/signal/signal-related-articles";
import {
  Loader2,
  Sparkles,
  Check,
  Radio,
  Lock,
  Globe,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
  onStatusChange: (status: string, extra?: Record<string, unknown>) => void;
  onInsightChange?: (payload: string | null) => void;
  isSubmitting: boolean;
}

const STEPS = ["DRAFT", "LIVE", "CLOSED", "PUBLISHED"] as const;

const STEP_META: Record<
  string,
  { label: string; icon: React.ElementType; color: string; activeBg: string }
> = {
  DRAFT: {
    label: "Draft",
    icon: Lock,
    color: "text-zinc-400",
    activeBg: "bg-zinc-600",
  },
  LIVE: {
    label: "Live",
    icon: Radio,
    color: "text-green-400",
    activeBg: "bg-green-600",
  },
  CLOSED: {
    label: "Closed",
    icon: Lock,
    color: "text-amber-400",
    activeBg: "bg-amber-600",
  },
  PUBLISHED: {
    label: "Published",
    icon: Globe,
    color: "text-green-400",
    activeBg: "bg-green-600",
  },
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
  const [confirmDialog, setConfirmDialog] = React.useState<
    "reopen" | "unpublish" | null
  >(null);

  React.useEffect(() => {
    if (onInsightChange) {
      const payload = enInsight.trim() ? buildInsightPayload() : null;
      onInsightChange(payload);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enInsight, krInsight, articles]);

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
        setEnInsight(
          typeof insight === "string" ? insight : JSON.stringify(insight)
        );
      }
    } catch {
      toast.error("Failed to generate insight");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleConfirmReopen() {
    setConfirmDialog(null);
    onStatusChange("LIVE");
  }

  function handleConfirmUnpublish() {
    setConfirmDialog(null);
    onStatusChange("CLOSED");
  }

  const currentValue = activeTab === "en" ? enInsight : krInsight;
  const setCurrentValue = activeTab === "en" ? setEnInsight : setKrInsight;

  const previewInsight = enInsight.trim() ? buildInsightPayload() : null;

  const currentIdx = STEPS.indexOf(status as (typeof STEPS)[number]);

  return (
    <div className="space-y-6">
      {/* ── Status Pipeline ── */}
      <div className="flex items-center gap-1">
        {STEPS.map((step, idx) => {
          const meta = STEP_META[step];
          const isCurrent = step === status;
          const isCompleted = idx < currentIdx;
          // Show reverted icon if we're at CLOSED and this is PUBLISHED step
          const isReverted =
            status === "CLOSED" && step === "PUBLISHED" && headlineInsight;

          return (
            <React.Fragment key={step}>
              {idx > 0 && (
                <div
                  className={cn(
                    "flex-1 h-px",
                    idx <= currentIdx ? "bg-zinc-600" : "bg-zinc-800 border-t border-dashed border-zinc-700"
                  )}
                />
              )}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex items-center justify-center size-8 rounded-full transition-colors",
                    isCurrent && meta.activeBg + " text-white",
                    isCompleted && "bg-zinc-700 text-zinc-300",
                    !isCurrent && !isCompleted && "bg-zinc-800 text-zinc-600 border border-zinc-700"
                  )}
                >
                  {isReverted ? (
                    <RotateCcw className="size-3.5" />
                  ) : isCompleted ? (
                    <Check className="size-3.5" />
                  ) : (
                    <meta.icon className="size-3.5" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium uppercase tracking-wider",
                    isCurrent ? meta.color : "text-zinc-600"
                  )}
                >
                  {meta.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Context Card ── */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 space-y-4">
        {status === "DRAFT" && (
          <>
            <div>
              <p className="text-sm font-medium text-white">
                This Signal is a draft
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Set a voting deadline, then go live to collect responses.
              </p>
            </div>
          </>
        )}

        {status === "LIVE" && (
          <div>
            <p className="text-sm font-medium text-green-400">
              Voting is open
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Members are submitting responses. Close voting when you&apos;re
              ready to review results.
            </p>
          </div>
        )}

        {status === "CLOSED" && (
          <div>
            <p className="text-sm font-medium text-amber-400">
              Voting is closed
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Review responses, write or generate an insight, then publish
              results — or reopen voting if you need more input.
            </p>
          </div>
        )}

        {status === "PUBLISHED" && (
          <div>
            <p className="text-sm font-medium text-green-400">
              Results are published
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Members can view results. You can update the insight or send
              notification emails.
            </p>
          </div>
        )}

        {/* ── Insight Editor (CLOSED / PUBLISHED) ── */}
        {(status === "CLOSED" || status === "PUBLISHED") && (
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <Label htmlFor="headline">Insight</Label>
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
            </div>

            {/* Language tabs */}
            <div className="flex gap-1 border-b border-zinc-800">
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

            {status === "PUBLISHED" &&
              enInsight.trim().length > 0 &&
              onSaveInsight && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => onSaveInsight(buildInsightPayload())}
                  >
                    {isSubmitting ? "Saving..." : "Save Insight"}
                  </Button>
                </div>
              )}
          </div>
        )}
      </div>

      {/* ── Action Bar ── */}
      <div className="flex items-center justify-between">
        {/* Secondary / backward action (left) */}
        <div>
          {status === "CLOSED" && (
            <Button
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setConfirmDialog("reopen")}
              className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
            >
              <RotateCcw className="mr-2 size-4" />
              Reopen Voting
            </Button>
          )}
          {status === "PUBLISHED" && (
            <Button
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setConfirmDialog("unpublish")}
              className="border-red-800 text-red-400 hover:bg-red-950"
            >
              Unpublish
            </Button>
          )}
        </div>

        {/* Primary forward action (right) */}
        <div>
          {status === "DRAFT" && (
            <Button
              disabled={isSubmitting}
              onClick={() => onStatusChange("LIVE")}
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              {isSubmitting ? "Going Live..." : "Go Live"}
            </Button>
          )}

          {status === "LIVE" && (
            <Button
              disabled={isSubmitting}
              onClick={() => onStatusChange("CLOSED")}
              className="bg-amber-600 hover:bg-amber-500 text-white"
            >
              {isSubmitting ? "Closing..." : "Close Voting"}
            </Button>
          )}

          {status === "CLOSED" && (
            <Button
              disabled={isSubmitting || !canPublish}
              onClick={() => onPublish(buildInsightPayload())}
              className="bg-green-600 hover:bg-green-500 text-white disabled:opacity-40"
              title={
                !canPublish ? "Add an insight summary first" : undefined
              }
            >
              {isSubmitting ? "Publishing..." : "Publish Results"}
            </Button>
          )}
        </div>
      </div>

      {/* ── Formatted Preview ── */}
      {previewInsight && (
        <div className="space-y-4 pt-4 border-t border-zinc-800">
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

      {/* ── Confirmation Dialogs ── */}
      <Dialog
        open={confirmDialog === "reopen"}
        onOpenChange={(open) => !open && setConfirmDialog(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reopen voting?</DialogTitle>
            <DialogDescription>
              This will allow members to submit responses again. You&apos;ll
              need to set a new voting deadline.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDialog(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isSubmitting}
              onClick={handleConfirmReopen}
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              Reopen Voting
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmDialog === "unpublish"}
        onOpenChange={(open) => !open && setConfirmDialog(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Unpublish this Signal?</DialogTitle>
            <DialogDescription>
              Members will no longer see the results. The Signal will return to
              Closed status. You can re-publish at any time.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDialog(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isSubmitting}
              onClick={handleConfirmUnpublish}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              Yes, Unpublish
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
