import { notFound, redirect } from "next/navigation";
import { getSignalByNumber } from "@/lib/signal";
import { VoteFormWrapper } from "./vote-form-wrapper";

export default async function VotePage({
  params,
}: {
  params: Promise<{ signalNumber: string }>;
}) {
  const { signalNumber } = await params;
  const num = parseInt(signalNumber, 10);

  if (isNaN(num)) notFound();

  const signal = await getSignalByNumber(num);
  if (!signal) notFound();

  if (signal.status !== "LIVE" && signal.status !== "PUBLISHED" && signal.status !== "CLOSED") {
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
        signalStatus={signal.status}
      />
    </div>
  );
}
