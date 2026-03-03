"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SignalStatusBadge } from "@/components/signal/signal-status-badge";

interface SignalPublishPanelProps {
  headlineInsight: string | null;
  status: string;
  onPublish: (headline: string) => void;
  onStatusChange: (status: string) => void;
  isSubmitting: boolean;
}

const STATUS_FLOW: Record<string, string> = {
  DRAFT: "LIVE",
  LIVE: "CLOSED",
  CLOSED: "PUBLISHED",
};

export function SignalPublishPanel({
  headlineInsight,
  status,
  onPublish,
  onStatusChange,
  isSubmitting,
}: SignalPublishPanelProps) {
  const [headline, setHeadline] = React.useState(headlineInsight ?? "");

  const nextStatus = STATUS_FLOW[status];
  const canPublish = status === "CLOSED" && headline.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Current status:</span>
        <SignalStatusBadge status={status} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="headline">Headline Insight (3-line summary)</Label>
        <Textarea
          id="headline"
          placeholder="Write the key takeaway from this signal..."
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          rows={4}
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
            onClick={() => onPublish(headline.trim())}
          >
            {isSubmitting ? "Publishing..." : "Publish Results"}
          </Button>
        )}
      </div>
    </div>
  );
}
