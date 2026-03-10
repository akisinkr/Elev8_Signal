"use client";

import { useState } from "react";
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
import { Send, Check, Clock } from "lucide-react";

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
}

interface MembersTableProps {
  members: MemberRow[];
}

export function MembersTable({ members }: MembersTableProps) {
  const [sending, setSending] = useState(false);

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
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
