import { notFound, redirect } from "next/navigation";
import { getSignalByNumber } from "@/lib/signal";
import { getMemberSession } from "@/lib/member-auth";
import { prisma } from "@/lib/db";
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

  // Check if user already authenticated via OTP session
  const member = await getMemberSession();

  const alreadyVoted = member
    ? !!(await prisma.signalVote.findFirst({
        where: { questionId: signal.id, memberId: member.id },
        select: { id: true },
      }))
    : false;

  const options = [
    { key: "A", label: signal.optionA, labelKr: signal.optionAKr ?? undefined },
    { key: "B", label: signal.optionB, labelKr: signal.optionBKr ?? undefined },
    { key: "C", label: signal.optionC, labelKr: signal.optionCKr ?? undefined },
    { key: "D", label: signal.optionD, labelKr: signal.optionDKr ?? undefined },
    { key: "E", label: signal.optionE, labelKr: signal.optionEKr ?? undefined },
  ];

  return (
    <div className="-mx-4 sm:-mx-6 -mt-8">
      <VoteFormWrapper
        signalNumber={signal.signalNumber}
        question={signal.question}
        questionKr={signal.questionKr ?? undefined}
        options={options}
        deadline={signal.voteDeadline?.toISOString() ?? null}
        signalStatus={signal.status}
        memberEmail={member?.email}
        alreadyVoted={alreadyVoted}
      />
    </div>
  );
}
