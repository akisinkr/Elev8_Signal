"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sparkles, RefreshCw, Check, X, ChevronDown, ChevronUp } from "lucide-react";

interface AiSuggestion {
  id: string;
  question: string;
  questionKr: string | null;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string;
  rationale: string;
  sourceThemes: string[];
  status: string;
  createdAt: string;
}

export function AiSignalSuggestions({ initialSuggestions }: { initialSuggestions: AiSuggestion[] }) {
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [generating, setGenerating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const generateNew = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/signal/ai-suggestions", { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setSuggestions((prev) => [...(data.suggestions || []), ...prev]);
      toast.success(`Generated ${data.suggestions?.length || 0} new Signal suggestions`);
    } catch {
      toast.error("Failed to generate suggestions");
    } finally {
      setGenerating(false);
    }
  };

  const updateStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/signal/ai-suggestions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      setSuggestions((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));
      toast.success(status === "APPROVED" ? "Suggestion approved" : "Suggestion rejected");
    } catch {
      toast.error("Failed to update");
    } finally {
      setUpdatingId(null);
    }
  };

  const pending = suggestions.filter((s) => s.status === "PENDING");
  const decided = suggestions.filter((s) => s.status !== "PENDING");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-violet-400" />
          <h2 className="text-lg font-semibold">AI-Suggested Signals</h2>
          {pending.length > 0 && (
            <span className="ml-1 rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-medium text-violet-300">
              {pending.length} new
            </span>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={generateNew}
          disabled={generating}
          className="text-xs"
        >
          {generating ? <RefreshCw className="size-3 mr-1 animate-spin" /> : <Sparkles className="size-3 mr-1" />}
          Generate from challenges
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        AI analyzes member challenges and generates relevant poll questions. Review and approve to create a new Signal.
      </p>

      {pending.length === 0 && decided.length === 0 && (
        <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
          No AI suggestions yet. Click &ldquo;Generate from challenges&rdquo; to analyze member data.
        </div>
      )}

      {/* Pending suggestions */}
      {pending.length > 0 && (
        <div className="space-y-3">
          {pending.map((s) => (
            <div key={s.id} className="rounded-lg border bg-card overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                className="w-full flex items-start gap-3 p-4 text-left hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug">{s.question}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {s.sourceThemes.map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300/60 border border-violet-400/10">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                {expandedId === s.id ? <ChevronUp className="size-4 text-muted-foreground shrink-0 mt-1" /> : <ChevronDown className="size-4 text-muted-foreground shrink-0 mt-1" />}
              </button>

              {expandedId === s.id && (
                <div className="px-4 pb-4 space-y-3 border-t">
                  <div className="pt-3 space-y-1.5">
                    {["A", "B", "C", "D", "E"].map((letter) => (
                      <p key={letter} className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground/70">{letter}.</span> {s[`option${letter}` as keyof AiSuggestion] as string}
                      </p>
                    ))}
                  </div>
                  <div className="bg-muted/50 rounded-md px-3 py-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mb-1">Why this question</p>
                    <p className="text-xs text-muted-foreground/80">{s.rationale}</p>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={() => updateStatus(s.id, "APPROVED")}
                      disabled={updatingId === s.id}
                      className="text-xs bg-green-600 hover:bg-green-700"
                    >
                      <Check className="size-3 mr-1" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(s.id, "REJECTED")}
                      disabled={updatingId === s.id}
                      className="text-xs"
                    >
                      <X className="size-3 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Decided suggestions */}
      {decided.length > 0 && (
        <details className="text-sm">
          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground/70">
            {decided.length} reviewed suggestion{decided.length !== 1 ? "s" : ""}
          </summary>
          <div className="mt-2 space-y-2">
            {decided.map((s) => (
              <div key={s.id} className="flex items-center gap-2 rounded-md border px-3 py-2 opacity-60">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${s.status === "APPROVED" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                  {s.status}
                </span>
                <p className="text-xs truncate flex-1">{s.question}</p>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
