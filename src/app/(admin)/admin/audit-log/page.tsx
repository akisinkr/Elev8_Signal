"use client";

import * as React from "react";
import { ScrollText } from "lucide-react";

interface AuditEntry {
  id: string;
  adminEmail: string;
  action: string;
  targetLabel: string | null;
  detail: string | null;
  createdAt: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  ACCESS_REQUEST_APPROVED: { label: "Approved member",   color: "text-green-600 bg-green-50" },
  ACCESS_REQUEST_REJECTED: { label: "Rejected request",  color: "text-red-600 bg-red-50" },
  SIGNAL_CREATED:          { label: "Created signal",    color: "text-blue-600 bg-blue-50" },
  SIGNAL_PUBLISHED:        { label: "Published signal",  color: "text-indigo-600 bg-indigo-50" },
  SIGNAL_CLOSED:           { label: "Closed signal",     color: "text-amber-600 bg-amber-50" },
  SIGNAL_RESULTS_SENT:     { label: "Sent results",      color: "text-purple-600 bg-purple-50" },
  SIGNAL_DELETED:          { label: "Deleted signal",    color: "text-red-600 bg-red-50" },
};

export default function AuditLogPage() {
  const [logs, setLogs] = React.useState<AuditEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/admin/audit-log")
      .then((r) => (r.ok ? r.json() : []))
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center gap-3">
        <ScrollText className="size-5 text-muted-foreground" />
        <div>
          <h1 className="text-xl font-semibold">Audit Log</h1>
          <p className="text-sm text-muted-foreground">All admin actions — last 200 entries</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No actions recorded yet. Actions will appear here as you use the admin panel.
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Action</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Target</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Admin</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((log) => {
                const meta = ACTION_LABELS[log.action] ?? { label: log.action, color: "text-foreground bg-muted" };
                const date = new Date(log.createdAt);
                const relative = formatRelative(date);
                return (
                  <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${meta.color}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {log.targetLabel ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {log.adminEmail}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap" title={date.toLocaleString()}>
                      {relative}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatRelative(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
