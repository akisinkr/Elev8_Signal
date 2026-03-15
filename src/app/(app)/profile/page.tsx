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

  const scoreValue = confidenceScore ? Math.round(confidenceScore.composite) : 0;
  const hasCard = !!member.cardCompletedAt;

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      {/* Page header — minimal for completed cards, guiding for new */}
      <div id="profile-page-header" className={hasCard ? "mb-6" : "mb-10 text-center"}>
        {hasCard ? (
          <p className="text-[10px] tracking-[0.2em] text-[#C8A84E]/40 uppercase">
            Your Profile
          </p>
        ) : (
          <>
            <p className="text-[10px] tracking-[0.2em] text-[#C8A84E]/50 uppercase mb-3">
              Build Your Profile
            </p>
            <h1 className="text-2xl font-light tracking-tight text-white">
              {member.firstName}, let&apos;s get started
            </h1>
            <p className="text-[13px] text-white/35 mt-2 max-w-sm mx-auto">
              Share your superpower so other leaders can find you.
            </p>
          </>
        )}
      </div>

      {/* Member Card Form — the hero */}
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
          spGeoCustom: member.spGeoCustom,
          // typed challenges
          challengeType1: member.challengeType1,
          challengeSpec1: member.challengeSpec1,
          challengeType2: member.challengeType2,
          challengeSpec2: member.challengeSpec2,
          knownForDetail: member.knownForDetail,
          adviceSeeking: member.adviceSeeking,
          passionTopic: member.passionTopic,
          // Elev8 Titles
          elev8Titles: member.elev8Titles,
          // Living credential fields
          superpowerUpdatedAt: member.superpowerUpdatedAt?.toISOString() ?? null,
          peerRecognitionCount: member.peerRecognitionCount,
          lastActiveAt: member.lastActiveAt?.toISOString() ?? null,
          superpowerHistory: member.superpowerHistory,
        }}
      />

      {/* Below-the-card sections — hidden during wizard editing, shown on "done" step */}
      {(confidenceScore || xrayProfile) && (
        <div id="profile-extras" className="mt-10 pt-8 border-t border-white/[0.04] space-y-6">

          {/* Confidence Score — compact */}
          {confidenceScore && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center gap-4">
                {/* Score ring */}
                <div className="relative flex size-14 shrink-0 items-center justify-center">
                  <svg className="size-14 -rotate-90" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                    <circle cx="28" cy="28" r="24" fill="none" stroke="#C8A84E" strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={`${(scoreValue / 100) * 150.8} 150.8`} opacity="0.6" />
                  </svg>
                  <span className="absolute text-sm font-medium text-white/80 tabular-nums">{scoreValue}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium tracking-[0.15em] text-[#C8A84E]/50 uppercase mb-1">
                    Confidence Score
                  </p>
                  <p className="text-[11px] text-white/30 leading-relaxed">
                    Helps us find your best matches.<br />Grows as you build your profile and connect with peers.
                  </p>
                </div>
              </div>

              <details className="group mt-4">
                <summary className="text-[10px] text-white/20 hover:text-white/40 cursor-pointer transition-colors select-none flex items-center gap-1">
                  <svg className="size-3 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                  Score breakdown
                </summary>
                <div className="mt-3 space-y-2 pl-4">
                  {[
                    { label: "Profile completeness", value: confidenceScore.selfDeclared, max: 30 },
                    { label: "AI-verified background", value: confidenceScore.xrayVerified, max: 40 },
                    { label: "Peer recognition", value: confidenceScore.peerValidated, max: 30 },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-3">
                      <span className="text-[10px] text-white/30 w-32 shrink-0">{s.label}</span>
                      <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className="h-full bg-[#C8A84E]/40 rounded-full" style={{ width: `${s.max > 0 ? Math.min((s.value / s.max) * 100, 100) : 0}%` }} />
                      </div>
                      <span className="text-[10px] text-white/25 w-6 text-right tabular-nums">{Math.round(s.value)}</span>
                    </div>
                  ))}
                  {member.peerRecognitionCount > 0 && (
                    <p className="text-[10px] text-white/25 mt-1">
                      {member.peerRecognitionCount} peer recommendation{member.peerRecognitionCount !== 1 ? "s" : ""} received
                    </p>
                  )}
                  <p className="text-[10px] text-white/15 mt-2">Only visible to you.</p>
                </div>
              </details>
            </div>
          )}

          {/* Xray Analysis — collapsible */}
          {xrayProfile && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer select-none">
                  <svg className="size-3.5 text-[#C8A84E]/40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                  <span className="text-[10px] font-medium tracking-[0.15em] text-[#C8A84E]/50 uppercase flex-1">
                    AI Analysis
                  </span>
                  {xrayProfile.status === "PROCESSING" && (
                    <span className="text-[10px] text-[#C8A84E]/60 animate-pulse">Processing...</span>
                  )}
                  {xrayProfile.status === "COMPLETED" && (
                    <svg className="size-3 text-white/20 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  )}
                  {xrayProfile.status === "FAILED" && (
                    <span className="text-[10px] text-red-400/50">Unavailable</span>
                  )}
                </summary>
                {xrayProfile.status === "COMPLETED" && xrayProfile.summary && (
                  <p className="text-[11px] text-white/30 leading-relaxed mt-3 pl-5">{xrayProfile.summary}</p>
                )}
              </details>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
