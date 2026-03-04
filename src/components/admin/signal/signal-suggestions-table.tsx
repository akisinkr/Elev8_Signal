"use client";

import * as React from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, X, Loader2, Sparkles, ChevronDown } from "lucide-react";

interface Suggestion {
  id: string;
  rawQuestion: string;
  context: string | null;
  status: string;
  polishedQuestion: string | null;
  suggestedOptions: string | null;
  createdAt: string;
}

interface SignalSuggestionsTableProps {
  pendingSuggestions: Suggestion[];
  approvedSuggestions: Suggestion[];
}

type Tab = "pending" | "approved";

export function SignalSuggestionsTable({
  pendingSuggestions: initialPending,
  approvedSuggestions: initialApproved,
}: SignalSuggestionsTableProps) {
  const [pending, setPending] = React.useState<Suggestion[]>(initialPending);
  const [approved, setApproved] = React.useState<Suggestion[]>(initialApproved);
  const [activeTab, setActiveTab] = React.useState<Tab>(
    initialPending.length > 0 ? "pending" : "approved"
  );
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const [showDialog, setShowDialog] = React.useState(false);
  const [polishedQuestion, setPolishedQuestion] = React.useState("");
  const [polishedOptions, setPolishedOptions] = React.useState<string[]>([]);
  const [isCreating, setIsCreating] = React.useState(false);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  async function handleApprove(id: string) {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/signal/suggestions/${id}/approve`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to approve");
        return;
      }

      const data = await res.json();
      setPolishedQuestion(data.polishedQuestion);
      setPolishedOptions(data.options);
      setShowDialog(true);

      // Move from pending to approved
      const item = pending.find((s) => s.id === id);
      setPending((prev) => prev.filter((s) => s.id !== id));
      if (item) {
        setApproved((prev) => [
          {
            ...item,
            status: "APPROVED",
            polishedQuestion: data.polishedQuestion,
            suggestedOptions: JSON.stringify(data.options),
          },
          ...prev,
        ]);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(id: string) {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/signal/suggestions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED" }),
      });

      if (!res.ok) {
        toast.error("Failed to reject");
        return;
      }

      setPending((prev) => prev.filter((s) => s.id !== id));
      toast.success("Suggestion rejected");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setProcessingId(null);
    }
  }

  function handleOpenCreateDialog(suggestion: Suggestion) {
    const question = suggestion.polishedQuestion || suggestion.rawQuestion;
    let options: string[] = [];
    if (suggestion.suggestedOptions) {
      try {
        options = JSON.parse(suggestion.suggestedOptions);
      } catch {
        options = [];
      }
    }
    setPolishedQuestion(question);
    setPolishedOptions(options.length === 5 ? options : ["", "", "", "", ""]);
    setShowDialog(true);
  }

  async function handleCreateSignal() {
    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: polishedQuestion,
          optionA: polishedOptions[0],
          optionB: polishedOptions[1],
          optionC: polishedOptions[2],
          optionD: polishedOptions[3],
          optionE: polishedOptions[4],
          category: "WILDCARD",
        }),
      });

      if (!res.ok) {
        toast.error("Failed to create signal");
        return;
      }

      toast.success("Draft signal created!");
      setShowDialog(false);
      window.location.reload();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsCreating(false);
    }
  }

  const suggestions = activeTab === "pending" ? pending : approved;

  return (
    <>
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b">
        <button
          onClick={() => setActiveTab("pending")}
          className={cn(
            "px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
            activeTab === "pending"
              ? "border-amber-500 text-amber-500"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Pending
          {pending.length > 0 && (
            <span className="ml-1.5 inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-300">
              {pending.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("approved")}
          className={cn(
            "px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
            activeTab === "approved"
              ? "border-emerald-500 text-emerald-500"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Approved
          {approved.length > 0 && (
            <span className="ml-1.5 inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
              {approved.length}
            </span>
          )}
        </button>
      </div>

      {/* Table */}
      {suggestions.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          No {activeTab} suggestions.
        </p>
      ) : (
        <div className="rounded-lg border divide-y">
          {suggestions.map((s) => {
            const isExpanded = expandedId === s.id;
            return (
              <div key={s.id}>
                {/* Summary row — click to expand */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : s.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                >
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                  <span className="flex-1 text-sm line-clamp-1">
                    {s.rawQuestion}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 pl-11 space-y-4 border-t bg-muted/30">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Original Question
                      </p>
                      <p className="text-sm">{s.rawQuestion}</p>
                    </div>

                    {s.context && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Context
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {s.context}
                        </p>
                      </div>
                    )}

                    {s.polishedQuestion && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          AI-Polished Question
                        </p>
                        <p className="text-sm">{s.polishedQuestion}</p>
                      </div>
                    )}

                    {s.suggestedOptions && (() => {
                      try {
                        const opts = JSON.parse(s.suggestedOptions) as string[];
                        return (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Suggested Options
                            </p>
                            <div className="space-y-1">
                              {opts.map((opt, i) => (
                                <p key={i} className="text-sm text-muted-foreground">
                                  <span className="font-medium">{String.fromCharCode(65 + i)}.</span>{" "}
                                  {opt}
                                </p>
                              ))}
                            </div>
                          </div>
                        );
                      } catch {
                        return null;
                      }
                    })()}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      {activeTab === "pending" ? (
                        <>
                          <button
                            onClick={() => handleApprove(s.id)}
                            disabled={processingId === s.id}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                              "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                              "dark:bg-emerald-950 dark:text-emerald-400 dark:hover:bg-emerald-900",
                              "disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                          >
                            {processingId === s.id ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Check className="size-3.5" />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(s.id)}
                            disabled={processingId === s.id}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                              "bg-red-50 text-red-700 hover:bg-red-100",
                              "dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900",
                              "disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                          >
                            <X className="size-3.5" />
                            Reject
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleOpenCreateDialog(s)}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                            "bg-primary text-primary-foreground hover:bg-primary/90"
                          )}
                        >
                          <Sparkles className="size-3.5" />
                          Create Signal
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-4" />
              AI-Polished Question
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Question</label>
              <textarea
                value={polishedQuestion}
                onChange={(e) => setPolishedQuestion(e.target.value)}
                rows={3}
                className={cn(
                  "flex w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                )}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Options</label>
              {polishedOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground w-4">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <input
                    value={opt}
                    onChange={(e) => {
                      const next = [...polishedOptions];
                      next[i] = e.target.value;
                      setPolishedOptions(next);
                    }}
                    className={cn(
                      "flex-1 rounded-lg border bg-background px-3 py-2 text-sm",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    )}
                  />
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              This will create a DRAFT signal. Suggested by an Elev8 member.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDialog(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSignal}
                disabled={isCreating || !polishedQuestion.trim()}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-semibold transition-all",
                  "bg-primary text-primary-foreground",
                  "hover:bg-primary/90 active:scale-[0.98]",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isCreating ? "Creating..." : "Create Draft Signal"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
