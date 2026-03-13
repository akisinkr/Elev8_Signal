import { requireMember } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MatchesList } from "@/components/matches/matches-list";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const member = await requireMember();

  const matches = await prisma.match.findMany({
    where: {
      OR: [{ member1Id: member.id }, { member2Id: member.id }],
      status: { not: "PROPOSED" }, // Members don't see PROPOSED (curator-only)
    },
    include: {
      member1: {
        select: {
          id: true, firstName: true, lastName: true, imageUrl: true, customPhotoUrl: true,
          jobTitle: true, company: true, spDomain: true, spAction: true,
          challengeType1: true, challengeSpec1: true,
        },
      },
      member2: {
        select: {
          id: true, firstName: true, lastName: true, imageUrl: true, customPhotoUrl: true,
          jobTitle: true, company: true, spDomain: true, spAction: true,
          challengeType1: true, challengeSpec1: true,
        },
      },
      matchScore: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  const serialized = matches.map(m => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
    matchedAt: m.matchedAt?.toISOString() ?? null,
    presentedAt: m.presentedAt?.toISOString() ?? null,
    acceptedAt: m.acceptedAt?.toISOString() ?? null,
    completedAt: m.completedAt?.toISOString() ?? null,
    matchScore: m.matchScore ? {
      ...m.matchScore,
      createdAt: m.matchScore.createdAt.toISOString(),
    } : null,
    messages: m.messages.map(msg => ({
      ...msg,
      createdAt: msg.createdAt.toISOString(),
    })),
    member1: { ...m.member1 },
    member2: { ...m.member2 },
  }));

  return <MatchesList matches={serialized} memberId={member.id} />;
}
