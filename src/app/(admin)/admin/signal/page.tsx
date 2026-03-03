import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SignalStatusBadge } from "@/components/signal/signal-status-badge";
import { SignalCreateDialog } from "@/components/admin/signal/signal-create-dialog";
import { SignalListActions } from "@/components/admin/signal/signal-list-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SIGNAL_CATEGORY_LABELS } from "@/lib/signal-constants";
import { BarChart3, Radio, Users } from "lucide-react";

export default async function AdminSignalPage() {
  await requireAdmin();

  const [signals, totalMembers] = await Promise.all([
    prisma.signalQuestion.findMany({
      orderBy: { signalNumber: "desc" },
      include: { votes: { select: { id: true } } },
    }),
    prisma.member.count(),
  ]);

  const liveSignal = signals.find((s) => s.status === "LIVE");
  const totalSignals = signals.length;

  // Participation rate: average votes per published signal / total members
  const publishedSignals = signals.filter((s) => s.status === "PUBLISHED");
  const avgVotes =
    publishedSignals.length > 0
      ? Math.round(
          publishedSignals.reduce((sum, s) => sum + s.votes.length, 0) /
            publishedSignals.length
        )
      : 0;
  const participationRate =
    totalMembers > 0 && avgVotes > 0
      ? Math.round((avgVotes / totalMembers) * 100)
      : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Signal Management</h1>
        <SignalCreateDialog />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart3 className="size-4" />
            Total Signals
          </div>
          <p className="mt-2 text-2xl font-bold">{totalSignals}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Radio className="size-4" />
            Active Signal
          </div>
          <p className="mt-2 text-2xl font-bold">
            {liveSignal ? `#${liveSignal.signalNumber}` : "None"}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="size-4" />
            Participation
          </div>
          <p className="mt-2 text-2xl font-bold">{participationRate}%</p>
        </div>
      </div>

      {/* Signal List */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Votes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {signals.map((signal) => (
              <TableRow key={signal.id}>
                <TableCell className="font-bold">
                  {signal.signalNumber}
                </TableCell>
                <TableCell className="max-w-[300px]">
                  <span className="line-clamp-1">{signal.question}</span>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {SIGNAL_CATEGORY_LABELS[signal.category]}
                </TableCell>
                <TableCell>
                  <SignalStatusBadge status={signal.status} />
                </TableCell>
                <TableCell className="text-right">
                  {signal.votes.length}
                </TableCell>
                <TableCell className="text-right">
                  <SignalListActions
                    signalNumber={signal.signalNumber}
                    status={signal.status}
                  />
                </TableCell>
              </TableRow>
            ))}
            {signals.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-12"
                >
                  No signals yet. Create your first one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
