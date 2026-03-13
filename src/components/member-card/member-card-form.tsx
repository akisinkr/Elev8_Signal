"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Pencil,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Linkedin,
  Camera,
  X,
  Users,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────

interface MemberData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string | null;
  customPhotoUrl: string | null;
  company: string | null;
  jobTitle: string | null;
  linkedinUrl: string | null;
  memberNumber: number | null;
  knownFor: string | null;
  headline: string | null;
  superpowers: string[];
  superpowerDetails: string[];
  challenges: string[];
  challengeDetails: string[];
  dreamConnection: string | null;
  dreamConnectionRefined: string | null;
  preferredLang: string;
  superpowersKr: string[];
  superpowerDetailsKr: string[];
  challengesKr: string[];
  challengeDetailsKr: string[];
  dreamConnectionKr: string | null;
  dreamConnectionRefinedKr: string | null;
  cardCompletedAt: string | null;
  createdAt: string;
  // 5-dimension fields
  spDomain: string | null;
  spAction: string | null;
  spScale: string | null;
  spStage: string | null;
  spGeo: string | null;
  spDomainCustom: string | null;
  spActionCustom: string | null;
  // typed challenges (deprecated)
  challengeType1: string | null;
  challengeSpec1: string | null;
  challengeType2: string | null;
  challengeSpec2: string | null;
  // conversational questions (Q1-Q3)
  knownForDetail: string | null;
  adviceSeeking: string | null;
  passionTopic: string | null;
  // Elev8 Titles
  elev8Titles: string[];
  // Living credential fields
  superpowerUpdatedAt: string | null;
  peerRecognitionCount: number;
  lastActiveAt: string | null;
  superpowerHistory: string[];
}

interface MemberCardFormProps {
  member: MemberData;
  onboarding?: boolean;
}

interface SuperpowerProfile {
  title: string;
  bullets: string[];
  proof: string;
}

interface MatchSuggestion {
  memberId: string;
  firstName: string;
  lastName: string;
  imageUrl: string | null;
  jobTitle: string | null;
  company: string | null;
  matchReason: string;
  matchedSuperpower: string;
  matchedChallenge: string;
}

// NEW: 4-step wizard (collapsed from 8)
type Step = "about" | "expertise" | "context" | "challenges" | "generate" | "refine" | "done";

// ─── 5-Dimension Options ─────────────────────────────────

const DOMAINS = [
  { id: "ai-ml", en: "AI & Machine Learning", kr: "AI & 머신러닝", descEn: "LLMs, computer vision, ML ops, training infra", descKr: "LLM, 컴퓨터 비전, ML 파이프라인" },
  { id: "data", en: "Data & Analytics", kr: "데이터 & 애널리틱스", descEn: "Data platforms, BI, analytics, data strategy", descKr: "데이터 플랫폼, BI, 분석 전략" },
  { id: "cloud", en: "Cloud & Infrastructure", kr: "클라우드 & 인프라", descEn: "Migration, Kubernetes, cost optimization, SRE", descKr: "마이그레이션, K8s, 비용 최적화" },
  { id: "security", en: "Cybersecurity", kr: "사이버보안", descEn: "AppSec, compliance, zero trust, incident response", descKr: "보안 아키텍처, 컴플라이언스, 제로 트러스트" },
  { id: "platform", en: "Platform Engineering & DevOps", kr: "플랫폼 엔지니어링 & DevOps", descEn: "Internal platforms, CI/CD, developer experience", descKr: "내부 플랫폼, CI/CD, 개발자 경험" },
  { id: "product", en: "Product & Growth Engineering", kr: "프로덕트 & 그로스 엔지니어링", descEn: "Product-led growth, experimentation, monetization", descKr: "PLG, 실험, 그로스 엔지니어링" },
  { id: "eng-leadership", en: "Engineering Leadership", kr: "엔지니어링 리더십", descEn: "Org design, hiring, team scaling, eng culture", descKr: "조직 설계, 채용, 팀 스케일링, 문화" },
  { id: "fintech", en: "FinTech & Digital Payments", kr: "핀테크 & 디지털 결제", descEn: "Payments, banking infra, regulatory tech", descKr: "결제, 뱅킹 인프라, 레그테크" },
  { id: "robotics", en: "Robotics & Physical AI", kr: "로보틱스 & 피지컬 AI", descEn: "Autonomous systems, hardware-software integration", descKr: "자율 시스템, HW-SW 통합" },
  { id: "other", en: "+ Other", kr: "+ 기타", descEn: "", descKr: "" },
];

const ACTIONS = [
  { id: "scaling", en: "Scaling Teams", kr: "팀 스케일링" },
  { id: "building", en: "Building from Zero", kr: "제로에서 구축" },
  { id: "architecture", en: "Architecture & System Design", kr: "아키텍처 & 시스템 설계" },
  { id: "migrating", en: "Migrating & Modernizing", kr: "마이그레이션 & 모더나이징" },
  { id: "optimizing", en: "Optimizing & Improving", kr: "최적화 & 개선" },
  { id: "org-design", en: "Org Design & Restructuring", kr: "조직 설계 & 구조개편" },
  { id: "gtm", en: "Launching & Go-to-Market", kr: "런칭 & 시장 진출" },
  { id: "hiring", en: "Hiring & Talent Strategy", kr: "채용 & 인재 전략" },
  { id: "compliance", en: "Compliance & Regulation", kr: "컴플라이언스 & 규제" },
  { id: "mna", en: "M&A & Integration", kr: "M&A & 통합" },
  { id: "crisis", en: "Crisis & Turnaround", kr: "위기관리 & 턴어라운드" },
  { id: "strategy", en: "Strategy & Roadmapping", kr: "전략 & 로드매핑" },
  { id: "custom", en: "+ Custom", kr: "+ 직접 입력" },
];

const SCALES = [
  { id: "small", en: "Solo / Small team (1-10)", kr: "개인 / 소규모 팀 (1-10명)" },
  { id: "mid", en: "Mid-size team (10-50)", kr: "중규모 팀 (10-50명)" },
  { id: "large", en: "Large team (50-200)", kr: "대규모 팀 (50-200명)" },
  { id: "org", en: "Organization (200-1000)", kr: "조직 단위 (200-1000명)" },
  { id: "enterprise", en: "Enterprise (1000+)", kr: "엔터프라이즈 (1000명+)" },
  { id: "portfolio", en: "Multi-entity / Portfolio", kr: "복수 법인 / 포트폴리오" },
];

const STAGES = [
  { id: "seed", en: "Pre-seed / Seed", kr: "프리시드 / 시드" },
  { id: "ab", en: "Series A-B", kr: "시리즈 A-B" },
  { id: "cd", en: "Series C-D", kr: "시리즈 C-D" },
  { id: "preipo", en: "Pre-IPO / Late stage", kr: "프리 IPO / 레이트 스테이지" },
  { id: "public", en: "Public company", kr: "상장사" },
  { id: "conglomerate", en: "Enterprise / Conglomerate", kr: "대기업 / 재벌그룹" },
];

const GEOS = [
  { id: "sv", en: "US — Silicon Valley / Bay Area", kr: "미국 — 실리콘밸리" },
  { id: "us-other", en: "US — Other", kr: "미국 — 기타 지역" },
  { id: "korea", en: "Korea", kr: "한국" },
  { id: "us-kr", en: "US ↔ Korea (Cross-border)", kr: "미국 ↔ 한국 (크로스보더)" },
  { id: "singapore", en: "Singapore", kr: "싱가포르" },
  { id: "japan", en: "Japan", kr: "일본" },
  { id: "india", en: "India", kr: "인도" },
  { id: "china", en: "China", kr: "중국" },
  { id: "apac", en: "APAC — Other", kr: "아시아태평양 — 기타" },
  { id: "global", en: "Global / Multi-region", kr: "글로벌 / 멀티리전" },
  { id: "geo-other", en: "+ Other", kr: "+ 기타" },
];

// ─── Challenge Types & Options ───────────────────────────

const CHALLENGE_TYPES = [
  { id: "technical", en: "Building something new", kr: "새로운 기술 도전", icon: "🔧" },
  { id: "leadership", en: "Leading through change", kr: "변화 속 리더십", icon: "👤" },
  { id: "org", en: "Navigating the org", kr: "조직 항해", icon: "🏢" },
  { id: "career", en: "Plotting next move", kr: "다음 커리어", icon: "🚀" },
  { id: "intro", en: "Finding the right person", kr: "적임자 찾기", icon: "🤝" },
];

