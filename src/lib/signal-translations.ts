export type Lang = "en" | "kr";

const translations = {
  // Results page
  signalResults: { en: "Results", kr: "결과" },
  resultsNotAvailable: { en: "Results unlock when voting closes", kr: "아직 결과가 공개되지 않았습니다" },
  resultsWillBeShared: { en: "Results will be shared once voting closes.", kr: "투표가 마감되면 결과를 공개합니다." },
  castYourVote: { en: "Add your perspective — voting closes soon", kr: "지금 투표하기" },
  welcomeToSignal: { en: "Welcome to Elev8 Signal", kr: "Elev8 Signal입니다" },
  yourEmail: { en: "Your email", kr: "이메일" },
  continue: { en: "Continue", kr: "계속하기" },
  loading: { en: "Loading...", kr: "로딩 중..." },

  // Insight
  signalInsight: { en: "Members-Only Intelligence", kr: "Elev8 리더 인사이트" },
  elev8MembersOnly: { en: "For Elev8 members only", kr: "Elev8 멤버 전용" },

  // Your vs Group
  yourPick: { en: "Your Pick", kr: "내 선택" },
  groupConsensus: { en: "How Leaders Voted", kr: "리더들의 선택" },
  noVote: { en: "No vote", kr: "투표 없음" },
  ofVotes: { en: "of votes", kr: "득표" },
  votes: { en: "votes", kr: "표" },
  withMajority: { en: "Your read matched the room.", kr: "과반수의 리더들과 같은 시각이에요." },
  boldPick: { en: "Bold pick.", kr: "과감한 선택." },
  choseThis: { en: "chose this.", kr: "명만 같은 선택을 했어요." },
  closeCall: { en: "Close call — your pick was a strong contender.", kr: "접전이었어요 — 나의 관점도 강한 지지를 받았습니다." },
  differentDirection: { en: "You called it differently. The sharpest exchanges often start here.", kr: "다수와는 다른 관점을 갖고 계시네요." },

  // Results bars
  leadersWeighedIn: { en: "leaders weighed in", kr: "명의 리더가 참여" },
  leaderWeighedIn: { en: "leader weighed in", kr: "명의 리더가 참여" },
  you: { en: "You", kr: "나" },

  // Peer quotes
  peerPerspectives: { en: "Peer Perspectives", kr: "동료 리더들의 시각" },

  // Share card
  shareYourInsight: { en: "Share Your Insight", kr: "인사이트 공유하기" },
  youChose: { en: "You chose", kr: "내 선택" },
  leaders: { en: "leaders", kr: "리더" },
  choseYourAnswer: { en: "chose your answer", kr: "가 같은 선택" },

  // Distribution
  voteDistribution: { en: "Vote Distribution", kr: "투표 분포" },
  detailedBreakdown: { en: "Detailed Breakdown", kr: "상세 분석" },

  // Results client — state cards
  loadingResults: { en: "Loading results...", kr: "결과를 불러오는 중..." },
  signalClosed: { en: "This Signal has closed", kr: "이번 Signal은 마감되었습니다" },
  signalClosedBody: { en: "Stay tuned for the next one — your vote unlocks exclusive peer insights!", kr: "다음 Signal에서 또 뵙겠습니다. 참여하실 때마다 리더들의 날것의 시각을 확인하실 수 있습니다." },
  viewPastResults: { en: "View Past Results", kr: "지난 결과 보기" },
  membersOnly: { en: "Built for vetted senior leaders.", kr: "검증된 시니어 리더들만의 공간입니다." },
  membersOnlyDesc: { en: "Elev8 Signal captures what senior leaders actually think — unfiltered, anonymous, and only available to vetted members. Want in?", kr: "Elev8 Signal은 검증된 시니어 테크 리더들의 솔직한 시각을 담습니다. 멤버십에 관심이 있으시다면 신청해 보세요." },
  requestAccess: { en: "Apply for Membership", kr: "멤버십 신청하기" },
  archive: { en: "Archive", kr: "아카이브" },

  // Suggest question
  suggestShapeNext: { en: "Shape the next Signal", kr: "다음 Signal의 주제를 직접 제안해요" },
  suggestSubtitle: { en: "Suggest a question that matters to you — your peers will vote on it", kr: "지금 가장 중요한 질문을 제안하면, 동료 리더들이 직접 답합니다" },
  suggestCTA: { en: "Submit a question", kr: "질문 제안하기" },
  suggestTitle: { en: "Suggest a Question", kr: "질문 제안하기" },
  suggestQuestionLabel: { en: "Your question", kr: "질문 내용" },
  suggestQuestionPlaceholder: { en: "What would you like to ask other senior leaders?", kr: "동료 리더들에게 묻고 싶은 질문을 입력해 주세요" },
  suggestWhyLabel: { en: "Why does this matter?", kr: "왜 지금 중요한가요?" },
  suggestWhyOptional: { en: "optional", kr: "선택사항" },
  suggestWhyPlaceholder: { en: "Brief context on why this is relevant right now...", kr: "지금 이 질문이 중요한 이유를 간략히 알려주세요..." },
  suggestCancel: { en: "Cancel", kr: "취소" },
  suggestSubmit: { en: "Submit Question", kr: "제출하기" },
  suggestSubmitting: { en: "Submitting...", kr: "제출 중..." },
  suggestThanks: { en: "Question received.", kr: "질문이 전달됐습니다." },
  suggestThanksBody: { en: "We'll review it and may include it in a future Signal.", kr: "검토 후 다음 Signal에 담길 수 있습니다." },
} as const;

type TranslationKey = keyof typeof translations;

export function tr(key: TranslationKey, lang: Lang): string {
  return translations[key][lang];
}
