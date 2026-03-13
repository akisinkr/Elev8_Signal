import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { MembersTable } from "@/components/admin/members-table";

export default async function AdminMembersPage() {
  await requireAdmin();

  const members = await prisma.member.findMany({
    where: { role: "MEMBER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      imageUrl: true,
      company: true,
      jobTitle: true,
      superpowers: true,
      challenges: true,
      dreamConnection: true,
      cardCompletedAt: true,
      createdAt: true,
      linkedinUrl: true,
      xrayProfiles: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { status: true },
      },
    },
  });

  const totalMembers = members.length;
  const cardsCompleted = members.filter((m) => m.cardCompletedAt).length;

  return (
    <div>
      <PageHeader
        title="Members"
        description={`${totalMembers} members · ${cardsCompleted} cards completed`}
      />
      <MembersTable
        members={members.map((m) => ({
          ...m,
          cardCompletedAt: m.cardCompletedAt?.toISOString() ?? null,
          createdAt: m.createdAt.toISOString(),
          xrayStatus: m.xrayProfiles[0]?.status ?? null,
        }))}
      />
    </div>
  );
}
