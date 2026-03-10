import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { SignalStatusBadge } from "@/components/signal/signal-status-badge";
import { SignalCreateDialog } from "@/components/admin/signal/signal-create-dialog";
import { SignalListActions } from "@/components/admin/signal/signal-list-actions";
import { SignalSuggestionsTable } from "@/components/admin/signal/signal-suggestions-table";
import { AiSignalSuggestions } from "@/components/admin/signal/ai-signal-suggestions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SIGNAL_CATEGORY_LABELS } from "@/lib/signal-constants";
import { BarChart3, Radio, Users, Lightbulb, BookOpen } from "lucide-react";

export default async function AdminSignalPage() {
  await requireAdmin();

  const [signals, totalMembers, pendingSuggestions, approvedSuggestions, aiSuggestions] = await Promise.all([
    prisma.signalQuestion.findMany({
      orderBy: { signalNumber: "desc" },
      include: { votes: { select: { id: true } } },
    }),
    prisma.member.count(),
    prisma.signalSuggestion.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.signalSuggestion.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.aiSignalSuggestion.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const draftSignals = signals.filter((s) => s.status === "DRAFT");
  const activeSignals = signals.filter((s) => s.status !== "DRAFT");
  const liveSignal = signals.find((s) => s.status === "LIVE");
  const totalSignals = activeSignals.length;

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

      {/* AI-Generated Suggestions */}
      <AiSignalSuggestions
        initialSuggestions={aiSuggestions.map((s) => ({
          id: s.id,
          question: s.question,
          questionKr: s.questionKr,
          optionA: s.optionA,
          optionB: s.optionB,
          optionC: s.optionC,
          optionD: s.optionD,
          optionE: s.optionE,
          rationale: s.rationale,
          sourceThemes: s.sourceThemes,
          status: s.status,
          createdAt: s.createdAt.toISOString(),
        }))}
      />

      {/* Member Suggestions */}
      {(pendingSuggestions.length > 0 || approvedSuggestions.length > 0) && (
        <div id="suggestions" className="space-y-3 scroll-mt-8">
          <div className="flex items-center gap-2">
            <Lightbulb className="size-4 text-amber-500" />
            <h2 className="text-lg font-semibold">Suggestions</h2>
          </div>
          <SignalSuggestionsTable
            pendingSuggestions={pendingSuggestions.map((s) => ({
              id: s.id,
              rawQuestion: s.rawQuestion,
              context: s.context,
              status: s.status,
              polishedQuestion: s.polishedQuestion,
              suggestedOptions: s.suggestedOptions,
              createdAt: s.createdAt.toISOString(),
            }))}
            approvedSuggestions={approvedSuggestions.map((s) => ({
              id: s.id,
              rawQuestion: s.rawQuestion,
              context: s.context,
              status: s.status,
              polishedQuestion: s.polishedQuestion,
              suggestedOptions: s.suggestedOptions,
              createdAt: s.createdAt.toISOString(),
            }))}
          />
        </div>
      )}

      {/* Question Bank (Drafts) */}
      {draftSignals.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-primary" />
            <h2 className="text-lg font-semibold">Question Bank</h2>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {draftSignals.length} ready
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Bilingual questions ready to activate. Click "Go Live" to set a deadline and launch.
          </p>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Korean</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {draftSignals.map((signal) => (
                  <TableRow key={signal.id}>
                    <TableCell className="font-bold text-muted-foreground">
                      #{signal.signalNumber}
                    </TableCell>
                    <TableCell className="max-w-[320px]">
                      <span className="line-clamp-1">{signal.question}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {SIGNAL_CATEGORY_LABELS[signal.category]}
                    </TableCell>
                    <TableCell>
                      {signal.questionKr ? (
                        <span className="text-xs text-green-500 font-medium">✓ KR</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">— EN only</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <SignalListActions
                        signalNumber={signal.signalNumber}
                        status={signal.status}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Signal List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Signals</h2>
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
              {activeSignals.map((signal) => (
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
              {activeSignals.length === 0 && (
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
    </div>
  );
}
