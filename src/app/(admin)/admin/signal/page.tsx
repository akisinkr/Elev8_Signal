import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { SignalStatusBadge } from "@/components/signal/signal-status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SIGNAL_CATEGORY_LABELS } from "@/lib/signal-constants";
import { Plus } from "lucide-react";

export default async function AdminSignalPage() {
  await requireAdmin();

  const signals = await prisma.signalQuestion.findMany({
    orderBy: { signalNumber: "desc" },
    include: { votes: { select: { id: true } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Signal Management" description="Create and manage Signal questions.">
        <Button asChild>
          <Link href="/admin/signal/new">
            <Plus className="mr-2 size-4" />
            New Signal
          </Link>
        </Button>
      </PageHeader>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">#</TableHead>
            <TableHead>Question</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Votes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {signals.map((signal) => (
            <TableRow key={signal.id}>
              <TableCell className="font-bold">{signal.signalNumber}</TableCell>
              <TableCell>
                <Link
                  href={`/admin/signal/${signal.signalNumber}`}
                  className="hover:underline line-clamp-1"
                >
                  {signal.question}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {SIGNAL_CATEGORY_LABELS[signal.category]}
              </TableCell>
              <TableCell>
                <SignalStatusBadge status={signal.status} />
              </TableCell>
              <TableCell className="text-right">{signal.votes.length}</TableCell>
            </TableRow>
          ))}
          {signals.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                No signals yet. Create your first one.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
