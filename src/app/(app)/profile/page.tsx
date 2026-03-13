import { getCurrentMember } from "@/lib/auth";
import { getMemberSession } from "@/lib/member-auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { MemberCardForm } from "@/components/member-card/member-card-form";

export const dynamic = "force-dynamic";

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

  const [confidenceScore, xrayProfile] = await Promise.all([
    prisma.confidenceScore.findUnique({ where: { memberId: member.id } }),
    prisma.xrayProfile.findFirst({ where: { memberId: member.id }, orderBy: { createdAt: "desc" }, select: { status: true, summary: true, analyzedAt: true } }),
  ]);

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

      {/* Confidence Score */}
      {confidenceScore && (
        <div className="mb-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold tracking-[0.2em] text-amber-400/60 uppercase">Confidence Score</span>
            <span className="text-2xl font-bold text-white/80">{Math.round(confidenceScore.composite)}</span>
          </div>
          <div className="space-y-1.5">
            {[
              { label: "Self-declared", value: confidenceScore.selfDeclared, max: 30 },
              { label: "Xray-verified", value: confidenceScore.xrayVerified, max: 40 },
              { label: "Peer-validated", value: confidenceScore.peerValidated, max: 30 },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="text-[10px] text-white/30 w-24 shrink-0">{s.label}</span>
                <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400/40 rounded-full" style={{ width: `${s.max > 0 ? Math.min((s.value / s.max) * 100, 100) : 0}%` }} />
                </div>
                <span className="text-[10px] text-white/30 w-8 text-right">{Math.round(s.value)}</span>
              </div>
            ))}
          </div>
          {member.peerRecognitionCount > 0 && (
            <p className="text-[11px] text-white/25 mt-3">
              {member.peerRecognitionCount} peer recommendation{member.peerRecognitionCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}

      {/* Xray Status */}
      {xrayProfile && (
        <div className="mb-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold tracking-[0.2em] text-blue-400/60 uppercase">Xray Analysis</span>
            {xrayProfile.status === "PROCESSING" && (
              <span className="text-[10px] text-amber-400/70 animate-pulse">Processing...</span>
            )}
            {xrayProfile.status === "COMPLETED" && (
              <span className="text-[10px] text-emerald-400/70">Completed</span>
            )}
            {xrayProfile.status === "FAILED" && (
              <span className="text-[10px] text-red-400/70">Failed</span>
            )}
          </div>
          {xrayProfile.status === "COMPLETED" && xrayProfile.summary && (
            <p className="text-[11px] text-white/30 mt-2 leading-relaxed">{xrayProfile.summary}</p>
          )}
        </div>
      )}

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
