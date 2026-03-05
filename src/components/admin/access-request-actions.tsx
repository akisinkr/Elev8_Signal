"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

interface AccessRequestActionsProps {
  id: string;
}

export function AccessRequestActions({ id }: AccessRequestActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAction(status: "APPROVED" | "REJECTED") {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/access-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error();

      toast.success(status === "APPROVED" ? "Request approved" : "Request rejected");
      router.refresh();
    } catch {
      toast.error("Failed to update request");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={() => handleAction("APPROVED")}
        disabled={loading}
        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-green-600 hover:bg-green-500/10 transition-colors disabled:opacity-50"
      >
        <Check className="size-3.5" />
        Approve
      </button>
      <button
        onClick={() => handleAction("REJECTED")}
        disabled={loading}
        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
      >
        <X className="size-3.5" />
        Reject
      </button>
    </div>
  );
}