const CHALLENGE_OPTIONS: Record<string, { en: string; kr: string }[]> = {
  technical: [
    { en: "AI ROI measurement", kr: "AI ROI 측정" },
    { en: "Build vs. buy for AI/ML stack", kr: "AI/ML 스택 자체개발 vs 구매" },
    { en: "Cloud cost management", kr: "클라우드 비용 관리" },
    { en: "Scaling from prototype to production", kr: "프로토타입에서 프로덕션으로 스케일링" },
    { en: "Legacy system modernization", kr: "레거시 시스템 모더나이제이션" },
    { en: "Data quality at scale", kr: "대규모 데이터 품질 관리" },
    { en: "Developer productivity measurement", kr: "개발자 생산성 측정" },
    { en: "Security compliance (Korea/US)", kr: "보안 컴플라이언스 (한국/미국)" },
    { en: "Other", kr: "기타 (직접 입력)" },
  ],
  leadership: [
    { en: "Managing up (CEO/Board communication)", kr: "상향 관리 (CEO/이사회 커뮤니케이션)" },
    { en: "Influencing without authority", kr: "권한 없이 영향력 행사하기" },
    { en: "Building trust with a new team", kr: "새 팀과 신뢰 구축" },
    { en: "Giving hard feedback / managing out", kr: "어려운 피드백 / 저성과자 관리" },
    { en: "Cross-cultural leadership", kr: "크로스컬처 리더십" },
    { en: "First-time executive transition", kr: "처음 임원이 되었을 때" },
    { en: "Leading through crisis / layoffs", kr: "위기/구조조정 리더십" },
    { en: "Building executive presence", kr: "임원으로서의 존재감 구축" },
    { en: "Other", kr: "기타 (직접 입력)" },
  ],
  org: [
    { en: "Reorg / restructuring survival", kr: "조직개편 생존전략" },
    { en: "M&A integration — uncertain role", kr: "M&A 통합 — 불확실한 역할" },
    { en: "Internal politics / turf wars", kr: "사내 정치 / 영역 다툼" },
    { en: "Budget defense / resource negotiation", kr: "예산 방어 / 리소스 협상" },
    { en: "Navigating Korean corporate hierarchy", kr: "한국 기업 위계질서 적응" },
    { en: "Cross-border org dynamics", kr: "본사와 해외 법인 사이에서" },
    { en: "Promotion navigation", kr: "승진 전략" },
    { en: "Other", kr: "기타 (직접 입력)" },
  ],
  career: [
    { en: "Big tech → startup transition", kr: "대기업 → 스타트업 이직" },
    { en: "US → Korea career move", kr: "미국 → 한국 커리어 이동" },
    { en: "Korea → US career move", kr: "한국 → 미국 커리어 이동" },
    { en: "VP → C-suite path", kr: "VP → C-레벨 경로" },
    { en: "IC → management transition", kr: "IC → 매니지먼트 전환" },
    { en: "Starting something of my own", kr: "창업 고민" },
    { en: "Exploring board / advisory roles", kr: "이사회/자문 역할 탐색" },
    { en: "Career pivot to new domain", kr: "새로운 도메인으로 커리어 전환" },
    { en: "Other", kr: "기타 (직접 입력)" },
  ],
  intro: [
    { en: "Intro to person at specific company", kr: "특정 회사 담당자 소개" },
    { en: "Vendor / service provider recommendation", kr: "벤더/서비스 제공업체 추천" },
    { en: "Executive recruiter / headhunter", kr: "임원 리크루터/헤드헌터" },
    { en: "Investor / VC connection", kr: "투자자/VC 연결" },
    { en: "Advisor / mentor in specific area", kr: "특정 분야 어드바이저/멘토" },
    { en: "Community / peer group recommendation", kr: "커뮤니티/피어 그룹 추천" },
    { en: "Other", kr: "기타 (직접 입력)" },
  ],
};

// ─── Elev8 Titles ────────────────────────────────────────
const ELEV8_TITLES: Record<string, { icon: string; en: string; kr: string; descEn: string; descKr: string }> = {
  architect: { icon: "⚡", en: "Architect", kr: "Architect", descEn: "I solve technical problems", descKr: "기술적 문제를 해결합니다" },
  advisor:   { icon: "💡", en: "Advisor", kr: "Advisor", descEn: "I help leaders lead", descKr: "리더가 더 잘 이끌도록 돕습니다" },
  navigator: { icon: "🧭", en: "Navigator", kr: "Navigator", descEn: "I've been through the maze and know the way", descKr: "복잡한 조직을 헤쳐나간 경험이 있습니다" },
  catalyst:  { icon: "🚀", en: "Catalyst", kr: "Catalyst", descEn: "I accelerate career transformations", descKr: "커리어 전환을 가속화합니다" },
  connector: { icon: "🔗", en: "Connector", kr: "Connector", descEn: "I connect people who need to meet", descKr: "만나야 할 사람들을 연결합니다" },
};

const ACTION_TO_TITLE: Record<string, string> = {
  architecture: "architect", building: "architect", migrating: "architect", optimizing: "architect",
  scaling: "advisor", "org-design": "advisor", hiring: "advisor", strategy: "advisor",
  compliance: "navigator", mna: "navigator",
  gtm: "catalyst", crisis: "catalyst",
};

// ─── Component ───────────────────────────────────────────

