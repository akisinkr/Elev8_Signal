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
  groupConsensus: { en: "Group Consensus", kr: "그룹의 선택" },
  noVote: { en: "No vote", kr: "투표 없음" },
  ofVotes: { en: "of votes", kr: "득표" },
  votes: { en: "votes", kr: "표" },
  withMajority: { en: "You're with the majority.", kr: "과반의 리더와 같은 관점입니다." },
  boldPick: { en: "Bold pick.", kr: "과감한 선택." },
  choseThis: { en: "chose this.", kr: "명만 같은 관점입니다." },
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

  // Results client — state cards
  loadingResults: { en: "Loading results...", kr: "결과를 불러오는 중..." },
  signalClosed: { en: "This Signal has closed", kr: "이번 Signal은 마감되었습니다" },
  signalClosedBody: { en: "Stay tuned for the next one — your vote unlocks exclusive peer insights!", kr: "다음 Signal도 함께해 주세요 — 참여하시면 리더들의 생각을 직접 확인하실 수 있습니다." },
  viewPastResults: { en: "View Past Results", kr: "지난 결과 보기" },
  membersOnly: { en: "This Conversation is Members-Only", kr: "멤버 전용 대화입니다" },
  membersOnlyDesc: { en: "Elev8 Signal captures what senior leaders actually think — unfiltered, anonymous, and only available to vetted members. Want in?", kr: "Elev8 Signal은 시니어 테크 리더들의 솔직한 생각을 담습니다 — 검증된 멤버만 참여할 수 있습니다. 관심이 있으신가요?" },
  requestAccess: { en: "Request Access", kr: "멤버십 신청하기" },
  archive: { en: "Archive", kr: "아카이브" },

  // Suggest question
  suggestShapeNext: { en: "Shape the next Signal", kr: "다음 Signal을 만들어보세요" },
  suggestSubtitle: { en: "Suggest a question that matters to you — your peers will vote on it", kr: "지금 가장 궁금한 질문을 제안하면, 동료 리더들이 직접 답합니다" },
  suggestCTA: { en: "Submit a question", kr: "질문 제안하기" },
  suggestTitle: { en: "Suggest a Question", kr: "질문 제안하기" },
  suggestQuestionLabel: { en: "Your question", kr: "제안하실 질문" },
  suggestQuestionPlaceholder: { en: "What would you like to ask other senior leaders?", kr: "다른 시니어 리더들에게 묻고 싶은 것을 적어주세요." },
  suggestWhyLabel: { en: "Why does this matter?", kr: "왜 지금 중요한가요?" },
  suggestWhyOptional: { en: "optional", kr: "선택사항" },
  suggestWhyPlaceholder: { en: "Brief context on why this is relevant right now...", kr: "지금 이 질문이 중요한 이유를 간략히 알려주세요..." },
  suggestCancel: { en: "Cancel", kr: "취소" },
  suggestSubmit: { en: "Submit Question", kr: "제출하기" },
  suggestSubmitting: { en: "Submitting...", kr: "제출 중..." },
  suggestThanks: { en: "Thanks for your suggestion!", kr: "질문을 제안해 주셔서 감사합니다." },
  suggestThanksBody: { en: "We'll review it and may include it in a future Signal.", kr: "검토 후 향후 Signal에 반영될 수 있습니다." },
} as const;

type TranslationKey = keyof typeof translations;

export function tr(key: TranslationKey, lang: Lang): string {
  return translations[key][lang];
}
