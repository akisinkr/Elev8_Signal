"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Copy, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignalListActionsProps {
  signalNumber: number;
  status: string;
}

export function SignalListActions({ signalNumber, status }: SignalListActionsProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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

      toast.success(`Signal moved to ${newStatus}`);
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function copyLink(path: string) {
    const url = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  }

  return (
    <div className="flex items-center gap-1.5">
      {status === "DRAFT" && (
        <Button
          size="sm"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => handleStatusChange("LIVE")}
          className="h-7 text-xs"
        >
          Go Live
        </Button>
      )}

      {status === "LIVE" && (
        <>
          <Button
            size="sm"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => handleStatusChange("CLOSED")}
            className="h-7 text-xs"
          >
            Close Voting
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => copyLink(`/signal/${signalNumber}/vote`)}
            className="h-7 text-xs"
            title="Copy vote link"
          >
            <Copy className="size-3" />
          </Button>
        </>
      )}

      {status === "CLOSED" && (
        <Button
          size="sm"
          asChild
          className="h-7 text-xs"
        >
          <Link href={`/admin/signal/${signalNumber}`}>
            Write Insight & Publish
          </Link>
        </Button>
      )}

      {status === "PUBLISHED" && (
        <>
          <span className="flex items-center gap-1 text-xs text-green-400">
            <Check className="size-3" />
            Published
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => copyLink(`/signal/${signalNumber}`)}
            className="h-7 text-xs"
            title="Copy results link"
          >
            <Copy className="size-3" />
          </Button>
        </>
      )}

      <Button
        size="sm"
        variant="ghost"
        asChild
        className="h-7 text-xs"
        title="View details"
      >
        <Link href={`/admin/signal/${signalNumber}`}>
          <ExternalLink className="size-3" />
        </Link>
      </Button>
    </div>
  );
}