export function MemberCardForm({ member, onboarding = false }: MemberCardFormProps) {
  const hasCard = !!member.cardCompletedAt;

  const getInitialStep = (): Step => {
    if (hasCard) return "done";
    if (member.spDomain) return "done";
    return "about";
  };
  const [step, setStep] = useState<Step>(getInitialStep);

  // Language — auto-detect from member preference
  const [lang, setLang] = useState<"en" | "kr">(member.preferredLang === "kr" ? "kr" : "en");

  // Professional info
  const [company, setCompany] = useState(member.company || "");
  const [jobTitle, setJobTitle] = useState(member.jobTitle || "");
  const [linkedinUrl, setLinkedinUrl] = useState(member.linkedinUrl || "");
  const [knownFor, setKnownFor] = useState(member.knownFor || "");

  // 5-Dimension selections
  const [spDomains, setSpDomains] = useState<string[]>(member.spDomain ? member.spDomain.split(",") : []);
  const spDomain = spDomains.join(","); // backward compat: comma-separated for API/DB
  const [spActions, setSpActions] = useState<string[]>(member.spAction ? member.spAction.split(",") : []);
  const [spScales, setSpScales] = useState<string[]>(member.spScale ? member.spScale.split(",") : []);
  const [spStages, setSpStages] = useState<string[]>(member.spStage ? member.spStage.split(",") : []);
  const [spGeos, setSpGeos] = useState<string[]>(member.spGeo ? member.spGeo.split(",") : []);
  const [spDomainCustom, setSpDomainCustom] = useState(member.spDomainCustom || "");
  const [spActionCustom, setSpActionCustom] = useState(member.spActionCustom || "");
  const [spGeoCustom, setSpGeoCustom] = useState("");
  const [customChallengeText1, setCustomChallengeText1] = useState("");
  const [customChallengeText2, setCustomChallengeText2] = useState("");
  const [savedTitles, setSavedTitles] = useState<string[]>(member.elev8Titles ?? []);

  const toggleMulti = (id: string, list: string[], setList: (v: string[]) => void, max = 3) => {
    if (list.includes(id)) setList(list.filter(x => x !== id));
    else if (list.length < max) setList([...list, id]);
  };

  const earnedTitles = useMemo(() => {
    const titles = new Set(savedTitles);
    for (const a of spActions) {
      if (ACTION_TO_TITLE[a]) titles.add(ACTION_TO_TITLE[a]);
    }
    if (titles.size === 0 && spActions.length > 0) titles.add("connector");
    return Array.from(titles);
  }, [savedTitles, spActions]);

  // Typed challenges (deprecated — kept for existing data)
  const [challengeType1, setChallengeType1] = useState(member.challengeType1 || "");
  const [challengeSpec1, setChallengeSpec1] = useState(member.challengeSpec1 || "");
  const [challengeType2, setChallengeType2] = useState(member.challengeType2 || "");
  const [challengeSpec2, setChallengeSpec2] = useState(member.challengeSpec2 || "");

  // Conversational questions (Q1-Q3)
  const [knownForDetail, setKnownForDetail] = useState(member.knownForDetail || "");
  const [adviceSeeking, setAdviceSeeking] = useState(member.adviceSeeking || "");
  const [passionTopic, setPassionTopic] = useState(member.passionTopic || "");

  // Legacy keyword state
  const [selectedSPKeywords, setSelectedSPKeywords] = useState<string[]>(
    member.superpowers.length > 0 ? member.superpowers : []
  );

  // AI-refined descriptions
  const parseSPProfiles = (details: string[]): SuperpowerProfile[] => {
    return details.map((d) => {
      try {
        const p = JSON.parse(d);
        if (p.title && p.bullets) return p as SuperpowerProfile;
      } catch { /* not JSON */ }
      return { title: d, bullets: [], proof: "" };
    });
  };
  const [spProfiles, setSpProfiles] = useState<SuperpowerProfile[]>(parseSPProfiles(member.superpowerDetails || []));
  const [spProfilesKr, setSpProfilesKr] = useState<SuperpowerProfile[]>(parseSPProfiles(member.superpowerDetailsKr || []));
  const [refinedChallenges, setRefinedChallenges] = useState<string[]>(member.challengeDetails || []);
  const [refinedChallengesKr, setRefinedChallengesKr] = useState<string[]>(member.challengeDetailsKr || []);
  const [generating, setGenerating] = useState(false);

  // Dream connection
  const [dreamConnection, setDreamConnection] = useState(member.dreamConnection || "");
  const [dreamRefined, setDreamRefined] = useState(member.dreamConnectionRefined || "");
  const [dreamRefinedKr, setDreamRefinedKr] = useState(member.dreamConnectionRefinedKr || "");
  const [showDreamConnect, setShowDreamConnect] = useState(!!member.dreamConnection);

  // Expand/collapse on done card
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const cardMountedRef = useRef(false);

  // Editing
  const [editingIdx, setEditingIdx] = useState<{ type: "sp" | "ch"; idx: number } | null>(null);
  const [editVal, setEditVal] = useState("");

  // Match suggestions
  const [matchSuggestions, setMatchSuggestions] = useState<MatchSuggestion[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Photo
  const [photoPromptDismissed, setPhotoPromptDismissed] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [customPhoto, setCustomPhoto] = useState<string | null>(member.customPhotoUrl);

  // Post-completion stats
  const [totalMembers, setTotalMembers] = useState(0);
  const [domainPeerCount, setDomainPeerCount] = useState(0);

  // Unveil animation state
  const [unveilPhase, setUnveilPhase] = useState<"skeleton" | "card" | "title" | "titles" | "complete">("skeleton");

  const [saving, setSaving] = useState(false);

  const memberNumber = member.memberNumber ? String(member.memberNumber).padStart(3, "0") : null;
  const memberSince = new Date(member.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const photoUrl = customPhoto || member.imageUrl;

  // Superpower updated date for "living credential"
  const spUpdatedLabel = member.superpowerUpdatedAt
    ? new Date(member.superpowerUpdatedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : memberSince;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(lang === "kr" ? "이미지 파일만 업로드 가능합니다" : "Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(lang === "kr" ? "파일 크기는 5MB 이하여야 합니다" : "File size must be under 5MB");
      return;
    }
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/members/me/photo", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }
      const { url } = await res.json();
      setCustomPhoto(url);
      toast.success(lang === "kr" ? "사진이 업로드되었습니다" : "Photo uploaded!");
    } catch {
      toast.error(lang === "kr" ? "사진 업로드에 실패했습니다" : "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ── Get display label for dimension option ──
  const dimLabel = (options: { id: string; en: string; kr: string }[], id: string) => {
    const opt = options.find((o) => o.id === id);
    if (!opt) return id;
    return lang === "kr" ? opt.kr : opt.en;
  };

  const domainName = spDomains.map(d => d === "other" ? (spDomainCustom || "Other") : dimLabel(DOMAINS, d)).join(", ");
  const actionNames = spActions.map(a => a === "custom" ? (spActionCustom || "Custom") : dimLabel(ACTIONS, a));
  const scaleNames = spScales.map(s => dimLabel(SCALES, s));
  const stageNames = spStages.map(s => dimLabel(STAGES, s));
  const geoNames = spGeos.map(g => g === "geo-other" ? (spGeoCustom || "Other") : dimLabel(GEOS, g));

  // ── AI Generate from 5 dimensions ──
  const generateWithAI = async () => {
    setGenerating(true);
    setUnveilPhase("skeleton");
    try {
      const suggestPromise = fetch("/api/members/me/card/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spDomain: domainName, spAction: actionNames.join(", "),
          spScale: scaleNames.join(", "), spStage: stageNames.join(", "),
          spGeo: geoNames.join(", "),
          knownForDetail, adviceSeeking, passionTopic,
          jobTitle, company,
        }),
      });

      const dreamPromise = dreamConnection.trim()
        ? fetch("/api/members/me/card/refine-dream", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rawDescription: dreamConnection, jobTitle, company }),
          })
        : null;

      const [suggestRes, dreamRes] = await Promise.all([suggestPromise, dreamPromise]);
      const data = await suggestRes.json();
      if (!suggestRes.ok) throw new Error(data.detail || data.error || "Failed");

      const spData = (data.superpowers || []).map((sp: SuperpowerProfile | string) =>
        typeof sp === "string" ? { title: sp, bullets: [], proof: "" } : sp
      );
      const spDataKr = (data.superpowersKr || []).map((sp: SuperpowerProfile | string) =>
        typeof sp === "string" ? { title: sp, bullets: [], proof: "" } : sp
      );
      setSpProfiles(spData);
      setSpProfilesKr(spDataKr);
      setRefinedChallenges(data.challenges || []);
      setRefinedChallengesKr(data.challengesKr || []);
      setSelectedSPKeywords([domainName, ...actionNames]);

      if (dreamRes?.ok) {
        const dreamData = await dreamRes.json();
        setDreamRefined(dreamData.refined || "");
        setDreamRefinedKr(dreamData.refinedKr || "");
      }

      // ── The Unveil: staggered animation ──
      setStep("generate");
      setTimeout(() => setUnveilPhase("card"), 400);
      setTimeout(() => setUnveilPhase("title"), 900);
      setTimeout(() => setUnveilPhase("titles"), 1400);
      setTimeout(() => {
        setUnveilPhase("complete");
        setStep("refine");
      }, 2200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Couldn't generate: ${msg}`);
      setStep("challenges");
    } finally {
      setGenerating(false);
    }
  };

  // ── Load match suggestions ──
  const loadMatches = useCallback(async () => {
    setLoadingMatches(true);
    try {
      const res = await fetch(`/api/members/me/card/match-suggestions?lang=${lang}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setMatchSuggestions(data.matches || []);
    } catch { /* silently fail */ } finally {
      setLoadingMatches(false);
    }
  }, [lang]);

  // ── Save ──
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/members/me/card", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spDomain, spAction: spActions.join(","), spScale: spScales.join(","),
          spStage: spStages.join(","), spGeo: spGeos.join(","),
          spDomainCustom: spDomain === "other" ? spDomainCustom : undefined,
          spActionCustom: spActions.includes("custom") ? spActionCustom : undefined,
          knownForDetail: knownForDetail || undefined,
          adviceSeeking: adviceSeeking || undefined,
          passionTopic: passionTopic || undefined,
          challengeType1: challengeType1 || undefined, challengeSpec1: challengeSpec1 || undefined,
          challengeType2: challengeType2 || undefined, challengeSpec2: challengeSpec2 || undefined,
          superpowers: selectedSPKeywords,
          superpowerDetails: spProfiles.map((p) => JSON.stringify(p)),
          challenges: [challengeSpec1, challengeSpec2].filter(Boolean),
          challengeDetails: refinedChallenges,
          dreamConnection, dreamConnectionRefined: dreamRefined || undefined,
          preferredLang: lang,
          superpowersKr: selectedSPKeywords.map((_, i) => spProfilesKr[i]?.title || ""),
          superpowerDetailsKr: spProfilesKr.map((p) => JSON.stringify(p)),
          challengesKr: [challengeSpec1, challengeSpec2].filter(Boolean).map((_, i) => refinedChallengesKr[i] || ""),
          challengeDetailsKr: refinedChallengesKr,
          dreamConnectionKr: dreamRefinedKr || undefined,
          dreamConnectionRefinedKr: dreamRefinedKr || undefined,
          knownFor, company, jobTitle, linkedinUrl,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Save failed (${res.status})`);
      }
      const savedData = await res.json();
      if (savedData.elev8Titles) setSavedTitles(savedData.elev8Titles);
      if (savedData.totalMembers) setTotalMembers(savedData.totalMembers);
      if (savedData.domainPeerCount !== undefined) setDomainPeerCount(savedData.domainPeerCount);

      // If onboarding, mark completion and redirect to dashboard
      if (onboarding) {
        await fetch("/api/members/me/onboarding", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ step: 7, data: { onboardingState: "COMPLETED" } }),
        });
        window.location.href = "/dashboard";
        return;
      }

      setStep("done");
      loadMatches();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Language toggle ──
  const LanguageToggle = () => (
    <div className="flex items-center rounded-full border border-white/[0.08] bg-white/[0.02] overflow-hidden">
      <button onClick={() => setLang("en")}
        className={`px-3 py-1 text-[10px] font-medium transition-all ${
          lang === "en" ? "bg-amber-400/15 text-amber-300/70" : "text-white/25 hover:text-white/40"
        }`}>EN</button>
      <button onClick={() => setLang("kr")}
        className={`px-3 py-1 text-[10px] font-medium transition-all ${
          lang === "kr" ? "bg-amber-400/15 text-amber-300/70" : "text-white/25 hover:text-white/40"
        }`}>KR</button>
    </div>
  );

  const cleanText = (text: string | null | undefined) => (text || "").replace(/\(\s*$/, "").replace(/\)\s*$/, ")").trim();

  // ── Chip selector (for multi-select) ──
  const Chip = ({ selected, label, desc, onClick, icon }: {
    selected: boolean; label: string; desc?: string; onClick: () => void; icon?: string;
  }) => (
    <button onClick={onClick}
      className={`text-left px-4 py-3 rounded-xl border transition-all w-full ${
        selected
          ? "bg-amber-400/10 border-amber-400/25 text-amber-300/80"
          : "bg-white/[0.02] border-white/[0.06] text-white/50 hover:border-white/[0.12] hover:text-white/70"
      }`}>
      <span className="flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        <span className="text-[13px]">{label}</span>
        {selected && <Check className="size-4 ml-2 text-amber-400/60" />}
      </span>
      {desc && <span className="text-[10px] text-white/25 mt-0.5 block">{desc}</span>}
    </button>
  );

  // ── Progress indicator (3 steps now) ──
  const WIZARD_STEPS: Step[] = ["about", "expertise", "context", "challenges"];
  const wizardIdx = WIZARD_STEPS.indexOf(step);
  // Map steps → pillars: about=Share, expertise/context=Earn, challenges=Connect
  const activePillar = wizardIdx === 0 ? 0 : wizardIdx <= 2 ? 1 : 2;
  const PILLARS = [
    { en: "Share", kr: "공유", done: activePillar > 0 },
    { en: "Earn", kr: "획득", done: activePillar > 1 },
    { en: "Connect", kr: "연결", done: false },
  ];
  const ProgressBar = () => wizardIdx >= 0 ? (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          {PILLARS.map((p, i) => {
            const isActive = i === activePillar;
            const isDone = p.done;
            return (
              <div key={p.en} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-white/10 text-[10px] mx-0.5">›</span>}
                <span className={`text-[10px] px-2.5 py-1 rounded-full border transition-all duration-300 ${
                  isActive
                    ? "border-amber-400/30 bg-amber-400/10 text-amber-300/90 font-semibold"
                    : isDone
                      ? "border-white/[0.08] bg-white/[0.03] text-white/50"
                      : "border-white/[0.05] bg-transparent text-white/20"
                }`}>
                  {isDone && <span className="mr-1">✓</span>}
                  {lang === "kr" ? p.kr : p.en}
                </span>
              </div>
            );
          })}
        </div>
        <LanguageToggle />
      </div>
      <div className="h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
        <div className="h-full bg-amber-400/40 transition-all duration-300"
          style={{ width: `${((wizardIdx + 1) / WIZARD_STEPS.length) * 100}%` }} />
      </div>
    </div>
  ) : null;

  // ── Navigation buttons ──
  const NavButtons = ({ onNext, canNext, nextLabel, onBack }: {
    onNext: () => void; canNext: boolean; nextLabel?: string; onBack?: () => void;
  }) => (
    <div className="flex gap-3 mt-6">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="h-10 text-white/30 hover:text-white/50 text-sm">
          <ArrowLeft className="size-4 mr-1" /> {lang === "kr" ? "이전" : "Back"}
        </Button>
      )}
      <Button onClick={onNext} disabled={!canNext}
        className="flex-1 h-10 bg-white text-black hover:bg-white/90 rounded-xl text-sm font-medium disabled:opacity-30">
        {nextLabel || (lang === "kr" ? "다음" : "Next")} <ArrowRight className="size-4 ml-1" />
      </Button>
    </div>
  );

  // ── Hide page header during generate/refine/done ──
  useEffect(() => {
    const header = document.getElementById("profile-page-header");
    if (!header) return;
    if (step === "generate" || step === "refine" || step === "done") {
      header.style.display = "none";
    } else {
      header.style.display = "";
    }
  }, [step]);

  // ══════════════════════════════════════════════════════════
  // CARD PREVIEW — Two modes: "discovery" and "profile"
  // ══════════════════════════════════════════════════════════
  const CardPreview = ({ interactive, mode = "profile", compact }: {
    interactive?: boolean; mode?: "discovery" | "profile"; compact?: boolean;
  }) => {
    const profiles = lang === "kr" ? spProfilesKr : spProfiles;
    const chDetails = lang === "kr" ? refinedChallengesKr : refinedChallenges;
    const dreamText = lang === "kr" ? (dreamRefinedKr || dreamConnection) : (dreamRefined || dreamConnection);
    const primaryProfile = profiles[0];
    const domainBadges = profiles.slice(1);
    const spExpanded = expandedItem === "sp-primary";
    const chLabels = [challengeSpec1, challengeSpec2].filter(Boolean) as string[];

    // Parse superpower history
    const history = (member.superpowerHistory || []).map(h => {
      try { return JSON.parse(h); } catch { return null; }
    }).filter(Boolean) as { title: string; date: string }[];

    return (
      <>
      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes borderGlow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.7; } }
        .animate-shimmer { animation: shimmer 2.5s ease-in-out infinite; }
        .animate-border-glow { animation: borderGlow 3s ease-in-out infinite; }
        .bg-gradient-conic { background: conic-gradient(from 0deg, var(--tw-gradient-stops)); }
        @media (prefers-reduced-motion: reduce) {
          .animate-shimmer, .animate-border-glow, .animate-pulse, .animate-spin { animation: none !important; }
        }
      `}</style>
      <div className={`relative ${!compact && !cardMountedRef.current ? "animate-in fade-in zoom-in-95 duration-500" : ""}`} ref={() => { cardMountedRef.current = true; }}>
        {/* Ambient glow */}
        <div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-amber-500/[0.06] via-amber-400/[0.02] to-transparent blur-2xl animate-pulse" style={{ animationDuration: "3s" }} />
        {/* Rotating border */}
        <div className="absolute -inset-[1px] rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-conic from-amber-400/20 via-transparent via-30% to-amber-400/10 animate-spin" style={{ animationDuration: "8s" }} />
        </div>
        <div className="relative rounded-2xl border border-white/[0.10] bg-[#111118] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5),0_0_80px_rgba(251,191,36,0.04),inset_0_1px_0_rgba(255,255,255,0.03)]">
          {/* Top shimmer line */}
          <div className="relative h-[1.5px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
          <div className="p-6 sm:p-7">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-semibold tracking-[0.25em] text-amber-400/60 uppercase" style={{ textShadow: "0 0 12px rgba(251,191,36,0.2)" }}>Elev8</span>
                {memberNumber && (
                  <><span className="text-white/[0.08]">|</span><span className="text-[10px] tracking-wider text-white/30">#{memberNumber}</span></>
                )}
              </div>
              {!compact && <LanguageToggle />}
            </div>

            {/* ── DISCOVERY MODE: Superpower first, name second ── */}
            {mode === "discovery" && primaryProfile?.title ? (
              <>
                {/* Superpower as hero */}
                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Check className="size-3 text-amber-400/60" />
                    <p className="text-[9px] tracking-[0.2em] text-amber-400/55 uppercase font-semibold">
                      {lang === "kr" ? "현재 핵심 역량" : "Current Superpower"}
                    </p>
                    <span className="text-[8px] text-white/20 ml-1">
                      · {lang === "kr" ? `${spUpdatedLabel} 업데이트` : `Updated ${spUpdatedLabel}`}
                    </span>
                  </div>
                  <button onClick={() => setExpandedItem(spExpanded ? null : "sp-primary")}
                    className="flex items-start justify-between w-full text-left group">
                    <h3 className="text-[22px] font-bold text-white/95 tracking-tight leading-tight pr-3" style={{ textShadow: "0 0 20px rgba(251,191,36,0.08)" }}>
                      {primaryProfile.title}
                    </h3>
                    {primaryProfile.bullets.length > 0 && (
                      <span className="mt-1 shrink-0 text-white/25 group-hover:text-white/45 transition-colors">
                        {spExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                      </span>
                    )}
                  </button>
                  {spExpanded && primaryProfile.bullets.length > 0 && (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                      <p className="text-[10px] text-amber-400/50 font-medium tracking-wide uppercase">
                        {lang === "kr" ? "이런 도움을 드릴 수 있습니다" : "I can help you with"}
                      </p>
                      {primaryProfile.bullets.map((b, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <span className="text-amber-400/40 text-[13px] mt-[1px] shrink-0">→</span>
                          <span className="text-[13px] text-white/60 leading-snug">{b}</span>
                        </div>
                      ))}
                      {primaryProfile.proof && (
                        <div className="mt-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                          <p className="text-[10px] text-white/35 leading-relaxed italic">{primaryProfile.proof}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* Divider */}
                <div className="h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-4" />
                {/* Name as subtitle */}
                <div className="flex items-center gap-3.5 mb-4">
                  {photoUrl ? (
                    <img src={photoUrl} alt="" className="size-10 rounded-full object-cover ring-1 ring-amber-400/20" />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/[0.08] to-white/[0.02] text-xs font-semibold text-white/50 ring-1 ring-amber-400/15">
                      {member.firstName[0]}{member.lastName[0]}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-medium text-white/75">{member.firstName} {member.lastName}</p>
                      {linkedinUrl && (
                        <a href={linkedinUrl.startsWith("http") ? linkedinUrl : `https://${linkedinUrl}`} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-blue-400/60 transition-colors">
                          <Linkedin className="size-3" />
                        </a>
                      )}
                    </div>
                    {(jobTitle || company) && (
                      <p className="text-[11px] text-white/40 truncate">{cleanText(jobTitle)}{jobTitle && company && " · "}{cleanText(company)}</p>
                    )}
                  </div>
                </div>
                {/* Titles + peer recognition */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-4">
                  <div className="relative group/fm flex items-center gap-1 cursor-help">
                    <span className="text-amber-400/50 text-[11px]" style={{ textShadow: "0 0 6px rgba(251,191,36,0.3)" }}>◆</span>
                    <span className="text-[10px] text-amber-400/40 font-medium tracking-wide">Founding Member</span>
                  </div>
                  {earnedTitles.length > 0 && (
                    <><span className="text-white/[0.08]">|</span>
                    {earnedTitles.map((t) => {
                      const title = ELEV8_TITLES[t];
                      return title ? (
                        <span key={t} className="text-[10px] text-white/45 font-medium">{title.icon} {lang === "kr" ? title.kr : title.en}</span>
                      ) : null;
                    })}</>
                  )}
                  {member.peerRecognitionCount > 0 && (
                    <><span className="text-white/[0.08]">|</span>
                    <span className="text-[9px] text-white/25">
                      {lang === "kr" ? `${member.peerRecognitionCount}명의 동료 리더가 인정` : `Recognized by ${member.peerRecognitionCount} peers`}
                    </span></>
                  )}
                </div>
              </>
            ) : (
              /* ── PROFILE MODE: Name first, Superpower below ── */
              <>
                {/* Profile header */}
                <div className="flex items-center gap-3.5 mb-1.5">
                  {photoUrl ? (
                    <img src={photoUrl} alt="" className="size-13 rounded-full object-cover ring-2 ring-amber-400/25 shadow-[0_0_15px_rgba(251,191,36,0.1)]" />
                  ) : (
                    <div className="relative flex size-13 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/[0.08] to-white/[0.02] text-sm font-semibold text-white/50 ring-2 ring-amber-400/20">
                      {member.firstName[0]}{member.lastName[0]}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-[16px] font-semibold text-white/90 tracking-tight">{member.firstName} {member.lastName}</h2>
                      {linkedinUrl && (
                        <a href={linkedinUrl.startsWith("http") ? linkedinUrl : `https://${linkedinUrl}`} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-blue-400/60 transition-colors">
                          <Linkedin className="size-3.5" />
                        </a>
                      )}
                    </div>
                    {(jobTitle || company) && (
                      <p className="text-[12px] text-white/50 mt-0.5 truncate">{cleanText(jobTitle)}{jobTitle && company && " · "}{cleanText(company)}</p>
                    )}
                  </div>
                </div>
                {/* Founding Member + Titles + Peer Recognition */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 ml-[3.75rem] mb-5">
                  <div className="relative group/fm flex items-center gap-1 cursor-help">
                    <span className="text-amber-400/50 text-[11px]" style={{ textShadow: "0 0 6px rgba(251,191,36,0.3)" }}>◆</span>
                    <span className="text-[10px] text-amber-400/40 font-medium tracking-wide group-hover/fm:text-amber-400/60 transition-colors" style={{ textShadow: "0 0 8px rgba(251,191,36,0.1)" }}>Founding Member</span>
                    <div className="absolute bottom-full left-0 mb-1.5 px-2.5 py-1.5 rounded-md bg-[#1a1a1a] border border-white/[0.08] text-[10px] text-white/60 whitespace-nowrap opacity-0 pointer-events-none group-hover/fm:opacity-100 transition-opacity duration-150 z-10">
                      {lang === "kr" ? "Elev8 초기 멤버로서 커뮤니티를 함께 만들어가고 있습니다" : "One of the first members shaping the Elev8 community"}
                    </div>
                  </div>
                  {earnedTitles.length > 0 && (
                    <><span className="text-white/[0.08]">|</span>
                    {earnedTitles.map((t) => {
                      const title = ELEV8_TITLES[t];
                      return title ? (
                        <div key={t} className="relative group/et flex items-center cursor-help">
                          <span className="text-[10px] text-white/45 font-medium group-hover/et:text-white/65 transition-colors">{title.icon} {lang === "kr" ? title.kr : title.en}</span>
                          <div className="absolute bottom-full left-0 mb-1.5 px-2.5 py-1.5 rounded-md bg-[#1a1a1a] border border-white/[0.08] text-[10px] text-white/60 whitespace-nowrap opacity-0 pointer-events-none group-hover/et:opacity-100 transition-opacity duration-150 z-10">
                            {lang === "kr" ? title.descKr : title.descEn}
                          </div>
                        </div>
                      ) : null;
                    })}</>
                  )}
                  {member.peerRecognitionCount > 0 && (
                    <><span className="text-white/[0.08]">|</span>
                    <span className="text-[9px] text-white/25">
                      {lang === "kr" ? `${member.peerRecognitionCount}명의 동료가 인정` : `${member.peerRecognitionCount} peer recognitions`}
                    </span></>
                  )}
                </div>

                <div className="h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-4" />

                {/* Superpower */}
                {primaryProfile?.title ? (
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Check className="size-3 text-amber-400/60" />
                      <p className="text-[9px] tracking-[0.2em] text-amber-400/55 uppercase font-semibold">
                        {lang === "kr" ? "현재 핵심 역량" : "Current Superpower"}
                      </p>
                      <span className="text-[8px] text-white/20 ml-1">
                        · {lang === "kr" ? `${spUpdatedLabel} 업데이트` : `Updated ${spUpdatedLabel}`}
                      </span>
                    </div>
                    <button onClick={() => setExpandedItem(spExpanded ? null : "sp-primary")}
                      className="flex items-start justify-between w-full text-left group">
                      <h3 className="text-[22px] font-bold text-white/95 tracking-tight leading-tight pr-3" style={{ textShadow: "0 0 20px rgba(251,191,36,0.08)" }}>
                        {primaryProfile.title}
                      </h3>
                      {primaryProfile.bullets.length > 0 && (
                        <span className="mt-1 shrink-0 text-white/25 group-hover:text-white/45 transition-colors">
                          {spExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        </span>
                      )}
                    </button>
                    {spExpanded && primaryProfile.bullets.length > 0 && (
                      <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                        <p className="text-[10px] text-amber-400/50 font-medium tracking-wide uppercase">
                          {lang === "kr" ? "이런 도움을 드릴 수 있습니다" : "I can help you with"}
                        </p>
                        {primaryProfile.bullets.map((b, j) => (
                          <div key={j} className="flex items-start gap-2">
                            <span className="text-amber-400/40 text-[13px] mt-[1px] shrink-0">→</span>
                            <span className="text-[13px] text-white/60 leading-snug">{b}</span>
                          </div>
                        ))}
                        {primaryProfile.proof && (
                          <div className="mt-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                            <p className="text-[10px] text-white/35 leading-relaxed italic">{primaryProfile.proof}</p>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Domain badges */}
                    {domainBadges.length > 0 && (
                      <div className="pt-2 space-y-1.5">
                        <p className="text-[8px] tracking-[0.2em] text-white/20 uppercase font-medium">
                          {lang === "kr" ? "전문 분야" : "Domain Expertise"}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {domainBadges.map((badge, i) => (
                            <button key={i} onClick={() => setExpandedItem(expandedItem === `badge-${i}` ? null : `badge-${i}`)}
                              className={`text-[11px] px-3 py-1.5 rounded-full border transition-all cursor-pointer hover:border-amber-400/20 hover:text-white/60 ${
                                expandedItem === `badge-${i}` ? "bg-amber-400/[0.06] border-amber-400/20 text-amber-300/70" : "text-white/45 bg-white/[0.02] border-white/[0.06]"
                              }`}>
                              {badge.title || `Domain ${i + 2}`}
                              {badge.bullets.length > 0 && (expandedItem === `badge-${i}` ? <ChevronUp className="size-3 inline ml-1 opacity-50" /> : <ChevronDown className="size-3 inline ml-1 opacity-50" />)}
                            </button>
                          ))}
                        </div>
                        {domainBadges.map((badge, i) => (
                          expandedItem === `badge-${i}` && badge.bullets.length > 0 && (
                            <div key={`badge-detail-${i}`} className="rounded-lg bg-white/[0.015] px-3 py-2.5 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                              <p className="text-[9px] text-white/25 italic">{lang === "kr" ? "이런 도움을 드릴 수 있습니다:" : "I can help you with:"}</p>
                              {badge.bullets.map((b, j) => (
                                <div key={j} className="flex items-start gap-2">
                                  <span className="text-amber-400/25 text-[11px] mt-[1px] shrink-0">→</span>
                                  <span className="text-[11px] text-white/45 leading-snug">{b}</span>
                                </div>
                              ))}
                            </div>
                          )
                        ))}
                      </div>
                    )}
                    {/* Superpower History */}
                    {history.length > 0 && (
                      <div className="pt-2">
                        <button onClick={() => setExpandedItem(expandedItem === "history" ? null : "history")}
                          className="text-[8px] text-white/15 hover:text-white/30 transition-colors uppercase tracking-wider">
                          {lang === "kr" ? "이전 역량 보기" : "Previously"} {expandedItem === "history" ? "▴" : "▾"}
                        </button>
                        {expandedItem === "history" && (
                          <div className="mt-1.5 space-y-1 animate-in fade-in duration-200">
                            {history.map((h, i) => (
                              <p key={i} className="text-[9px] text-white/20">· {h.title} <span className="text-white/10">({new Date(h.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })})</span></p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : spDomain && (
                  <div className="mb-4">
                    <p className="text-[9px] tracking-[0.2em] text-amber-400/45 uppercase font-semibold mb-2">Superpower</p>
                    <p className="text-[14px] text-white/60">{domainName} · {actionNames.join(", ")}</p>
                  </div>
                )}
              </>
            )}

            {/* ── Challenges & dream connection hidden from card (used for internal matching only) ── */}

            {/* ── CTA: Discovery mode only ── */}
            {(primaryProfile?.title || spDomain) && !compact && mode === "discovery" && (
              <div className="pt-2">
                <button className="w-full h-11 rounded-xl bg-amber-400/90 text-[13px] text-black font-semibold hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(251,191,36,0.2)]">
                  <Sparkles className="size-3.5" />
                  {lang === "kr" ? "이 관점에 대해 더 알아보기" : "Explore this perspective"}
                </button>
              </div>
            )}
          </div>
          <div className="h-[1px] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
          <div className="px-7 py-3.5 flex items-center justify-between">
            <span className="text-[8px] tracking-[0.2em] text-white/15 uppercase font-medium">elev8-signal.com</span>
            <span className="text-[8px] text-white/15 tracking-wide">Est. {memberSince}</span>
          </div>
        </div>
      </div>
      </>
    );
  };

  // ════════════════════════════════════════════════════════
  // STEP 1: ABOUT — Title, Company, Photo, Domain (combined)
  // ════════════════════════════════════════════════════════
  if (step === "about") {
    return (
      <div className="space-y-6">
        <ProgressBar />

        {/* About you section */}
        <section className="space-y-4 rounded-xl border border-white/[0.05] bg-white/[0.01] p-5">
          <h3 className="text-sm font-medium text-white/80">
            {lang === "kr" ? "기본 정보 입력" : "About you"}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-white/40 font-medium">Title</label>
              <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="VP of Engineering"
                className="h-9 bg-white/[0.03] border-white/[0.07] text-sm placeholder:text-white/25" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-white/40 font-medium">Company</label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Google"
                className="h-9 bg-white/[0.03] border-white/[0.07] text-sm placeholder:text-white/25" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-white/40 font-medium">LinkedIn</label>
              <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="linkedin.com/in/you"
                className="h-9 bg-white/[0.03] border-white/[0.07] text-sm placeholder:text-white/25" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-white/40 font-medium">{lang === "kr" ? "프로필 사진" : "Photo"}</label>
              <div className="flex items-center gap-2">
                <label className="relative cursor-pointer group">
                  {photoUrl ? (
                    <img src={photoUrl} alt="" className="size-9 rounded-full object-cover ring-1 ring-white/10 group-hover:ring-amber-400/30 transition-all" />
                  ) : (
                    <div className="size-9 rounded-full bg-white/[0.05] border border-white/[0.08] group-hover:border-amber-400/25 flex items-center justify-center transition-all">
                      <Camera className="size-4 text-white/20 group-hover:text-amber-400/50 transition-colors" />
                    </div>
                  )}
                  {uploadingPhoto && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                      <RefreshCw className="size-3 text-amber-400/60 animate-spin" />
                    </div>
                  )}
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoUpload} disabled={uploadingPhoto} className="hidden" />
                </label>
                <p className="text-[8px] text-white/20">JPG, PNG, WebP · Max 5MB</p>
              </div>
            </div>
          </div>
          {!photoUrl && !photoPromptDismissed && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-400/10 bg-amber-400/[0.02]">
              <p className="text-[10px] text-amber-300/40 flex-1">
                {lang === "kr" ? "사진을 올리면 동료 연결이 3배 늘어납니다" : "Members with photos get 3x more connection requests"}
              </p>
              <button onClick={() => setPhotoPromptDismissed(true)} className="text-white/15 hover:text-white/30"><X className="size-3" /></button>
            </div>
          )}
        </section>

        <div className="h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* Domain selection */}
        <div>
          <h3 className="text-sm font-medium text-white/80 mb-1">
            {lang === "kr" ? "동료들이 주로 어떤 분야로 찾아오나요?" : "What do people come to you for?"}
          </h3>
          <p className="text-[11px] text-white/35 mb-4">
            {lang === "kr" ? "최대 2개 — 이걸 기준으로 멤버들이 연결됩니다" : "Pick up to 2 — this is how other members will find you"}
          </p>
          <div className="space-y-2">
            {DOMAINS.map((d) => (
              <Chip key={d.id}
                selected={spDomains.includes(d.id)}
                label={lang === "kr" ? d.kr : d.en}
                desc={d.id !== "other" ? (lang === "kr" ? d.descKr : d.descEn) : undefined}
                onClick={() => {
                  if (d.id === "other") {
                    setSpDomains(spDomains.includes("other") ? spDomains.filter(x => x !== "other") : [...spDomains.filter(x => x !== "other"), "other"]);
                  } else {
                    toggleMulti(d.id, spDomains, setSpDomains, 2);
                  }
                }} />
            ))}
          </div>
          {spDomains.includes("other") && (
            <Input value={spDomainCustom} onChange={(e) => setSpDomainCustom(e.target.value)}
              placeholder={lang === "kr" ? "분야를 입력하세요" : "Type your domain"}
              className="mt-3 h-10 bg-white/[0.03] border-white/[0.07] text-sm placeholder:text-white/25" autoFocus />
          )}
          <p className="text-[10px] text-white/20 mt-3">
            {lang === "kr" ? "나중에 언제든 바꿀 수 있어요" : "You can change this anytime"}
          </p>
        </div>

        <NavButtons onNext={() => setStep("expertise")} canNext={spDomains.length > 0 && (!spDomains.includes("other") || !!spDomainCustom.trim()) && !!jobTitle.trim()} />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // STEP 2: EXPERTISE — Action + Elev8 Titles hint
  // ════════════════════════════════════════════════════════
  if (step === "expertise") {
    return (
      <div className="space-y-6">
        <ProgressBar />
        <div>
          <h3 className="text-sm font-medium text-white/80 mb-1">
            {lang === "kr" ? `${domainName} 분야에서 가장 자신 있는 역할은?` : `What makes you exceptional in ${domainName}?`}
          </h3>
          <p className="text-[11px] text-white/35 mb-1">
            {lang === "kr" ? "최대 3개 선택" : "Select up to 3"}
            {spActions.length > 0 && <span className="text-amber-400/50 ml-1">({spActions.length}/3)</span>}
          </p>
          <p className="text-[10px] text-amber-400/30 mb-4">
            {lang === "kr" ? "✦ 여기서 첫 Elev8 타이틀이 정해집니다" : "✦ This determines your first Elev8 Title"}
          </p>
          <div className="space-y-2">
            {ACTIONS.map((a) => (
              <Chip key={a.id} selected={spActions.includes(a.id)} label={lang === "kr" ? a.kr : a.en}
                onClick={() => toggleMulti(a.id, spActions, setSpActions)} />
            ))}
          </div>
          {spActions.includes("custom") && (
            <Input value={spActionCustom} onChange={(e) => setSpActionCustom(e.target.value)}
              placeholder={lang === "kr" ? "어떤 역할인지 적어주세요" : "Describe your specific expertise"}
              className="mt-3 h-10 bg-white/[0.03] border-white/[0.07] text-sm placeholder:text-white/25" autoFocus />
          )}
          {/* Live title preview */}
          {earnedTitles.length > 0 && (
            <div className="mt-4 px-4 py-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.04]">
              <p className="text-[9px] tracking-[0.15em] text-amber-400/45 uppercase font-semibold mb-1">
                {lang === "kr" ? "받게 될 Elev8 타이틀" : "Elev8 Titles you'll earn"}
              </p>
              <div className="flex flex-wrap gap-2">
                {earnedTitles.map(t => ELEV8_TITLES[t] ? (
                  <span key={t} className="text-[13px] font-medium text-amber-300/75">{ELEV8_TITLES[t].icon} {lang === "kr" ? ELEV8_TITLES[t].kr : ELEV8_TITLES[t].en}</span>
                ) : null)}
              </div>
            </div>
          )}
        </div>
        <NavButtons onNext={() => setStep("context")} canNext={spActions.length > 0 && (!spActions.includes("custom") || !!spActionCustom.trim())} onBack={() => setStep("about")} />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // STEP 3: CONTEXT — Scale + Stage + Geo (combined)
  // ════════════════════════════════════════════════════════
  if (step === "context") {
    return (
      <div className="space-y-6">
        <ProgressBar />

        {/* Scale */}
        <div>
          <h3 className="text-sm font-medium text-white/80 mb-1">{lang === "kr" ? "어느 정도 규모의 조직에서 일해보셨나요?" : "At what scale?"}</h3>
          <p className="text-[11px] text-white/35 mb-3">{lang === "kr" ? "최대 3개" : "Up to 3"}{spScales.length > 0 && <span className="text-amber-400/50 ml-1">({spScales.length}/3)</span>}</p>
          <div className="flex flex-wrap gap-1.5">
            {SCALES.map((s) => (
              <button key={s.id} onClick={() => toggleMulti(s.id, spScales, setSpScales)}
                className={`text-[11px] px-3 py-2 rounded-lg border transition-all ${
                  spScales.includes(s.id) ? "bg-amber-400/10 border-amber-400/25 text-amber-300/80" : "bg-white/[0.02] border-white/[0.06] text-white/45 hover:border-white/[0.12]"
                }`}>{lang === "kr" ? s.kr : s.en}</button>
            ))}
          </div>
        </div>

        <div className="h-[1px] bg-white/[0.04]" />

        {/* Stage */}
        <div>
          <h3 className="text-sm font-medium text-white/80 mb-1">{lang === "kr" ? "어떤 단계의 회사를 경험하셨나요?" : "At what company stage?"}</h3>
          <p className="text-[11px] text-white/35 mb-3">{lang === "kr" ? "최대 3개" : "Up to 3"}{spStages.length > 0 && <span className="text-amber-400/50 ml-1">({spStages.length}/3)</span>}</p>
          <div className="flex flex-wrap gap-1.5">
            {STAGES.map((s) => (
              <button key={s.id} onClick={() => toggleMulti(s.id, spStages, setSpStages)}
                className={`text-[11px] px-3 py-2 rounded-lg border transition-all ${
                  spStages.includes(s.id) ? "bg-amber-400/10 border-amber-400/25 text-amber-300/80" : "bg-white/[0.02] border-white/[0.06] text-white/45 hover:border-white/[0.12]"
                }`}>{lang === "kr" ? s.kr : s.en}</button>
            ))}
          </div>
        </div>

        <div className="h-[1px] bg-white/[0.04]" />

        {/* Geography */}
        <div>
          <h3 className="text-sm font-medium text-white/80 mb-1">{lang === "kr" ? "주로 어디서 일하셨나요?" : "Where?"}</h3>
          <p className="text-[11px] text-white/35 mb-3">{lang === "kr" ? "최대 3개" : "Up to 3"}{spGeos.length > 0 && <span className="text-amber-400/50 ml-1">({spGeos.length}/3)</span>}</p>
          <div className="flex flex-wrap gap-1.5">
            {GEOS.map((g) => (
              <button key={g.id} onClick={() => toggleMulti(g.id, spGeos, setSpGeos)}
                className={`text-[11px] px-3 py-2 rounded-lg border transition-all ${
                  spGeos.includes(g.id) ? "bg-amber-400/10 border-amber-400/25 text-amber-300/80" : "bg-white/[0.02] border-white/[0.06] text-white/45 hover:border-white/[0.12]"
                }`}>{lang === "kr" ? g.kr : g.en}</button>
            ))}
          </div>
          {spGeos.includes("geo-other") && (
            <Input value={spGeoCustom} onChange={(e) => setSpGeoCustom(e.target.value)}
              placeholder={lang === "kr" ? "지역을 입력하세요" : "Type your region"}
              className="mt-2 h-9 bg-white/[0.03] border-white/[0.07] text-sm placeholder:text-white/25" autoFocus />
          )}
        </div>

        <NavButtons onNext={() => setStep("challenges")}
          canNext={spScales.length > 0 && spStages.length > 0 && spGeos.length > 0 && (!spGeos.includes("geo-other") || !!spGeoCustom.trim())}
          onBack={() => setStep("expertise")} />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // STEP 4: CONNECT — 3 conversational questions
  // ════════════════════════════════════════════════════════
  if (step === "challenges") {
    const canProceed = knownForDetail.trim().length > 0 || adviceSeeking.trim().length > 0;

    return (
      <div className="space-y-6">
        <ProgressBar />

        <div>
          <h3 className="text-sm font-medium text-white/80 mb-1">
            {lang === "kr" ? "당신에 대해 조금 더 알려주세요" : "Tell us a bit more about you"}
          </h3>
          <p className="text-[11px] text-white/30 mb-5">
            {lang === "kr" ? "맞는 사람과 연결해 드리기 위해 필요해요 · 1-2문장이면 충분해요" : "This helps us connect you with the right people · A sentence or two is perfect"}
          </p>

          {/* Q1: Superpower Detector */}
          <div className="space-y-2 mb-5">
            <label className="block text-[13px] font-medium text-white/75">
              {lang === "kr" ? "회사에서 어떤 사람으로 알려져 있나요?" : "What's the one thing you're known for at work?"}
            </label>
            <p className="text-[10px] text-white/30">
              {lang === "kr" ? "동료나 클라이언트가 당신을 어떻게 소개할지 떠올려 보세요" : "Think about what colleagues or clients would say if someone asked about you"}
            </p>
            <Textarea
              value={knownForDetail}
              onChange={(e) => setKnownForDetail(e.target.value)}
              placeholder={lang === "kr"
                ? "예: 고전하던 영업팀을 맡아서 18개월 만에 매출을 3배로 키웠어요"
                : "e.g., I turned around a struggling sales team and tripled revenue in 18 months"}
              className="min-h-[60px] bg-white/[0.03] border-white/[0.07] text-sm placeholder:text-white/20 leading-relaxed"
            />
          </div>

          {/* Q2: Challenge Detector */}
          <div className="space-y-2 mb-5">
            <label className="block text-[13px] font-medium text-white/75">
              {lang === "kr" ? "지금 누구에게든 조언을 구할 수 있다면, 뭘 물어보고 싶으세요?" : "If you could get advice from anyone in the world right now, what would you ask them?"}
            </label>
            <p className="text-[10px] text-white/30">
              {lang === "kr" ? "맞는 사람을 연결해 드릴게요" : "This helps us connect you with the right people"}
            </p>
            <Textarea
              value={adviceSeeking}
              onChange={(e) => setAdviceSeeking(e.target.value)}
              placeholder={lang === "kr"
                ? "예: 비기술 창업자인데 개발팀을 어떻게 꾸려야 할지 모르겠어요"
                : "e.g., How to build an engineering team when I'm a non-technical founder"}
              className="min-h-[60px] bg-white/[0.03] border-white/[0.07] text-sm placeholder:text-white/20 leading-relaxed"
            />
          </div>

          {/* Q3: Contribution Signal */}
          <div className="space-y-2 mb-5">
            <label className="block text-[13px] font-medium text-white/75">
              {lang === "kr" ? "몇 시간이고 이야기할 수 있는 주제가 있나요?" : "What's a topic you could talk about for hours?"}
            </label>
            <p className="text-[10px] text-white/30">
              {lang === "kr" ? "업무 외 관심사도 괜찮아요" : "Doesn't have to be work-related — passion projects count too"}
            </p>
            <Textarea
              value={passionTopic}
              onChange={(e) => setPassionTopic(e.target.value)}
              placeholder={lang === "kr"
                ? "예: 동남아 스타트업 스케일링, 또는 리모트 팀 문화 만들기"
                : "e.g., Scaling startups in Southeast Asia, or building remote-first culture"}
              className="min-h-[60px] bg-white/[0.03] border-white/[0.07] text-sm placeholder:text-white/20 leading-relaxed"
            />
          </div>

          {/* Dream connection — optional */}
          <div className="h-[1px] bg-white/[0.04] my-4" />
          <button type="button" onClick={() => setShowDreamConnect(!showDreamConnect)} className="flex items-center justify-between w-full text-left group">
            <div>
              <h4 className="text-[13px] font-medium text-white/60 group-hover:text-white/75 transition-colors">
                {lang === "kr" ? "만나보고 싶은 분이 있으세요?" : "Anyone specific you'd love to connect with?"}
              </h4>
              <p className="text-[10px] text-white/25 mt-0.5">{lang === "kr" ? "안 적으셔도 돼요" : "Optional"}</p>
            </div>
            {showDreamConnect ? <ChevronUp className="size-4 text-white/30" /> : <ChevronDown className="size-4 text-white/30" />}
          </button>
          {showDreamConnect && (
            <Textarea value={dreamConnection} onChange={(e) => { setDreamConnection(e.target.value); setDreamRefined(""); setDreamRefinedKr(""); }}
              placeholder={lang === "kr" ? "예: 100명 넘는 팀을 이끌어 본 분" : "e.g. Someone who's scaled cross-functional teams past 100"}
              className="mt-3 min-h-14 bg-white/[0.03] border-white/[0.07] text-sm placeholder:text-white/20 leading-relaxed" maxLength={280} />
          )}
        </div>
        <NavButtons
          onNext={() => { setStep("generate"); generateWithAI(); }}
          canNext={canProceed}
          nextLabel={lang === "kr" ? "프로필 완성하기" : "Build My Profile"}
          onBack={() => setStep("context")} />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // THE UNVEIL — Staggered card reveal animation
  // ════════════════════════════════════════════════════════
  if (step === "generate") {
    return (
      <div className="py-8 -mt-12 space-y-6">
        {/* Skeleton → Card animation */}
        {unveilPhase === "skeleton" ? (
          <div className="relative rounded-2xl border border-white/[0.06] bg-[#111118] p-7 space-y-4">
            <div className="h-3 w-16 rounded bg-white/[0.04] animate-pulse" />
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-white/[0.04] animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 rounded bg-white/[0.04] animate-pulse" />
                <div className="h-3 w-24 rounded bg-white/[0.03] animate-pulse" />
              </div>
            </div>
            <div className="h-[1px] bg-white/[0.04]" />
            <div className="space-y-2">
              <div className="h-3 w-20 rounded bg-white/[0.03] animate-pulse" />
              <div className="h-6 w-full rounded bg-white/[0.04] animate-pulse" />
              <div className="h-6 w-3/4 rounded bg-white/[0.04] animate-pulse" />
            </div>
            <p className="text-center text-[11px] text-white/30 pt-4">
              {lang === "kr" ? `${member.firstName}님만의 프로필을 만들고 있습니다...` : "Crafting your Superpower profile..."}
            </p>
          </div>
        ) : (
          <div className="transition-all duration-700 opacity-100 translate-y-0">
            <CardPreview compact />
          </div>
        )}

        {/* Titles earned — staggered reveal */}
        {(unveilPhase === "titles" || unveilPhase === "complete") && earnedTitles.length > 0 && (
          <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <p className="text-[10px] text-white/30 uppercase tracking-wider">
              {lang === "kr" ? "획득한 타이틀" : "Titles Earned"}
            </p>
            <div className="flex justify-center gap-3">
              {earnedTitles.map((t, i) => {
                const title = ELEV8_TITLES[t];
                return title ? (
                  <span key={t} className="text-[13px] text-amber-300/70 font-medium animate-in fade-in zoom-in-50 duration-300"
                    style={{ animationDelay: `${i * 200}ms` }}>
                    {title.icon} {title.en}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // REFINE — Review & edit AI-generated profile
  // ════════════════════════════════════════════════════════
  if (step === "refine") {
    const profiles = lang === "kr" ? spProfilesKr : spProfiles;
    const setProfiles = lang === "kr" ? setSpProfilesKr : setSpProfiles;
    const chDetails = lang === "kr" ? refinedChallengesKr : refinedChallenges;
    const setChDetails = lang === "kr" ? setRefinedChallengesKr : setRefinedChallenges;

    const updateProfile = (idx: number, field: keyof SuperpowerProfile, value: string | string[]) => {
      const updated = [...profiles];
      updated[idx] = { ...updated[idx], [field]: value };
      setProfiles(updated);
    };
    const updateBullet = (profileIdx: number, bulletIdx: number, value: string) => {
      const updated = [...profiles];
      const newBullets = [...updated[profileIdx].bullets];
      newBullets[bulletIdx] = value;
      updated[profileIdx] = { ...updated[profileIdx], bullets: newBullets };
      setProfiles(updated);
    };

    return (
      <div className="space-y-10">
        <div className="rounded-xl border border-amber-400/15 bg-amber-400/[0.03] px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white/90">
                {lang === "kr" ? "프로필 확인 후 수정해 보세요" : "Review & edit your profile"}
              </h3>
              <p className="text-[12px] text-white/45 mt-1">
                {lang === "kr" ? "텍스트를 탭하면 바로 수정할 수 있어요" : "Tap any text to edit. Save when you're happy."}
              </p>
            </div>
            <LanguageToggle />
          </div>
        </div>

        {/* Superpower Profiles */}
        <section className="space-y-4">
          <p className="text-[10px] tracking-[0.15em] text-amber-400/55 uppercase font-semibold">
            {lang === "kr" ? "핵심 역량" : "Superpowers"}
          </p>
          {profiles.map((profile, i) => (
            <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
              {i === 0 && (
                <div className="flex items-center gap-1.5">
                  <Check className="size-3 text-amber-400/60" />
                  <span className="text-[9px] tracking-[0.15em] text-amber-400/50 uppercase font-medium">
                    {lang === "kr" ? "메인 Superpower" : "Primary Superpower"}
                  </span>
                </div>
              )}
              {editingIdx?.type === "sp" && editingIdx.idx === i * 10 ? (
                <Textarea value={editVal} onChange={(e) => setEditVal(e.target.value)}
                  onBlur={() => { updateProfile(i, "title", editVal); setEditingIdx(null); }}
                  className="text-[15px] font-bold bg-transparent border-white/[0.08] text-white/90 min-h-12 resize-none" autoFocus />
              ) : (
                <button onClick={() => { setEditingIdx({ type: "sp", idx: i * 10 }); setEditVal(profile.title); }} className="text-left w-full group">
                  <h4 className="text-[15px] font-bold text-white/90 group-hover:text-white transition-colors">
                    {profile.title}<Pencil className="size-3 inline ml-2 opacity-0 group-hover:opacity-40" />
                  </h4>
                </button>
              )}
              <div className="space-y-1.5">
                <p className="text-[9px] text-amber-400/40 font-medium uppercase tracking-wide">
                  {lang === "kr" ? "이런 도움을 드릴 수 있습니다" : "I can help you with"}
                </p>
                {profile.bullets.map((b, j) => (
                  <div key={j} className="flex items-start gap-2">
                    <span className="text-amber-400/30 text-[12px] mt-[1px] shrink-0">→</span>
                    {editingIdx?.type === "sp" && editingIdx.idx === i * 10 + j + 1 ? (
                      <Textarea value={editVal} onChange={(e) => setEditVal(e.target.value)}
                        onBlur={() => { updateBullet(i, j, editVal); setEditingIdx(null); }}
                        className="flex-1 text-[12px] bg-transparent border-white/[0.08] text-white/70 min-h-10 resize-none" autoFocus />
                    ) : (
                      <button onClick={() => { setEditingIdx({ type: "sp", idx: i * 10 + j + 1 }); setEditVal(b); }}
                        className="flex-1 text-left text-[12px] text-white/55 hover:text-white/70 transition-colors group">
                        {b}<Pencil className="size-2.5 inline ml-1 opacity-0 group-hover:opacity-30" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {editingIdx?.type === "sp" && editingIdx.idx === i * 10 + 9 ? (
                <Textarea value={editVal} onChange={(e) => setEditVal(e.target.value)}
                  onBlur={() => { updateProfile(i, "proof", editVal); setEditingIdx(null); }}
                  className="text-[11px] bg-white/[0.02] border-white/[0.08] text-white/50 min-h-12" autoFocus />
              ) : (
                <button onClick={() => { setEditingIdx({ type: "sp", idx: i * 10 + 9 }); setEditVal(profile.proof); }}
                  className="w-full text-left px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04] group">
                  <p className="text-[11px] text-white/35 italic leading-relaxed">
                    {profile.proof || (lang === "kr" ? "증명 라인을 추가하세요" : "Add your proof line")}
                    <Pencil className="size-2.5 inline ml-1 opacity-0 group-hover:opacity-30" />
                  </p>
                </button>
              )}
            </div>
          ))}
        </section>

        {/* Challenge descriptions */}
        <section className="space-y-3">
          <p className="text-[10px] tracking-[0.15em] text-amber-400/55 uppercase font-semibold">
            {lang === "kr" ? "현재 풀고 있는 과제" : "Currently Navigating"}
          </p>
          <div className="space-y-2">
            {chDetails.map((c, i) => (
              <div key={i}>
                {editingIdx?.type === "ch" && editingIdx.idx === i ? (
                  <Textarea value={editVal} onChange={(e) => setEditVal(e.target.value)}
                    onBlur={() => { const updated = [...chDetails]; updated[i] = editVal; setChDetails(updated); setEditingIdx(null); }}
                    className="text-[13px] bg-white/[0.02] border-white/[0.07] text-white/65 min-h-16" autoFocus />
                ) : (
                  <div className="flex items-start gap-2 px-3.5 py-3 rounded-lg bg-white/[0.03] border border-white/[0.07] group">
                    <span className="text-[13px] text-white/65 flex-1 leading-relaxed">{c}</span>
                    <button onClick={() => { setEditingIdx({ type: "ch", idx: i }); setEditVal(c); }}
                      className="text-white/15 hover:text-white/40 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Pencil className="size-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Dream connection */}
        {dreamRefined && (
          <section className="space-y-3">
            <p className="text-[10px] tracking-[0.15em] text-amber-400/55 uppercase font-semibold">
              {lang === "kr" ? "연결하고 싶은 분" : "Looking to Connect"}
            </p>
            <div className="px-3.5 py-3 rounded-lg bg-white/[0.03] border border-white/[0.07]">
              <p className="text-[13px] text-white/60 leading-relaxed">{lang === "kr" ? (dreamRefinedKr || dreamRefined) : dreamRefined}</p>
            </div>
          </section>
        )}

        {/* Card Preview */}
        <section className="space-y-3">
          <p className="text-[10px] tracking-[0.15em] text-white/30 uppercase font-medium">{lang === "kr" ? "카드 미리보기" : "Card Preview"}</p>
          <CardPreview />
        </section>

        {/* Actions */}
        <div className="space-y-3 pb-8">
          <Button onClick={handleSave} disabled={saving}
            className="w-full h-11 bg-white text-black hover:bg-white/90 rounded-xl text-sm font-medium">
            {saving ? (lang === "kr" ? "저장 중..." : "Saving...") : (lang === "kr" ? "저장하고 프로필 보기" : "Save & View My Profile")}
          </Button>
          <Button variant="ghost" onClick={() => setStep("challenges")} className="w-full h-9 text-white/30 hover:text-white/50 text-sm">
            <ArrowLeft className="size-4 mr-1" /> {lang === "kr" ? "이전으로" : "Go back"}
          </Button>
          <div className="flex gap-3 justify-center">
            <Button variant="ghost" onClick={() => setStep("about")} className="h-8 text-white/20 hover:text-white/40 text-[11px]">
              {lang === "kr" ? "처음부터 다시" : "Start over"}
            </Button>
            <Button variant="ghost" onClick={generateWithAI} disabled={generating} className="h-8 text-white/20 hover:text-white/40 text-[11px]">
              <RefreshCw className={`size-3 mr-1 ${generating ? "animate-spin" : ""}`} />
              {lang === "kr" ? "다시 생성" : "Regenerate"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // DONE — Card saved + Post-completion transition
  // ════════════════════════════════════════════════════════
  return (
    <div className="space-y-10">
      <CardPreview interactive mode="profile" />

      {/* Post-completion */}
      <div className="text-center space-y-5">
        <div className="space-y-1.5">
          <p className="text-[13px] font-medium text-white/70">
            {lang === "kr" ? "카드가 Elev8에 등록됐습니다." : "Your card is live in Elev8."}
          </p>
          <p className="text-[11px] text-white/35">
            {lang === "kr"
              ? "같은 고민을 가진 멤버들이 당신을 찾게 됩니다."
              : "Peers exploring the same challenges will find you."}
          </p>
        </div>

        <a
          href={`/signal/archive?email=${encodeURIComponent(member.email)}`}
          className="flex w-full h-11 items-center justify-center gap-2 rounded-xl bg-primary text-[13px] font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
        >
          {lang === "kr" ? "지난 Signal 보러 가기" : "Explore past Signals"}
          <ArrowRight className="size-3.5" />
        </a>

        <Button variant="outline" onClick={() => setStep("refine")} className="w-full h-10 text-[13px] border-white/15 text-white/60 hover:text-white/90 hover:border-white/30 hover:bg-white/5 transition-all">
          <Pencil className="size-3.5 mr-1.5" />
          {lang === "kr" ? "카드 수정하기" : "Edit my card"}
        </Button>
      </div>

      {/* Match Suggestions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-amber-400/45" />
            <h3 className="text-sm font-medium text-white/70">
              {lang === "kr" ? "추천 인맥" : "Peers worth your time"}
            </h3>
          </div>
          <button onClick={loadMatches} disabled={loadingMatches} className="text-[10px] text-white/35 hover:text-white/55 transition-colors">
            {loadingMatches ? <RefreshCw className="size-3 animate-spin" /> : (lang === "kr" ? "새로고침" : "Show different peers")}
          </button>
        </div>
        <p className="text-[11px] text-white/30 -mt-2">
          {lang === "kr"
            ? "같이 일하면 빛나는 사람들, Elev8이 골랐습니다"
            : "Selected based on what you're working through right now"}
        </p>

        {matchSuggestions.length > 0 ? (
          <div className="space-y-3">
            {matchSuggestions.slice(0, 2).map((match) => (
              <div key={match.memberId} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
                {/* Superpower + challenge FIRST */}
                <div className="flex flex-col gap-1.5">
                  {match.matchedSuperpower && (
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 text-[10px] text-primary/70 shrink-0 font-semibold uppercase tracking-wider">
                        {lang === "kr" ? "강점" : "Superpower"}
                      </span>
                      <span className="text-[12px] text-white/70 leading-snug font-medium">{match.matchedSuperpower}</span>
                    </div>
                  )}
                  {match.matchedChallenge && (
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 text-[10px] text-amber-400/60 shrink-0 font-semibold uppercase tracking-wider">
                        {lang === "kr" ? "연관" : "Relevant to"}
                      </span>
                      <span className="text-[11px] text-white/45 leading-snug">{match.matchedChallenge}</span>
                    </div>
                  )}
                </div>
                {/* Person SECOND */}
                <div className="flex items-center gap-2.5 pt-1 border-t border-white/[0.04]">
                  {match.imageUrl ? (
                    <img src={match.imageUrl} alt="" className="size-7 rounded-full object-cover ring-1 ring-white/[0.06] shrink-0" />
                  ) : (
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/[0.03] text-[10px] font-medium text-white/40 ring-1 ring-white/[0.06]">
                      {match.firstName[0]}{match.lastName[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-white/60">{match.firstName} {match.lastName}</p>
                    {(match.jobTitle || match.company) && (
                      <p className="text-[10px] text-white/30 truncate">{match.jobTitle}{match.jobTitle && match.company && " · "}{match.company}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <button onClick={loadMatches} disabled={loadingMatches}
            className="w-full rounded-xl border border-dashed border-white/[0.08] py-6 text-center text-[12px] text-white/35 hover:text-white/50 hover:border-white/[0.15] transition-all">
            {loadingMatches ? (
              <span className="flex items-center justify-center gap-2"><RefreshCw className="size-3 animate-spin" /> {lang === "kr" ? "딱 맞는 인맥을 찾고 있어요..." : "Finding your peers..."}</span>
            ) : (lang === "kr" ? "추천 인맥 보기" : "Matches are updated after each Signal report")}
          </button>
        )}
      </div>
    </div>
  );
}
