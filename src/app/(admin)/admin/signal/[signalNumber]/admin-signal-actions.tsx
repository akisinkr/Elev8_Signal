"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SignalPublishPanel } from "@/components/admin/signal/signal-publish-panel";
import { SignalVoteStats } from "@/components/admin/signal/signal-vote-stats";
import { Card, CardContent } from "@/components/ui/card";

interface Vote {
  answer: string;
  memberName: string;
  why: string | null;
  createdAt: string;
}

interface DistributionItem {
  answer: string;
  label: string;
  count: number;
  percentage: number;
}

interface AdminSignalActionsProps {
  signalNumber: number;
  status: string;
  headlineInsight: string | null;
  votes: Vote[];
  distribution: DistributionItem[];
}

export function AdminSignalActions({
  signalNumber,
  status: initialStatus,
  headlineInsight,
  votes,
  distribution,
}: AdminSignalActionsProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [status, setStatus] = React.useState(initialStatus);

  async function handleStatusChange(newStatus: string) {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/signal/${signalNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
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

  return (
    <div className="space-y-8">
      <Card>
        <CardContent>
          <h3 className="mb-4 text-sm font-semibold">Status Management</h3>
          <SignalPublishPanel
            headlineInsight={headlineInsight}
            status={status}
            onPublish={handlePublish}
            onStatusChange={handleStatusChange}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3 className="mb-4 text-sm font-semibold">Vote Statistics</h3>
          <SignalVoteStats votes={votes} distribution={distribution} />
        </CardContent>
      </Card>
    </div>
  );
}
