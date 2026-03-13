import { requireMember } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { ExchangeChat } from "@/components/exchange/exchange-chat";

export const dynamic = "force-dynamic";

export default async function ExchangePage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const member = await requireMember();
  const { matchId } = await params;

  const match = await prisma.match.findFirst({
    where: {
      id: matchId,
      OR: [{ member1Id: member.id }, { member2Id: member.id }],
    },
    include: {
      member1: {
        select: {
          id: true, firstName: true, lastName: true, imageUrl: true, customPhotoUrl: true,
          jobTitle: true, company: true, spDomain: true, spAction: true,
        },
      },
      member2: {
        select: {
          id: true, firstName: true, lastName: true, imageUrl: true, customPhotoUrl: true,
          jobTitle: true, company: true, spDomain: true, spAction: true,
        },
      },
      matchScore: true,
      messages: {
        include: { sender: { select: { id: true, firstName: true, lastName: true, imageUrl: true, customPhotoUrl: true } } },
        orderBy: { createdAt: "asc" },
      },
      exchangeFeedback: { where: { memberId: member.id } },
    },
  });

  if (!match) {
    redirect("/matches");
  }

  const partner = match.member1Id === member.id ? match.member2 : match.member1;
  const hasFeedback = match.exchangeFeedback.length > 0;

  const serializedMessages = match.messages.map(m => ({
    id: m.id,
    content: m.content,
    type: m.type,
    senderId: m.senderId,
    createdAt: m.createdAt.toISOString(),
    sender: m.sender,
  }));

  return (
    <ExchangeChat
      matchId={match.id}
      matchStatus={match.status}
      memberId={member.id}
      partner={partner}
      matchScore={match.matchScore ? {
        totalScore: match.matchScore.totalScore,
        tier: match.matchScore.tier,
        reasoning: match.matchScore.reasoning,
      } : null}
      initialMessages={serializedMessages}
      hasFeedback={hasFeedback}
    />
  );
}
