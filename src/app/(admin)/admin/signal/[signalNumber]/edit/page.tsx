import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { ArrowLeft } from "lucide-react";
import { EditSignalFormWrapper } from "./edit-signal-form-wrapper";

export default async function EditSignalPage({
  params,
}: {
  params: Promise<{ signalNumber: string }>;
}) {
  await requireAdmin();
  const { signalNumber } = await params;
  const num = parseInt(signalNumber, 10);

  if (isNaN(num)) notFound();

  const signal = await prisma.signalQuestion.findUnique({
    where: { signalNumber: num },
  });

  if (!signal) notFound();

  return (
    <div className="space-y-8">
      <Link
        href={`/admin/signal/${signal.signalNumber}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Signal #{signal.signalNumber}
      </Link>

      <PageHeader title={`Edit Signal #${signal.signalNumber}`} />

      <EditSignalFormWrapper
        signalNumber={signal.signalNumber}
        initialData={{
          question: signal.question,
          optionA: signal.optionA,
          optionB: signal.optionB,
          optionC: signal.optionC,
          optionD: signal.optionD,
          optionE: signal.optionE,
          category: signal.category,
          voteDeadline: signal.voteDeadline
            ? signal.voteDeadline.toISOString().split("T")[0]
            : "",
          questionKr: signal.questionKr ?? "",
          optionAKr: signal.optionAKr ?? "",
          optionBKr: signal.optionBKr ?? "",
          optionCKr: signal.optionCKr ?? "",
          optionDKr: signal.optionDKr ?? "",
          optionEKr: signal.optionEKr ?? "",
        }}
      />
    </div>
  );
}
