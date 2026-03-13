import { redirect } from "next/navigation";
import { requireMember } from "@/lib/auth";
import { MemberCardForm } from "@/components/member-card/member-card-form";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const member = await requireMember();

  if (member.onboardingState === "COMPLETED") {
    redirect("/dashboard");
  }

  // Serialize member data for the client component
  const memberData = {
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    imageUrl: member.imageUrl,
    customPhotoUrl: member.customPhotoUrl,
    company: member.company,
    jobTitle: member.jobTitle,
    linkedinUrl: member.linkedinUrl,
    memberNumber: member.memberNumber,
    knownFor: member.knownFor,
    headline: member.headline,
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
    spDomain: member.spDomain,
    spAction: member.spAction,
    spScale: member.spScale,
    spStage: member.spStage,
    spGeo: member.spGeo,
    spDomainCustom: member.spDomainCustom,
    spActionCustom: member.spActionCustom,
    challengeType1: member.challengeType1,
    challengeSpec1: member.challengeSpec1,
    challengeType2: member.challengeType2,
    challengeSpec2: member.challengeSpec2,
    knownForDetail: member.knownForDetail,
    adviceSeeking: member.adviceSeeking,
    passionTopic: member.passionTopic,
    elev8Titles: member.elev8Titles,
    superpowerUpdatedAt: member.superpowerUpdatedAt?.toISOString() ?? null,
    peerRecognitionCount: member.peerRecognitionCount,
    lastActiveAt: member.lastActiveAt?.toISOString() ?? null,
    superpowerHistory: member.superpowerHistory,
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <MemberCardForm member={memberData} onboarding />
      </div>
    </div>
  );
}
