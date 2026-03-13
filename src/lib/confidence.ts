import { prisma } from "@/lib/db";

/**
 * Confidence Score: 3-layer weighted blend (max 100)
 * - Self-declared: profileCompleteness * 0.3 (max 30)
 * - Xray-verified: xrayComposite * 0.4 (max 40, 0 if no Xray)
 * - Peer-validated: min(peerRecognitionCount * 5, 30) (max 30)
 */
export async function recalculateConfidence(memberId: string) {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: {
      company: true, jobTitle: true, linkedinUrl: true,
      spDomain: true, spAction: true, spScale: true, spStage: true, spGeo: true,
      challengeType1: true, challengeSpec1: true,
      peerRecognitionCount: true,
    },
  });

  if (!member) return null;

  // Self-declared layer: profile completeness
  const fields = [
    member.company, member.jobTitle, member.linkedinUrl,
    member.spDomain, member.spAction, member.spScale, member.spStage, member.spGeo,
    member.challengeType1, member.challengeSpec1,
  ];
  const completeness = Math.round((fields.filter(Boolean).length / fields.length) * 100);
  const selfDeclared = completeness * 0.3;

  // Xray-verified layer
  const xray = await prisma.xrayProfile.findFirst({
    where: { memberId, status: "COMPLETED" },
    include: { bucketScores: true },
    orderBy: { analyzedAt: "desc" },
  });
  let xrayVerified = 0;
  if (xray && xray.bucketScores.length > 0) {
    const avg = xray.bucketScores.reduce((sum, b) => sum + b.score, 0) / xray.bucketScores.length;
    xrayVerified = (avg / 100) * 40;
  }

  // Peer-validated layer
  const peerValidated = Math.min(member.peerRecognitionCount * 5, 30);

  const composite = selfDeclared + xrayVerified + peerValidated;

  const score = await prisma.confidenceScore.upsert({
    where: { memberId },
    create: { memberId, selfDeclared, xrayVerified, peerValidated, composite },
    update: { selfDeclared, xrayVerified, peerValidated, composite },
  });

  return score;
}
