import { notFound, redirect } from "next/navigation";
import { requireMember } from "@/lib/auth";
import { getSignalByNumber, getMemberVote } from "@/lib/signal";
import { VoteFormWrapper } from "./vote-form-wrapper";

export default async function VotePage({
  params,
}: {
  params: Promise<{ signalNumber: string }>;
}) {
  const member = await requireMember();
  const { signalNumber } = await params;
  const num = parseInt(signalNumber, 10);

  if (isNaN(num)) notFound();

  const signal = await getSignalByNumber(num);
  if (!signal) notFound();

  if (signal.status !== "LIVE") {
    redirect(`/signal/${num}`);
  }

  const existingVote = await getMemberVote(signal.id, member.id);
  if (existingVote) {
    redirect(`/signal/${num}`);
  }

  const options = [
    { key: "A", label: signal.optionA },
    { key: "B", label: signal.optionB },
    { key: "C", label: signal.optionC },
    { key: "D", label: signal.optionD },
    { key: "E", label: signal.optionE },
  ];

  return (
    <div className="-mx-4 sm:-mx-6 -mt-8">
      <VoteFormWrapper
        signalNumber={signal.signalNumber}
        question={signal.question}
        options={options}
        deadline={signal.voteDeadline?.toISOString() ?? null}
      />
    </div>
  );
}
