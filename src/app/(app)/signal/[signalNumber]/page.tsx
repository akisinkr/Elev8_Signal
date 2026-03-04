import { notFound } from "next/navigation";
import { getSignalByNumber } from "@/lib/signal";
import { SignalResultsClient } from "./signal-results-client";

export default async function SignalResultsPage({
  params,
}: {
  params: Promise<{ signalNumber: string }>;
}) {
  const { signalNumber } = await params;
  const num = parseInt(signalNumber, 10);

  if (isNaN(num)) notFound();

  const signal = await getSignalByNumber(num);
  if (!signal) notFound();

  const options = [
    { key: "A", label: signal.optionA },
    { key: "B", label: signal.optionB },
    { key: "C", label: signal.optionC },
    { key: "D", label: signal.optionD },
    { key: "E", label: signal.optionE },
  ];

  return (
    <SignalResultsClient
      signalNumber={num}
      question={signal.question}
      status={signal.status}
      headlineInsight={signal.headlineInsight}
      options={options}
    />
  );
}
