"use client";

import { toast } from "sonner";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignalCopyLinksProps {
  signalNumber: number;
  status: string;
}

export function SignalCopyLinks({ signalNumber, status }: SignalCopyLinksProps) {
  function copyLink(path: string, label: string) {
    const url = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(url);
    toast.success(`${label} link copied!`);
  }

  return (
    <div className="flex items-center gap-2">
      {(status === "LIVE" || status === "CLOSED") && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => copyLink(`/signal/${signalNumber}/vote`, "Vote")}
        >
          <Copy className="mr-1.5 size-3" />
          Copy Vote Link
        </Button>
      )}

      {status === "PUBLISHED" && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => copyLink(`/signal/${signalNumber}`, "Results")}
        >
          <Copy className="mr-1.5 size-3" />
          Copy Results Link
        </Button>
      )}
    </div>
  );
}
