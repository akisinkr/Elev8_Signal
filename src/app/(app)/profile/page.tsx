import { getCurrentMember } from "@/lib/auth";
import { getMemberSession } from "@/lib/member-auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { MemberCardForm } from "@/components/member-card/member-card-form";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email: emailParam } = await searchParams;

  let member = null;

  // 1. Direct email lookup (most reliable — used by signal→profile flow)
  if (emailParam) {
    member = await prisma.member.findUnique({
      where: { email: emailParam.toLowerCase() },
    });
  }

  // 2. OTP session cookie
  if (!member) {
    try { member = await getMemberSession(); } catch { /* ignore */ }
  }

  // 3. Clerk auth (for members who sign in via Clerk — wrapped in case of key errors)
  if (!member) {
    try { member = await getCurrentMember(); } catch { /* ignore */ }
  }

  if (!member) {
    redirect("/signal");
  }

  return (
    <div className="max-w-lg mx-auto py-8">
      <div id="profile-page-header" className="mb-8 pb-6 border-b border-white/[0.06]">
        <p className="text-[10px] tracking-[0.2em] text-white/25 uppercase mb-3">
          Your Elev8 Profile
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-white/90">
          {member.firstName}, let&apos;s build your profile
        </h1>
        <p className="text-[12px] text-white/35 mt-2">
          Share your superpower, earn Elev8 Titles, connect with peers.
        </p>
      </div>
      <MemberCardForm
        member={{
          id: member.id,
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          imageUrl: member.imageUrl,
          customPhotoUrl: member.customPhotoUrl,
          headline: member.headline,
          company: member.company,
          jobTitle: member.jobTitle,
          linkedinUrl: member.linkedinUrl,
          memberNumber: member.memberNumber,
          knownFor: member.knownFor,
          superpowers: member.superpowers,
          superpowerDetails: member.superpowerDetails,
          challenges: member.challenges,
          challengeDetails: member.challengeDetails,
          dreamConnection: member.dreamConnection,
          dreamConnectionRefined: member.dreamConnectionRefined,
          preferredLang: member.preferredLang,
          superpowersKr: member.superpowersKr,
          superpowerDetailsKr: member.superpowerDetailsKr,
          challengesKr: member.challengesKr,
          challengeDetailsKr: member.challengeDetailsKr,
          dreamConnectionKr: member.dreamConnectionKr,
          dreamConnectionRefinedKr: member.dreamConnectionRefinedKr,
          cardCompletedAt: member.cardCompletedAt?.toISOString() ?? null,
          createdAt: member.createdAt.toISOString(),
          // 5-dimension fields
          spDomain: member.spDomain,
          spAction: member.spAction,
          spScale: member.spScale,
          spStage: member.spStage,
          spGeo: member.spGeo,
          spDomainCustom: member.spDomainCustom,
          spActionCustom: member.spActionCustom,
          // typed challenges
          challengeType1: member.challengeType1,
          challengeSpec1: member.challengeSpec1,
          challengeType2: member.challengeType2,
          challengeSpec2: member.challengeSpec2,
          // Elev8 Titles
          elev8Titles: member.elev8Titles,
          // Living credential fields
          superpowerUpdatedAt: member.superpowerUpdatedAt?.toISOString() ?? null,
          peerRecognitionCount: member.peerRecognitionCount,
          lastActiveAt: member.lastActiveAt?.toISOString() ?? null,
          superpowerHistory: member.superpowerHistory,
        }}
      />
    </div>
  );
}
