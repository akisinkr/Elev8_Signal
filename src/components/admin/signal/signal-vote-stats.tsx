import { Check, Minus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Vote {
  answer: string;
  memberName: string;
  why: string | null;
  createdAt: string;
  resultEmailSentAt: string | null;
}

interface DistributionItem {
  answer: string;
  label: string;
  count: number;
  percentage: number;
}

interface SignalVoteStatsProps {
  votes: Vote[];
  distribution: DistributionItem[];
}

export function SignalVoteStats({ votes, distribution }: SignalVoteStatsProps) {
  const totalVotes = votes.length;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-semibold">Individual Votes</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Answer</TableHead>
              <TableHead>Why</TableHead>
              <TableHead>Voted At</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {votes.map((vote, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">
                  {vote.memberName}
                </TableCell>
                <TableCell>{vote.answer}</TableCell>
                <TableCell className="max-w-[300px] truncate text-muted-foreground">
                  {vote.why ?? "--"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(vote.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {vote.resultEmailSentAt ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                      <Check className="size-3.5" />
                      Sent
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Minus className="size-3.5" />
                      Not sent
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {votes.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-8"
                >
                  No votes yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Anonymous quotes preview (what members see) */}
      {votes.some((v) => v.why) && (
        <div>
          <h3 className="mb-3 text-sm font-semibold">Anonymous Quotes Preview</h3>
          <div className="space-y-2">
            {votes
              .filter((v) => v.why)
              .slice(0, 5)
              .map((vote, i) => (
                <blockquote
                  key={i}
                  className="rounded-lg border-l-2 border-primary/40 bg-muted/50 px-4 py-3 text-sm text-foreground"
                >
                  &ldquo;{vote.why}&rdquo;
                </blockquote>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
