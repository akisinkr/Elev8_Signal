import { requireMember } from "@/lib/auth";
import { MemberCardForm } from "@/components/member-card/member-card-form";

export default async function ProfilePage() {
  const member = await requireMember();

  return (
    <div className="max-w-lg mx-auto py-8">
      <div id="profile-page-header" className="mb-8 pb-6 border-b border-white/[0.06]">
        <p className="text-[10px] tracking-[0.2em] text-white/25 uppercase mb-3">
          Your Elev8 Profile
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-white/90">
          {member.firstName}, let&apos;s build your profile
        </h1>
        <p className="text-sm text-white/45 mt-2 leading-relaxed">
          Share your superpower, earn Elev8 Titles, and connect with
          the right peers who need exactly what you bring.
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
        }}
      />
    </div>
  );
}
