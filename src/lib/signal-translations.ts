export type Lang = "en" | "kr";

const translations = {
  // Results page
  signalResults: { en: "Results", kr: "결과" },
  resultsNotAvailable: { en: "Results not yet available", kr: "아직 결과가 공개되지 않았습니다" },
  resultsWillBeShared: { en: "Results will be shared once voting closes.", kr: "투표가 마감되면 결과가 공유됩니다." },
  castYourVote: { en: "Cast your vote now", kr: "지금 투표하기" },
  welcomeToSignal: { en: "Welcome to Elev8 Signal", kr: "Elev8 Signal에 오신 것을 환영합니다" },
  yourEmail: { en: "Your email", kr: "이메일" },
  continue: { en: "Continue", kr: "계속하기" },
  loading: { en: "Loading...", kr: "로딩 중..." },

  // Insight
  signalInsight: { en: "Exclusive Elev8 Insight", kr: "Elev8 리더 인사이트" },
  elev8MembersOnly: { en: "For Elev8 members only", kr: "Elev8 멤버 전용" },

  // Your vs Group
  yourPick: { en: "Your Pick", kr: "나의 선택" },
  groupConsensus: { en: "Group Consensus", kr: "그룹 컨센서스" },
  noVote: { en: "No vote", kr: "투표 없음" },
  ofVotes: { en: "of votes", kr: "득표" },
  votes: { en: "votes", kr: "표" },
  withMajority: { en: "You're with the majority.", kr: "다수와 같은 선택을 하셨습니다." },
  boldPick: { en: "Bold pick.", kr: "과감한 선택." },
  choseThis: { en: "chose this.", kr: "만 이 선택을 했습니다." },
  closeCall: { en: "Close call — your pick was a strong contender.", kr: "접전이었습니다 — 당신의 선택도 강력한 후보였습니다." },
  differentDirection: { en: "You went a different direction than the group.", kr: "그룹과는 다른 방향을 선택하셨습니다." },

  // Results bars
  leadersWeighedIn: { en: "leaders weighed in", kr: "명의 리더가 참여" },
  leaderWeighedIn: { en: "leader weighed in", kr: "명의 리더가 참여" },
  you: { en: "You", kr: "나" },

  // Peer quotes
  peerPerspectives: { en: "Peer Perspectives", kr: "동료 리더들의 시각" },

  // Share card
  shareYourInsight: { en: "Share Your Insight", kr: "인사이트 공유하기" },
  youChose: { en: "You chose", kr: "나의 선택" },
  leaders: { en: "leaders", kr: "리더" },
  choseYourAnswer: { en: "chose your answer", kr: "가 같은 선택" },

  // Distribution
  voteDistribution: { en: "Vote Distribution", kr: "투표 분포" },
  detailedBreakdown: { en: "Detailed Breakdown", kr: "상세 분석" },
} as const;

type TranslationKey = keyof typeof translations;

export function tr(key: TranslationKey, lang: Lang): string {
  return translations[key][lang];
}
