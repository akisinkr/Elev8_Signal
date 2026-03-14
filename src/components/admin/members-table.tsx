"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Send, Check, Clock, Scan, Loader2 } from "lucide-react";
import { MemberDetailDialog } from "./member-detail-dialog";

interface MemberRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string | null;
  company: string | null;
  jobTitle: string | null;
  superpowers: string[];
  challenges: string[];
  dreamConnection: string | null;
  cardCompletedAt: string | null;
  createdAt: string;
  linkedinUrl: string | null;
  xrayStatus: string | null;
}

interface MembersTableProps {
  members: MemberRow[];
}

export function MembersTable({ members: initialMembers }: MembersTableProps) {
  const [members, setMembers] = useState(initialMembers);
  const [sending, setSending] = useState(false);
  const [xrayRunning, setXrayRunning] = useState<Set<string>>(new Set());
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Poll for xray status updates when any member is processing
  const hasProcessing = members.some(
    (m) => m.xrayStatus === "PROCESSING" || xrayRunning.size > 0
  );

  const pollXrayStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/members/xray-status");
      if (!res.ok) return;
      const statuses: Record<string, string> = await res.json();
      setMembers((prev) =>
        prev.map((m) => ({
          ...m,
          xrayStatus: statuses[m.id] ?? m.xrayStatus,
        }))
      );
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (!hasProcessing) return;
    const interval = setInterval(pollXrayStatus, 10000);
    return () => clearInterval(interval);
  }, [hasProcessing, pollXrayStatus]);

  const handleTriggerXray = async (memberId: string) => {
    setXrayRunning((prev) => new Set(prev).add(memberId));
    // Immediately show PROCESSING in table
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, xrayStatus: "PROCESSING" } : m))
    );
    try {
      const res = await fetch(`/api/admin/xray/${memberId}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Xray analysis started — will complete in ~2 min");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to trigger Xray");
      // Revert status on error
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, xrayStatus: "FAILED" } : m))
      );
    } finally {
      setXrayRunning((prev) => {
        const next = new Set(prev);
        next.delete(memberId);
        return next;
      });
    }
  };

  const handleSendCardInvites = async () => {
    if (
      !confirm(
        "Send member card invitation emails to all members who haven't completed their card?"
      )
    )
      return;

    setSending(true);
    try {
      const res = await fetch("/api/admin/members/send-card-invite", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(
        `Sent ${data.sent} emails. ${data.skipped} skipped (already completed).`
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send emails"
      );
    } finally {
      setSending(false);
    }
  };

  const completed = members.filter((m) => m.cardCompletedAt).length;
  const pending = members.length - completed;

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card p-5">
        <div className="text-sm text-muted-foreground">
          <span className="text-emerald-400 font-semibold">{completed}</span>{" "}
          completed ·{" "}
          <span className="text-amber-400 font-semibold">{pending}</span>{" "}
          pending
        </div>
        <Button
          onClick={handleSendCardInvites}
          disabled={sending || pending === 0}
          size="sm"
          className="rounded-lg"
        >
          <Send className="size-3.5 mr-1.5" />
          {sending
            ? "Sending..."
            : `Send Card Invite${pending !== 1 ? "s" : ""} (${pending})`}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Superpowers</TableHead>
              <TableHead>Card</TableHead>
              <TableHead>Xray</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow
                key={member.id}
                className="cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => { setSelectedMemberId(member.id); setDetailOpen(true); }}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt=""
                        className="size-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {member.firstName[0]}
                        {member.lastName[0]}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-sm text-foreground">
                        {member.firstName} {member.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {member.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {member.jobTitle && (
                      <div className="text-foreground/80">{member.jobTitle}</div>
                    )}
                    {member.company && (
                      <div className="text-xs text-muted-foreground">{member.company}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {member.superpowers.slice(0, 3).map((s) => (
                      <Badge
                        key={s}
                        variant="secondary"
                        className="text-[10px] bg-primary/10 text-primary/80"
                      >
                        {s}
                      </Badge>
                    ))}
                    {member.superpowers.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{member.superpowers.length - 3}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {member.cardCompletedAt ? (
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <Check className="size-3.5" />
                      <span className="text-xs font-medium">Done</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="size-3.5" />
                      <span className="text-xs">Pending</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {member.xrayStatus === "COMPLETED" ? (
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <Check className="size-3.5" />
                      <span className="text-xs font-medium">Done</span>
                    </div>
                  ) : member.xrayStatus === "PROCESSING" || xrayRunning.has(member.id) ? (
                    <div className="flex items-center gap-1.5 text-amber-400">
                      <Loader2 className="size-3.5 animate-spin" />
                      <span className="text-xs">Running</span>
                    </div>
                  ) : member.xrayStatus === "FAILED" ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleTriggerXray(member.id); }}
                      className="flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Scan className="size-3.5" />
                      <span className="text-xs">Retry</span>
                    </button>
                  ) : member.linkedinUrl ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleTriggerXray(member.id); }}
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-blue-400 transition-colors"
                    >
                      <Scan className="size-3.5" />
                      <span className="text-xs">Run</span>
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground/50">No LinkedIn</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <MemberDetailDialog
        memberId={selectedMemberId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
