"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SignalPublishPanel } from "@/components/admin/signal/signal-publish-panel";
import { SignalVoteStats } from "@/components/admin/signal/signal-vote-stats";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { SignalResultsPreview } from "@/components/admin/signal/signal-results-preview";

interface Vote {
  answer: string;
  memberName: string;
  why: string | null;
  createdAt: string;
  resultEmailSentAt: string | null;
}

interface DistributionItem {
  answer: string;
  label: string;
  count: number;
  percentage: number;
}

interface AdminSignalActionsProps {
  signalNumber: number;
  question: string;
  status: string;
  headlineInsight: string | null;
  votes: Vote[];
  distribution: DistributionItem[];
}

export function AdminSignalActions({
  signalNumber,
  question,
  status: initialStatus,
  headlineInsight,
  votes,
  distribution,
}: AdminSignalActionsProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [status, setStatus] = React.useState(initialStatus);
  const [showPreview, setShowPreview] = React.useState(false);
  const [currentInsight, setCurrentInsight] = React.useState<string | null>(headlineInsight);
  const [showDeadlineDialog, setShowDeadlineDialog] = React.useState(false);
  const [deadline, setDeadline] = React.useState<Date | undefined>(undefined);

  async function handleStatusChange(newStatus: string, extra?: Record<string, unknown>) {
    if (newStatus === "LIVE" && !extra?.voteDeadline) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      setDeadline(defaultDate);
      setShowDeadlineDialog(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/signal/${signalNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, ...extra }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to update status");
        return;
      }

      setStatus(newStatus);
      toast.success(`Status updated to ${newStatus}`);
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleConfirmGoLive() {
    if (!deadline) {
      toast.error("Please set a vote deadline");
      return;
    }
    setShowDeadlineDialog(false);
    handleStatusChange("LIVE", { voteDeadline: deadline.toISOString() });
  }

  async function handlePublish(headline: string) {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/signal/${signalNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "PUBLISHED",
          headlineInsight: headline,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to publish");
        return;
      }

      setStatus("PUBLISHED");
      toast.success("Signal published!");
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveInsight(headline: string) {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/signal/${signalNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headlineInsight: headline }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to save insight");
        return;
      }

      toast.success("Insight updated!");
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSendResults() {
    setIsSending(true);
    try {
      const res = await fetch(`/api/admin/signal/${signalNumber}/send-results`, {
        method: "POST",
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to send results");
        return;
      }

      const { sent, skipped, total, errors } = await res.json();
      const skippedNote = skipped > 0 ? ` (${skipped} already received)` : "";
      if (sent === 0 && skipped > 0) {
        toast.info(`All ${total} voters already received results.`);
      } else if (errors?.length > 0 && sent > 0) {
        toast.success(`Sent to ${sent}/${total} voters (${errors.length} failed)${skippedNote}`);
      } else if (errors?.length > 0) {
        const firstReason = errors[0]?.reason || "Unknown error";
        toast.error(`Failed to send. Error: ${firstReason}`);
      } else {
        toast.success(`Results sent to ${sent} member${sent !== 1 ? "s" : ""}!${skippedNote}`);
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardContent>
          <h3 className="mb-4 text-sm font-semibold">Status Management</h3>
          <SignalPublishPanel
            headlineInsight={headlineInsight}
            status={status}
            signalNumber={signalNumber}
            onPublish={handlePublish}
            onSaveInsight={handleSaveInsight}
            onStatusChange={handleStatusChange}
            onInsightChange={setCurrentInsight}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>

      {(status === "CLOSED" || status === "PUBLISHED") && (
        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x">
              {/* Preview action */}
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-4 px-6 py-5 text-left hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center justify-center size-10 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                  <Eye className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Preview Member View</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    See what members will see
                  </p>
                </div>
              </button>

              {/* Notify action */}
              {status === "PUBLISHED" ? (
                <button
                  type="button"
                  disabled={isSending}
                  onClick={handleSendResults}
                  className="flex items-center gap-4 px-6 py-5 text-left hover:bg-muted/50 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center size-10 rounded-lg bg-green-500/10 text-green-500 group-hover:bg-green-500/20 transition-colors">
                    {isSending ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <Send className="size-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {isSending ? "Sending..." : "Send Results"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {votes.filter((v) => v.resultEmailSentAt).length}/{votes.length} received results
                    </p>
                  </div>
                </button>
              ) : (
                <div className="flex items-center gap-4 px-6 py-5 opacity-40">
                  <div className="flex items-center justify-center size-10 rounded-lg bg-muted text-muted-foreground">
                    <Send className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Send Results</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Available after publishing
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {showPreview && (
        <SignalResultsPreview
          signalNumber={signalNumber}
          question={question}
          headlineInsight={currentInsight}
          distribution={distribution}
          votes={votes}
          onClose={() => setShowPreview(false)}
        />
      )}

      <Card>
        <CardContent>
          <h3 className="mb-4 text-sm font-semibold">Vote Statistics</h3>
          <SignalVoteStats votes={votes} distribution={distribution} />
        </CardContent>
      </Card>

      <Dialog open={showDeadlineDialog} onOpenChange={setShowDeadlineDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Set Vote Deadline</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Vote Deadline</label>
              <DateTimePicker
                value={deadline}
                onChange={setDeadline}
                placeholder="Pick deadline date & time"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowDeadlineDialog(false)}>
                Cancel
              </Button>
              <Button size="sm" disabled={isSubmitting || !deadline} onClick={handleConfirmGoLive}>
                {isSubmitting ? "Going Live..." : "Go Live"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
