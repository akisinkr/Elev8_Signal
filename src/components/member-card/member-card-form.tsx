"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
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
  Lock,
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
  // typed challenges
  challengeType1: string | null;
  challengeSpec1: string | null;
  challengeType2: string | null;
  challengeSpec2: string | null;
  // Elev8 Titles
  elev8Titles: string[];
}

interface MemberCardFormProps {
  member: MemberData;
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

type Step = "intro" | "domain" | "action" | "scale" | "stage" | "geo" | "challenges" | "generate" | "refine" | "done";

// ─── 5-Dimension Options ─────────────────────────────────

const DOMAINS = [
  { id: "ai-ml", en: "AI & Machine Learning", kr: "AI & 머신러닝" },
  { id: "data", en: "Data & Analytics", kr: "데이터 & 애널리틱스" },
  { id: "cloud", en: "Cloud & Infrastructure", kr: "클라우드 & 인프라" },
  { id: "security", en: "Cybersecurity", kr: "사이버보안" },
  { id: "platform", en: "Platform Engineering & DevOps", kr: "플랫폼 엔지니어링 & DevOps" },
  { id: "product", en: "Product & Growth Engineering", kr: "프로덕트 & 그로스 엔지니어링" },
  { id: "fintech", en: "FinTech & Digital Payments", kr: "핀테크 & 디지털 결제" },
  { id: "robotics", en: "Robotics & Physical AI", kr: "로보틱스 & 피지컬 AI" },
  { id: "other", en: "+ Other", kr: "+ 기타" },
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
  { id: "technical", en: "Technical", kr: "기술적 문제", icon: "🔧" },
  { id: "leadership", en: "Leadership", kr: "리더십", icon: "👤" },
  { id: "org", en: "Org Navigation", kr: "조직 내 네비게이션", icon: "🏢" },
  { id: "career", en: "Career", kr: "커리어", icon: "🚀" },
  { id: "intro", en: "Introduction", kr: "소개/연결", icon: "🤝" },
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
    { en: "Cross-border org dynamics", kr: "크로스보더 조직 역학" },
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

// Map challenge types to their corresponding Elev8 Title
const CHALLENGE_TO_TITLE: Record<string, string> = {
  technical: "architect",
  leadership: "advisor",
  org: "navigator",
  career: "catalyst",
  intro: "connector",
};

// ─── Component ───────────────────────────────────────────

export function MemberCardForm({ member }: MemberCardFormProps) {
  const hasCard = !!member.cardCompletedAt;

  // Determine initial step: if 5-dim data exists, go to done; if legacy data exists, go to done; else start fresh
  const getInitialStep = (): Step => {
    if (hasCard) return "done";
    if (member.spDomain) return "done"; // already has 5-dim data
    return "intro";
  };
  const [step, setStep] = useState<Step>(getInitialStep);

  // Language
  const [lang, setLang] = useState<"en" | "kr">(member.preferredLang === "kr" ? "kr" : "en");

  // Professional info
  const [company, setCompany] = useState(member.company || "");
  const [jobTitle, setJobTitle] = useState(member.jobTitle || "");
  const [linkedinUrl, setLinkedinUrl] = useState(member.linkedinUrl || "");
  const [knownFor, setKnownFor] = useState(member.knownFor || "");

  // 5-Dimension selections (domain = single, rest = multi up to 3)
  const [spDomain, setSpDomain] = useState(member.spDomain || "");
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

  // Derive titles client-side from selected actions (mirrors server logic)
  const ACTION_TO_TITLE: Record<string, string> = {
    architecture: "architect", building: "architect", migrating: "architect", optimizing: "architect",
    scaling: "advisor", "org-design": "advisor", hiring: "advisor", strategy: "advisor",
    compliance: "navigator", mna: "navigator",
    gtm: "catalyst", crisis: "catalyst",
  };

  // Toggle helper for multi-select arrays (max 3)
  const toggleMulti = (id: string, list: string[], setList: (v: string[]) => void, max = 3) => {
    if (list.includes(id)) setList(list.filter(x => x !== id));
    else if (list.length < max) setList([...list, id]);
  };

  // Compute Elev8 Titles from saved + current action selections
  const earnedTitles = useMemo(() => {
    const titles = new Set(savedTitles);
    for (const a of spActions) {
      if (ACTION_TO_TITLE[a]) titles.add(ACTION_TO_TITLE[a]);
    }
    if (titles.size === 0 && spActions.length > 0) titles.add("connector");
    return Array.from(titles);
  }, [savedTitles, spActions]);

  // Typed challenges (max 2)
  const [challengeType1, setChallengeType1] = useState(member.challengeType1 || "");
  const [challengeSpec1, setChallengeSpec1] = useState(member.challengeSpec1 || "");
  const [challengeType2, setChallengeType2] = useState(member.challengeType2 || "");
  const [challengeSpec2, setChallengeSpec2] = useState(member.challengeSpec2 || "");

  // Legacy keyword state (for backward compat + card display)
  const [selectedSPKeywords, setSelectedSPKeywords] = useState<string[]>(
    member.superpowers.length > 0 ? member.superpowers : []
  );

  // AI-refined descriptions — structured superpowers
  const parseSPProfiles = (details: string[]): SuperpowerProfile[] => {
    return details.map((d) => {
      try {
        const p = JSON.parse(d);
        if (p.title && p.bullets) return p as SuperpowerProfile;
      } catch { /* not JSON — legacy format */ }
      return { title: d, bullets: [], proof: "" };
    });
  };
  const [spProfiles, setSpProfiles] = useState<SuperpowerProfile[]>(
    parseSPProfiles(member.superpowerDetails || [])
  );
  const [spProfilesKr, setSpProfilesKr] = useState<SuperpowerProfile[]>(
    parseSPProfiles(member.superpowerDetailsKr || [])
  );
  const [refinedChallenges, setRefinedChallenges] = useState<string[]>(member.challengeDetails || []);
  const [refinedChallengesKr, setRefinedChallengesKr] = useState<string[]>(member.challengeDetailsKr || []);
  const [generating, setGenerating] = useState(false);

  // Dream connection
  const [dreamConnection, setDreamConnection] = useState(member.dreamConnection || "");
  const [dreamRefined, setDreamRefined] = useState(member.dreamConnectionRefined || "");
  const [dreamRefinedKr, setDreamRefinedKr] = useState(member.dreamConnectionRefinedKr || "");
  const [dreamSuggestions, setDreamSuggestions] = useState<string[]>([]);
  const [showDreamConnect, setShowDreamConnect] = useState(!!member.dreamConnection);
  const [refiningDream, setRefiningDream] = useState(false);

  // Expand/collapse on done card
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

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

  const [saving, setSaving] = useState(false);

  const memberNumber = member.memberNumber ? String(member.memberNumber).padStart(3, "0") : null;
  const memberSince = new Date(member.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const photoUrl = customPhoto || member.imageUrl;

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

      const res = await fetch("/api/members/me/photo", {
        method: "POST",
        body: formData,
      });
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

  // Human-readable names (for display)
  const domainName = spDomain === "other" ? (spDomainCustom || "Other") : dimLabel(DOMAINS, spDomain);
  const actionNames = spActions.map(a => a === "custom" ? (spActionCustom || "Custom") : dimLabel(ACTIONS, a));
  const scaleNames = spScales.map(s => dimLabel(SCALES, s));
  const stageNames = spStages.map(s => dimLabel(STAGES, s));
  const geoNames = spGeos.map(g => g === "geo-other" ? (spGeoCustom || "Other") : dimLabel(GEOS, g));

  // ── AI Generate from 5 dimensions ──
  const generateWithAI = async () => {
    setGenerating(true);
    try {
      // Build challenge hints
      const ch1 = challengeSpec1 ? `${CHALLENGE_TYPES.find(t => t.id === challengeType1)?.en || ""}: ${challengeSpec1}` : "";
      const ch2 = challengeSpec2 ? `${CHALLENGE_TYPES.find(t => t.id === challengeType2)?.en || ""}: ${challengeSpec2}` : "";
      const challengeHint = [ch1, ch2].filter(Boolean).join("; ");

      // Fire both API calls in parallel
      const suggestPromise = fetch("/api/members/me/card/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spDomain: domainName,
          spAction: actionNames.join(", "),
          spScale: scaleNames.join(", "),
          spStage: stageNames.join(", "),
          spGeo: geoNames.join(", "),
          challengeHint,
          jobTitle,
          company,
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
      if (!suggestRes.ok) {
        throw new Error(data.detail || data.error || "Failed");
      }

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

      // Derive legacy keyword arrays from dimensions for card display
      setSelectedSPKeywords([domainName, ...actionNames]);

      if (dreamRes?.ok) {
        const dreamData = await dreamRes.json();
        setDreamRefined(dreamData.refined || "");
        setDreamRefinedKr(dreamData.refinedKr || "");
        setDreamSuggestions(dreamData.suggestions || []);
      }

      setStep("refine");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Couldn't generate: ${msg}`);
    } finally {
      setGenerating(false);
    }
  };

  // ── Refine dream connection ──
  const refineDream = async () => {
    if (!dreamConnection.trim()) return;
    setRefiningDream(true);
    try {
      const res = await fetch("/api/members/me/card/refine-dream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawDescription: dreamConnection, jobTitle, company }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setDreamRefined(data.refined || "");
      setDreamRefinedKr(data.refinedKr || "");
      setDreamSuggestions(data.suggestions || []);
    } catch {
      toast.error("Couldn't refine. Try again.");
    } finally {
      setRefiningDream(false);
    }
  };

  // ── Load match suggestions ──
  const loadMatches = useCallback(async () => {
    setLoadingMatches(true);
    try {
      const res = await fetch("/api/members/me/card/match-suggestions");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setMatchSuggestions(data.matches || []);
    } catch {
      // silently fail
    } finally {
      setLoadingMatches(false);
    }
  }, []);

  // ── Save ──
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/members/me/card", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // 5 dimensions (arrays joined as comma-separated)
          spDomain,
          spAction: spActions.join(","),
          spScale: spScales.join(","),
          spStage: spStages.join(","),
          spGeo: spGeos.join(","),
          spDomainCustom: spDomain === "other" ? spDomainCustom : undefined,
          spActionCustom: spActions.includes("custom") ? spActionCustom : undefined,
          // typed challenges
          challengeType1: challengeType1 || undefined,
          challengeSpec1: challengeSpec1 || undefined,
          challengeType2: challengeType2 || undefined,
          challengeSpec2: challengeSpec2 || undefined,
          // legacy arrays (for backward compat + matching)
          superpowers: selectedSPKeywords,
          superpowerDetails: spProfiles.map((p) => JSON.stringify(p)),
          challenges: [challengeSpec1, challengeSpec2].filter(Boolean),
          challengeDetails: refinedChallenges,
          dreamConnection,
          dreamConnectionRefined: dreamRefined || undefined,
          preferredLang: lang,
          superpowersKr: selectedSPKeywords.map((_, i) => spProfilesKr[i]?.title || ""),
          superpowerDetailsKr: spProfilesKr.map((p) => JSON.stringify(p)),
          challengesKr: [challengeSpec1, challengeSpec2].filter(Boolean).map((_, i) => refinedChallengesKr[i] || ""),
          challengeDetailsKr: refinedChallengesKr,
          dreamConnectionKr: dreamRefinedKr || undefined,
          dreamConnectionRefinedKr: dreamRefinedKr || undefined,
          knownFor,
          company,
          jobTitle,
          linkedinUrl,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Save failed (${res.status})`);
      }
      const savedData = await res.json();
      if (savedData.elev8Titles) setSavedTitles(savedData.elev8Titles);
      setStep("done");
      toast.success("Your member card is complete.");
      loadMatches();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(msg);
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  // ── Language toggle ──
  const LanguageToggle = () => (
    <div className="flex items-center rounded-full border border-white/[0.08] bg-white/[0.02] overflow-hidden">
      <button
        onClick={() => setLang("en")}
        className={`px-3 py-1 text-[10px] font-medium transition-all ${
          lang === "en"
            ? "bg-amber-400/15 text-amber-300/70"
            : "text-white/25 hover:text-white/40"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang("kr")}
        className={`px-3 py-1 text-[10px] font-medium transition-all ${
          lang === "kr"
            ? "bg-amber-400/15 text-amber-300/70"
            : "text-white/25 hover:text-white/40"
        }`}
      >
        KR
      </button>
    </div>
  );

  // ── Clean display text ──
  const cleanText = (text: string) => text.replace(/\(\s*$/, "").replace(/\)\s*$/, ")").trim();

  // ── Dimension Option Button ──
  const DimOption = ({ selected, label, onClick, icon }: {
    selected: boolean; label: string; onClick: () => void; icon?: string;
  }) => (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all ${
        selected
          ? "bg-amber-400/10 border-amber-400/25 text-amber-300/80"
          : "bg-white/[0.02] border-white/[0.06] text-white/50 hover:border-white/[0.12] hover:text-white/70"
      }`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      <span className="text-[13px]">{label}</span>
      {selected && <Check className="size-4 inline ml-2 text-amber-400/60" />}
    </button>
  );

  // ── Hide page header during generate/refine/done steps ──
  useEffect(() => {
    const header = document.getElementById("profile-page-header");
    if (!header) return;
    if (step === "intro" || step === "generate" || step === "refine" || step === "done") {
      header.style.display = "none";
    } else {
      header.style.display = "";
    }
  }, [step]);

  // ── Progress indicator ── (intro is not counted as a numbered step)
  const WIZARD_STEPS: Step[] = ["intro", "domain", "action", "scale", "stage", "geo", "challenges"];
  const NUMBERED_STEPS: Step[] = ["domain", "action", "scale", "stage", "geo", "challenges"];
  const wizardIdx = WIZARD_STEPS.indexOf(step);
  const numberedIdx = NUMBERED_STEPS.indexOf(step);
  const totalNumberedSteps = NUMBERED_STEPS.length;

  const ProgressBar = () => numberedIdx >= 0 ? (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-white/30">
          {lang === "kr" ? `${numberedIdx + 1} / ${totalNumberedSteps} 단계` : `Step ${numberedIdx + 1} of ${totalNumberedSteps}`}
        </span>
        <LanguageToggle />
      </div>
      <div className="h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400/40 transition-all duration-300"
          style={{ width: `${((numberedIdx + 1) / totalNumberedSteps) * 100}%` }}
        />
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
      <Button
        onClick={onNext}
        disabled={!canNext}
        className="flex-1 h-10 bg-white text-black hover:bg-white/90 rounded-xl text-sm font-medium disabled:opacity-30"
      >
        {nextLabel || (lang === "kr" ? "다음" : "Next")} <ArrowRight className="size-4 ml-1" />
      </Button>
    </div>
  );

  // ── Card Preview ──
  const CardPreview = ({ interactive, mode = "full" }: { interactive?: boolean; mode?: "compact" | "full" }) => {
    const profiles = lang === "kr" ? spProfilesKr : spProfiles;
    const chDetails = lang === "kr" ? refinedChallengesKr : refinedChallenges;
    const dreamText = lang === "kr"
      ? (dreamRefinedKr || dreamConnection)
      : (dreamRefined || dreamConnection);
    const primaryProfile = profiles[0];
    const domainBadges = profiles.slice(1);
    const spExpanded = expandedItem === "sp-primary";

    // Challenge display labels
    const chLabels = [challengeSpec1, challengeSpec2].filter(Boolean) as string[];

    return (
      <>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes borderGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        .animate-shimmer { animation: shimmer 2.5s ease-in-out infinite; }
        .animate-border-glow { animation: borderGlow 3s ease-in-out infinite; }
        .bg-gradient-conic { background: conic-gradient(from 0deg, var(--tw-gradient-stops)); }
      `}</style>
      <div className={`relative ${mode === "full" ? "animate-in fade-in zoom-in-95 duration-500" : ""}`}>
        {/* Ambient glow */}
        <div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-amber-500/[0.06] via-amber-400/[0.02] to-transparent blur-2xl animate-pulse" style={{ animationDuration: "3s" }} />
        {/* Rotating border glow */}
        <div className="absolute -inset-[1px] rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-conic from-amber-400/20 via-transparent via-30% to-amber-400/10 animate-spin" style={{ animationDuration: "8s" }} />
        </div>
        <div className="relative rounded-2xl border border-white/[0.10] bg-[#111118] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5),0_0_80px_rgba(251,191,36,0.04),inset_0_1px_0_rgba(255,255,255,0.03)]">
          {/* Top accent line with shimmer */}
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
                  <>
                    <span className="text-white/[0.08]">|</span>
                    <span className="text-[10px] tracking-wider text-white/30">#{memberNumber}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {mode === "full" && <LanguageToggle />}
              </div>
            </div>

            {/* Profile + Badge Tier */}
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
                    <a href={linkedinUrl.startsWith("http") ? linkedinUrl : `https://${linkedinUrl}`} target="_blank" rel="noopener noreferrer"
                      className="text-white/20 hover:text-blue-400/60 transition-colors">
                      <Linkedin className="size-3.5" />
                    </a>
                  )}
                </div>
                {(jobTitle || company) && (
                  <p className="text-[12px] text-white/50 mt-0.5 truncate">
                    {cleanText(jobTitle)}{jobTitle && company && " · "}{cleanText(company)}
                  </p>
                )}
              </div>
            </div>
            {/* Founding Member + Elev8 Titles */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 ml-[3.75rem] mb-5">
              <div className="relative group/fm flex items-center gap-1 cursor-help">
                <span className="text-amber-400/50 text-[11px]" style={{ textShadow: "0 0 6px rgba(251,191,36,0.3)" }}>◆</span>
                <span className="text-[10px] text-amber-400/40 font-medium tracking-wide group-hover/fm:text-amber-400/60 transition-colors" style={{ textShadow: "0 0 8px rgba(251,191,36,0.1)" }}>
                  Founding Member
                </span>
                <div className="absolute bottom-full left-0 mb-1.5 px-2.5 py-1.5 rounded-md bg-[#1a1a1a] border border-white/[0.08] text-[10px] text-white/60 whitespace-nowrap opacity-0 pointer-events-none group-hover/fm:opacity-100 transition-opacity duration-150 z-10">
                  {lang === "kr" ? "Elev8 초기 멤버로서 커뮤니티를 함께 만들어가고 있습니다" : "One of the first members shaping the Elev8 community"}
                </div>
              </div>
              {earnedTitles.length > 0 && (
                <>
                  <span className="text-white/[0.08]">|</span>
                  {earnedTitles.map((t) => {
                    const title = ELEV8_TITLES[t];
                    return title ? (
                      <div key={t} className="relative group/et flex items-center cursor-help">
                        <span className="text-[10px] text-white/45 font-medium group-hover/et:text-white/65 transition-colors">
                          {title.icon} {lang === "kr" ? title.kr : title.en}
                        </span>
                        <div className="absolute bottom-full left-0 mb-1.5 px-2.5 py-1.5 rounded-md bg-[#1a1a1a] border border-white/[0.08] text-[10px] text-white/60 whitespace-nowrap opacity-0 pointer-events-none group-hover/et:opacity-100 transition-opacity duration-150 z-10">
                          {lang === "kr" ? title.descKr : title.descEn}
                        </div>
                      </div>
                    ) : null;
                  })}
                </>
              )}
            </div>

            {/* ── Divider ── */}
            <div className="h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-4" />

            {/* Primary Superpower */}
            {primaryProfile?.title ? (
              <div className="mb-4 space-y-2">
                {/* Verified label */}
                <div className="flex items-center gap-1.5">
                  <Check className="size-3 text-amber-400/60" />
                  <p className="text-[9px] tracking-[0.2em] text-amber-400/55 uppercase font-semibold">
                    {lang === "kr" ? "검증된 핵심 역량" : "Verified Superpower"}
                  </p>
                </div>

                {/* Title + expand/collapse */}
                <button
                  onClick={() => setExpandedItem(spExpanded ? null : "sp-primary")}
                  className="flex items-start justify-between w-full text-left group"
                >
                  <h3 className="text-[22px] font-bold text-white/95 tracking-tight leading-tight pr-3" style={{ textShadow: "0 0 20px rgba(251,191,36,0.08)" }}>
                    {primaryProfile.title}
                  </h3>
                  {primaryProfile.bullets.length > 0 && (
                    <span className="mt-1 shrink-0 text-white/25 group-hover:text-white/45 transition-colors">
                      {spExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </span>
                  )}
                </button>

                {/* Expanded: Bullets + Proof */}
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
                        <button
                          key={i}
                          onClick={() => setExpandedItem(expandedItem === `badge-${i}` ? null : `badge-${i}`)}
                          className={`text-[11px] px-3 py-1.5 rounded-full border transition-all cursor-pointer hover:border-amber-400/20 hover:text-white/60 ${
                            expandedItem === `badge-${i}` ? "bg-amber-400/[0.06] border-amber-400/20 text-amber-300/70" : "text-white/45 bg-white/[0.02] border-white/[0.06]"
                          }`}
                        >
                          {badge.title || `Domain ${i + 2}`}
                          {badge.bullets.length > 0 && (
                            expandedItem === `badge-${i}` ? <ChevronUp className="size-3 inline ml-1 opacity-50" /> : <ChevronDown className="size-3 inline ml-1 opacity-50" />
                          )}
                        </button>
                      ))}
                    </div>
                    {domainBadges.map((badge, i) => (
                      expandedItem === `badge-${i}` && badge.bullets.length > 0 && (
                        <div key={`badge-detail-${i}`} className="rounded-lg bg-white/[0.015] px-3 py-2.5 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                          <p className="text-[9px] text-white/25 italic">
                            {lang === "kr" ? "이런 도움을 드릴 수 있습니다:" : "I can help you with:"}
                          </p>
                          {badge.bullets.map((b, j) => (
                            <div key={j} className="flex items-start gap-2">
                              <span className="text-amber-400/25 text-[11px] mt-[1px] shrink-0">→</span>
                              <span className="text-[11px] text-white/45 leading-snug">{b}</span>
                            </div>
                          ))}
                          {badge.proof && (
                            <p className="text-[9px] text-white/25 italic mt-1 pt-1 border-t border-white/[0.03]">{badge.proof}</p>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* No profile yet — show dimension summary */
              spDomain && (
                <div className="mb-4">
                  <p className="text-[9px] tracking-[0.2em] text-amber-400/45 uppercase font-semibold mb-2">
                    {lang === "kr" ? "핵심 역량" : "Superpower"}
                  </p>
                  <p className="text-[14px] text-white/60">
                    {domainName} · {actionNames.join(", ")}
                  </p>
                  {spScales.length > 0 && <p className="text-[11px] text-white/30 mt-1">{scaleNames.join(", ")} · {stageNames.join(", ")} · {geoNames.join(", ")}</p>}
                </div>
              )
            )}

            {/* ── Full mode only: Exploring + Connect + CTA ── */}
            {mode === "full" && (
              <>
                {/* Divider */}
                <div className="h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-5 mt-1" />

                {/* Currently Exploring */}
                {chLabels.length > 0 && (
                  <div className="mb-5">
                    <div className="flex items-center gap-1.5 mb-2">
                      <p className="text-[8px] tracking-[0.2em] text-white/30 uppercase font-medium">
                        {lang === "kr" ? "함께 풀고 싶은 고민" : "Seeking Perspectives"}
                      </p>
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/[0.02] border border-white/[0.05]">
                        <Lock className="size-2 text-white/20" />
                        <span className="text-[7px] text-white/20 uppercase tracking-wide">
                          {lang === "kr" ? "매칭 후 공개" : "Matches only"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {chLabels.map((c, i) => {
                        const cType = i === 0 ? challengeType1 : challengeType2;
                        const typeInfo = CHALLENGE_TYPES.find(t => t.id === cType);
                        return (
                          <button
                            key={i}
                            onClick={() => interactive && setExpandedItem(expandedItem === `ch-${i}` ? null : `ch-${i}`)}
                            className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                              interactive ? "cursor-pointer hover:border-white/15 hover:text-white/55" : ""
                            } ${expandedItem === `ch-${i}` ? "bg-white/[0.04] border-white/[0.12] text-white/60" : "text-white/40 bg-white/[0.02] border-white/[0.06]"}`}
                          >
                            {typeInfo?.icon} {lang === "kr" ? (CHALLENGE_OPTIONS[cType || ""]?.find(o => o.en === c)?.kr || c) : c}
                            {interactive && chDetails[i] && (
                              expandedItem === `ch-${i}` ? <ChevronUp className="size-2.5 inline ml-1 opacity-50" /> : <ChevronDown className="size-2.5 inline ml-1 opacity-50" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {interactive && chLabels.map((_, i) => (
                      expandedItem === `ch-${i}` && chDetails[i] && (
                        <p key={`ch-detail-${i}`} className="mt-2 text-[11px] text-white/40 leading-relaxed px-1 animate-in fade-in slide-in-from-top-1 duration-200">
                          {chDetails[i]}
                        </p>
                      )
                    ))}
                  </div>
                )}

                {/* Divider before Looking to Connect */}
                {dreamText && chLabels.length > 0 && (
                  <div className="h-[1px] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent mb-5" />
                )}

                {/* Looking to Connect — tag style with expand */}
                {dreamText && (
                  <div className="mb-5">
                    <p className="text-[8px] tracking-[0.2em] text-white/30 uppercase mb-2 font-medium">
                      {lang === "kr" ? "연결하고 싶은 분" : "Looking to Connect"}
                    </p>
                    <button
                      onClick={() => interactive && setExpandedItem(expandedItem === "dream" ? null : "dream")}
                      className={`text-[11px] px-3 py-1.5 rounded-full border transition-all ${
                        interactive ? "cursor-pointer hover:border-white/15 hover:text-white/55" : ""
                      } ${expandedItem === "dream" ? "bg-white/[0.04] border-white/[0.12] text-white/60" : "text-white/40 bg-white/[0.02] border-white/[0.06]"}`}
                    >
                      {dreamText.length > 40 ? dreamText.slice(0, 40) + "…" : dreamText}
                      {interactive && dreamText.length > 40 && (
                        expandedItem === "dream" ? <ChevronUp className="size-2.5 inline ml-1 opacity-50" /> : <ChevronDown className="size-2.5 inline ml-1 opacity-50" />
                      )}
                    </button>
                    {expandedItem === "dream" && dreamText.length > 40 && (
                      <p className="mt-2 text-[11px] text-white/40 leading-relaxed px-1 animate-in fade-in slide-in-from-top-1 duration-200">
                        {dreamText}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Request Exchange CTA */}
            {(primaryProfile?.title || spDomain) && (
              <div className={`${mode === "full" ? "pt-2" : "pt-3"}`}>
                {mode === "compact" ? (
                  <div className="flex gap-2">
                    <button className="flex-1 h-9 rounded-lg border border-white/[0.08] bg-white/[0.02] text-[11px] text-white/40 hover:text-white/60 hover:border-white/[0.12] transition-all">
                      {lang === "kr" ? "프로필 보기" : "View Profile"}
                    </button>
                    <button className="flex-1 h-9 rounded-lg bg-amber-400/90 text-[11px] text-black font-semibold hover:bg-amber-400 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(251,191,36,0.2),0_0_40px_rgba(251,191,36,0.08)] animate-border-glow">
                      <Sparkles className="size-3" />
                      {lang === "kr" ? "교류 요청" : "Request Exchange"}
                    </button>
                  </div>
                ) : (
                  <button className="w-full h-11 rounded-xl bg-amber-400/90 text-[13px] text-black font-semibold hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(251,191,36,0.2),0_0_50px_rgba(251,191,36,0.08)] animate-border-glow">
                    <Sparkles className="size-3.5" />
                    {lang === "kr" ? "교류 요청하기" : "Request Exchange"}
                  </button>
                )}
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
  // INTRO STEP — Explain Superpower & Elev8 Titles
  // ════════════════════════════════════════════════════════
  if (step === "intro") {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <LanguageToggle />
        </div>
        <div className="space-y-5">
          {/* Superpower explanation */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-amber-400/70 text-lg">✦</span>
              <h3 className="text-sm font-semibold text-white/85">
                {lang === "kr" ? "Superpower란?" : "What's a Superpower?"}
              </h3>
            </div>
            <p className="text-[12px] text-white/50 leading-relaxed">
              {lang === "kr"
                ? "당신만의 전문성과 경험입니다. 어떤 분야에서, 어떤 규모로, 어떤 역할을 해왔는지 — 이것이 다른 멤버가 당신을 찾는 이유가 됩니다."
                : "Your unique expertise and experience. What domain you work in, what you do best, and at what scale — this is how other members find and connect with you."}
            </p>
          </div>

          {/* Elev8 Titles explanation */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡💡🧭🚀🔗</span>
            </div>
            <h3 className="text-sm font-semibold text-white/85">
              {lang === "kr" ? "Elev8 Titles란?" : "What are Elev8 Titles?"}
            </h3>
            <p className="text-[12px] text-white/50 leading-relaxed">
              {lang === "kr"
                ? "커뮤니티에서 다른 멤버를 도운 경험이 인정받으면 얻는 타이틀입니다. 처음에는 당신의 Superpower에 기반한 기본 타이틀이 부여되고, 실제로 다른 멤버의 고민을 해결하고 긍정적인 피드백을 받으면 타이틀이 추가됩니다."
                : "Titles you earn by helping other members in the community. You'll start with a default title based on your superpower. As you help others solve real challenges and receive positive peer feedback, you earn more titles."}
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {Object.entries(ELEV8_TITLES).map(([key, t]) => (
                <span key={key} className="text-[10px] text-white/35 bg-white/[0.03] border border-white/[0.05] rounded-full px-2.5 py-1">
                  {t.icon} {lang === "kr" ? t.kr : t.en}
                </span>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="rounded-xl border border-amber-400/[0.08] bg-amber-400/[0.02] p-5 space-y-2">
            <h3 className="text-[11px] font-semibold text-amber-300/70 uppercase tracking-wider">
              {lang === "kr" ? "어떻게 진행되나요?" : "How this works"}
            </h3>
            <div className="space-y-2">
              {[
                { n: "1", en: "Define your Superpower (5 quick questions)", kr: "Superpower 정의하기 (5개 질문)" },
                { n: "2", en: "Share what you're working through right now", kr: "현재 고민하고 있는 것 공유하기" },
                { n: "3", en: "AI builds your profile — you review & edit", kr: "AI가 프로필 생성 — 직접 검토 & 수정" },
                { n: "4", en: "Get your first Elev8 Title automatically", kr: "첫 번째 Elev8 Title 자동 부여" },
              ].map((s) => (
                <div key={s.n} className="flex items-start gap-2.5">
                  <span className="text-[10px] text-amber-400/50 font-bold mt-0.5">{s.n}</span>
                  <p className="text-[11px] text-white/45">{lang === "kr" ? s.kr : s.en}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <NavButtons
          onNext={() => setStep("domain")}
          canNext={true}
        />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // STEP 1: DOMAIN — "Which domain?"
  // ════════════════════════════════════════════════════════
  if (step === "domain") {
    return (
      <div className="space-y-6">
        <ProgressBar />

        {/* About you section */}
        <section className="space-y-4 rounded-xl border border-white/[0.05] bg-white/[0.01] p-5">
          <h3 className="text-sm font-medium text-white/80">{lang === "kr" ? "기본 정보" : "About you"}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-white/40 font-medium">Title</label>
              <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="VP of Engineering" className="h-9 bg-white/[0.03] border-white/[0.07] text-sm placeholder:text-white/25" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-white/40 font-medium">Company</label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Google" className="h-9 bg-white/[0.03] border-white/[0.07] text-sm placeholder:text-white/25" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-white/40 font-medium">LinkedIn</label>
            <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="linkedin.com/in/you" className="h-9 bg-white/[0.03] border-white/[0.07] text-sm placeholder:text-white/25" />
          </div>

          {/* Photo upload */}
          <div className="space-y-2">
            <label className="text-[10px] text-white/40 font-medium">
              {lang === "kr" ? "프로필 사진" : "Profile Photo"}
            </label>
            <div className="flex items-center gap-3">
              <label className="relative cursor-pointer group">
                {photoUrl ? (
                  <img src={photoUrl} alt="" className="size-12 rounded-full object-cover ring-1 ring-white/10 group-hover:ring-amber-400/30 transition-all" />
                ) : (
                  <div className="size-12 rounded-full bg-white/[0.05] border border-white/[0.08] group-hover:border-amber-400/25 flex items-center justify-center transition-all">
                    <Camera className="size-5 text-white/20 group-hover:text-amber-400/50 transition-colors" />
                  </div>
                )}
                {uploadingPhoto && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                    <RefreshCw className="size-4 text-amber-400/60 animate-spin" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  className="hidden"
                />
              </label>
              <p className="text-[9px] text-white/25">
                {lang === "kr" ? "클릭하여 업로드 · JPG, PNG, WebP · 최대 5MB" : "Click to upload · JPG, PNG, or WebP · Max 5MB"}
              </p>
            </div>
            {!photoUrl && !photoPromptDismissed && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-400/10 bg-amber-400/[0.02]">
                <p className="text-[10px] text-amber-300/40 flex-1">
                  {lang === "kr" ? "💡 사진이 있으면 연결 요청이 3배 더 많아집니다" : "💡 Members with photos get 3x more connection requests"}
                </p>
                <button onClick={() => setPhotoPromptDismissed(true)} className="text-white/15 hover:text-white/30">
                  <X className="size-3" />
                </button>
              </div>
            )}
          </div>
        </section>

        <div className="h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <div>
          <h3 className="text-sm font-medium text-white/80 mb-1">
            {lang === "kr" ? "어떤 분야의 전문가인가요?" : "Which domain best describes your expertise?"}
          </h3>
          <p className="text-[11px] text-white/35 mb-4">
            {lang === "kr" ? "하나만 선택하세요 — 이 분야에서 당신을 찾게 됩니다" : "Pick one — this is how other members will find you"}
          </p>
          <div className="space-y-2">
            {DOMAINS.map((d) => (
              <DimOption
                key={d.id}
                selected={spDomain === d.id}
                label={lang === "kr" ? d.kr : d.en}
                onClick={() => setSpDomain(d.id)}
              />
            ))}
          </div>
          {spDomain === "other" && (
            <Input
              value={spDomainCustom}
              onChange={(e) => setSpDomainCustom(e.target.value)}
              placeholder={lang === "kr" ? "분야를 입력하세요 (예: Product Management)" : "Type your domain (e.g. Product Management)"}
              className="mt-3 h-10 bg-white/[0.03] border-white/[0.07] text-sm placeholder:text-white/25"
              autoFocus
            />
          )}
        </div>

        <NavButtons
          onNext={() => setStep("action")}
          canNext={!!spDomain && (spDomain !== "other" || !!spDomainCustom.trim())}
          onBack={() => setStep("intro")}
        />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // STEP 2: ACTION — "What do you do?" (multi-select up to 3)
  // ════════════════════════════════════════════════════════
  if (step === "action") {
    return (
      <div className="space-y-6">
        <ProgressBar />
        <div>
          <h3 className="text-sm font-medium text-white/80 mb-1">
            {lang === "kr"
              ? `${domainName}에서 무엇을 잘하시나요?`
              : `What makes you exceptional in ${domainName}?`}
          </h3>
          <p className="text-[11px] text-white/35 mb-1">
            {lang === "kr" ? "최대 3개 선택" : "Select up to 3"}
            {spActions.length > 0 && <span className="text-amber-400/50 ml-1">({spActions.length}/3)</span>}
          </p>
          <p className="text-[10px] text-amber-400/30 mb-4">
            {lang === "kr" ? "✦ 이 선택이 당신의 첫 번째 Elev8 Title을 결정합니다" : "✦ This determines your first Elev8 Title"}
          </p>
          <div className="space-y-2">
            {ACTIONS.map((a) => (
              <DimOption
                key={a.id}
                selected={spActions.includes(a.id)}
                label={lang === "kr" ? a.kr : a.en}
                onClick={() => toggleMulti(a.id, spActions, setSpActions)}
              />
            ))}
          </div>
          {spActions.includes("custom") && (
            <Input
              value={spActionCustom}
              onChange={(e) => setSpActionCustom(e.target.value)}
              placeholder={lang === "kr" ? "구체적인 역할을 입력하세요" : "Describe your specific expertise"}
              className="mt-3 h-10 bg-white/[0.03] border-white/[0.07] text-sm placeholder:text-white/25"
              autoFocus
            />
          )}
        </div>
        <NavButtons
          onNext={() => setStep("scale")}
          canNext={spActions.length > 0 && (!spActions.includes("custom") || !!spActionCustom.trim())}
          onBack={() => setStep("domain")}
        />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // STEP 3: SCALE — "How big?" (multi-select up to 3)
  // ════════════════════════════════════════════════════════
  if (step === "scale") {
    return (
      <div className="space-y-6">
        <ProgressBar />
        <div>
          <h3 className="text-sm font-medium text-white/80 mb-1">
            {lang === "kr" ? "어느 규모에서 경험하셨나요?" : "At what scale have you done this?"}
          </h3>
          <p className="text-[11px] text-white/35 mb-4">
            {lang === "kr" ? "최대 3개 선택" : "Select up to 3"}
            {spScales.length > 0 && <span className="text-amber-400/50 ml-1">({spScales.length}/3)</span>}
          </p>
          <div className="space-y-2">
            {SCALES.map((s) => (
              <DimOption
                key={s.id}
                selected={spScales.includes(s.id)}
                label={lang === "kr" ? s.kr : s.en}
                onClick={() => toggleMulti(s.id, spScales, setSpScales)}
              />
            ))}
          </div>
        </div>
        <NavButtons
          onNext={() => setStep("stage")}
          canNext={spScales.length > 0}
          onBack={() => setStep("action")}
        />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // STEP 4: STAGE — "What company stage?" (multi-select up to 3)
  // ════════════════════════════════════════════════════════
  if (step === "stage") {
    return (
      <div className="space-y-6">
        <ProgressBar />
        <div>
          <h3 className="text-sm font-medium text-white/80 mb-1">
            {lang === "kr" ? "어떤 단계의 회사에서 경험하셨나요?" : "At what company stage?"}
          </h3>
          <p className="text-[11px] text-white/35 mb-4">
            {lang === "kr" ? "최대 3개 선택" : "Select up to 3"}
            {spStages.length > 0 && <span className="text-amber-400/50 ml-1">({spStages.length}/3)</span>}
          </p>
          <div className="space-y-2">
            {STAGES.map((s) => (
              <DimOption
                key={s.id}
                selected={spStages.includes(s.id)}
                label={lang === "kr" ? s.kr : s.en}
                onClick={() => toggleMulti(s.id, spStages, setSpStages)}
              />
            ))}
          </div>
        </div>
        <NavButtons
          onNext={() => setStep("geo")}
          canNext={spStages.length > 0}
          onBack={() => setStep("scale")}
        />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // STEP 5: GEOGRAPHY — "Where?" (multi-select up to 3)
  // ════════════════════════════════════════════════════════
  if (step === "geo") {
    return (
      <div className="space-y-6">
        <ProgressBar />
        <div>
          <h3 className="text-sm font-medium text-white/80 mb-1">
            {lang === "kr" ? "어디에서 경험하셨나요?" : "Where did you do this?"}
          </h3>
          <p className="text-[11px] text-white/35 mb-4">
            {lang === "kr" ? "최대 3개 선택" : "Select up to 3"}
            {spGeos.length > 0 && <span className="text-amber-400/50 ml-1">({spGeos.length}/3)</span>}
          </p>
          <div className="space-y-2">
            {GEOS.map((g) => (
              <DimOption
                key={g.id}
                selected={spGeos.includes(g.id)}
                label={lang === "kr" ? g.kr : g.en}
                onClick={() => toggleMulti(g.id, spGeos, setSpGeos)}
              />
            ))}
          </div>
          {spGeos.includes("geo-other") && (
            <Input
              value={spGeoCustom}
              onChange={(e) => setSpGeoCustom(e.target.value)}
              placeholder={lang === "kr" ? "지역을 입력하세요" : "Type your region"}
              className="mt-3 h-10 bg-white/[0.03] border-white/[0.07] text-sm placeholder:text-white/25"
              autoFocus
            />
          )}
        </div>
        <NavButtons
          onNext={() => setStep("challenges")}
          canNext={spGeos.length > 0 && (!spGeos.includes("geo-other") || !!spGeoCustom.trim())}
          onBack={() => setStep("stage")}
        />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // STEP 6: CHALLENGES — "Where could you use a hand?"
  // ════════════════════════════════════════════════════════
  if (step === "challenges") {
    // Helper to render a challenge block with type + spec + custom "Other"
    const renderChallengeBlock = (idx: number, type: string, setType: (v: string) => void, spec: string, setSpec: (v: string) => void, customText: string, setCustomText: (v: string) => void) => (
      <div className="space-y-3">
        <p className="text-[10px] tracking-[0.15em] text-amber-400/55 uppercase font-semibold">
          {idx === 1
            ? (lang === "kr" ? "고민 1" : "Challenge 1")
            : (lang === "kr" ? "고민 2 (선택)" : "Challenge 2 (optional)")}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {CHALLENGE_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => { setType(t.id); setSpec(""); setCustomText(""); }}
              className={`text-[11px] px-3 py-1.5 rounded-full border transition-all ${
                type === t.id
                  ? "bg-amber-400/10 border-amber-400/25 text-amber-300/80"
                  : "bg-white/[0.02] border-white/[0.06] text-white/40 hover:border-white/[0.12]"
              }`}
            >
              {t.icon} {lang === "kr" ? t.kr : t.en}
            </button>
          ))}
        </div>
        {type && CHALLENGE_OPTIONS[type] && (
          <div className="space-y-1.5 pl-1">
            {CHALLENGE_OPTIONS[type].map((opt) => (
              <button
                key={opt.en}
                onClick={() => { if (opt.en !== spec) { setSpec(opt.en); setCustomText(""); } }}
                className={`block w-full text-left px-3.5 py-2.5 rounded-lg border text-[12px] transition-all ${
                  spec === opt.en
                    ? "bg-amber-400/[0.06] border-amber-400/20 text-white/70"
                    : "bg-white/[0.02] border-white/[0.05] text-white/45 hover:border-white/[0.1]"
                }`}
              >
                {lang === "kr" ? opt.kr : opt.en}
              </button>
            ))}
            {spec === "Other" && (
              <Input
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder={lang === "kr" ? "구체적으로 적어주세요" : "Describe your specific challenge"}
                className="mt-2 h-9 bg-white/[0.03] border-white/[0.07] text-sm placeholder:text-white/25"
                autoFocus
              />
            )}
            {spec && spec !== "Other" && (
              <div className="mt-3 space-y-1.5">
                <p className="text-[11px] text-white/50 font-medium">
                  {lang === "kr" ? "자세히 알려주세요 *" : "Tell us more *"}
                </p>
                <p className="text-[10px] text-white/30 leading-relaxed">
                  {lang === "kr"
                    ? "구체적으로 적을수록 같은 고민을 해결한 멤버를 정확히 매칭할 수 있습니다."
                    : "The more specific you are, the better we can match you with someone who's solved this exact problem."}
                </p>
                <Textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder={lang === "kr" ? "예: 시리즈 B에서 엔지니어링 팀을 20명에서 50명으로 스케일하면서 문화를 유지하는 게 어렵습니다" : "e.g. Struggling to maintain eng culture while scaling from 20 to 50 at Series B"}
                  className="min-h-14 bg-white/[0.03] border-white/[0.07] text-sm placeholder:text-white/25 leading-relaxed"
                  maxLength={300}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );

    // Resolve actual spec (if "Other", use custom text)
    const resolvedSpec1 = challengeSpec1 === "Other" ? customChallengeText1 : challengeSpec1;

    return (
      <div className="space-y-6">
        <ProgressBar />
        <div>
          <h3 className="text-sm font-medium text-white/80 mb-1">
            {lang === "kr" ? "요즘 어떤 고민이 있으세요?" : "Where could you use a hand right now?"}
          </h3>
          <p className="text-[11px] text-white/35 mb-0.5">
            {lang === "kr" ? "최대 2개 — 이 고민을 해결한 멤버와 매칭됩니다" : "Up to 2 — we'll match you with members who've solved this"}
          </p>
          <p className="text-[10px] text-white/25 mb-2">
            {lang === "kr" ? "매칭된 멤버에게만 공개됩니다" : "Only visible to matched peers"}
          </p>

          {/* Why this matters */}
          <div className="rounded-lg border border-amber-400/10 bg-amber-400/[0.02] px-3.5 py-2.5 mb-5">
            <p className="text-[11px] text-amber-300/50 leading-relaxed">
              {lang === "kr"
                ? "💡 솔직하고 구체적일수록 좋습니다. 이 정보를 바탕으로 정확히 도움을 줄 수 있는 멤버를 매칭해 드립니다. 다른 멤버에게는 절대 공개되지 않습니다."
                : "💡 The more honest and specific you are, the better we can match you with someone who's solved this exact problem. This stays completely private — only matched members see it."}
            </p>
          </div>

          {/* Challenge 1 */}
          <div className="mb-6">
            {renderChallengeBlock(1, challengeType1, setChallengeType1, challengeSpec1, setChallengeSpec1, customChallengeText1, setCustomChallengeText1)}
          </div>

          {/* Challenge 2 (optional) */}
          {resolvedSpec1 && renderChallengeBlock(2, challengeType2, setChallengeType2, challengeSpec2, setChallengeSpec2, customChallengeText2, setCustomChallengeText2)}

          {/* Anyone specific? — foldable optional section */}
          {resolvedSpec1 && (
            <>
              <div className="h-[1px] bg-white/[0.04] my-6" />
              <button
                type="button"
                onClick={() => setShowDreamConnect(!showDreamConnect)}
                className="flex items-center justify-between w-full text-left group"
              >
                <div>
                  <h4 className="text-sm font-medium text-white/70 group-hover:text-white/80 transition-colors">
                    {lang === "kr" ? "특별히 만나고 싶은 Elev8 멤버가 있나요?" : "Anyone specific Elev8 member you'd like to meet?"}
                  </h4>
                  <p className="text-[10px] text-white/30 mt-0.5">
                    {lang === "kr" ? "선택사항 — 이름, 회사, 만나고 싶은 이유 등" : "Optional — name, company, why you'd like to meet, etc."}
                  </p>
                </div>
                {showDreamConnect ? <ChevronUp className="size-4 text-white/30" /> : <ChevronDown className="size-4 text-white/30" />}
              </button>
              {showDreamConnect && (
                <div className="mt-3">
                  <Textarea
                    value={dreamConnection}
                    onChange={(e) => { setDreamConnection(e.target.value); setDreamRefined(""); setDreamRefinedKr(""); }}
                    placeholder={lang === "kr" ? "예: 100명+ 크로스펑셔널 엔지니어링 팀을 스케일한 경험이 있는 리더" : "e.g. Someone who's scaled cross-functional engineering teams past 100"}
                    className="min-h-14 bg-white/[0.03] border-white/[0.07] text-sm placeholder:text-white/25 leading-relaxed"
                    spellCheck
                    maxLength={280}
                  />
                </div>
              )}
            </>
          )}
        </div>
        <NavButtons
          onNext={() => { setStep("generate"); generateWithAI(); }}
          canNext={!!resolvedSpec1 && !!customChallengeText1.trim()}
          nextLabel={lang === "kr" ? "내 프로필 만들기" : "Build My Profile"}
          onBack={() => setStep("geo")}
        />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // STEP: GENERATE — AI is working
  // ════════════════════════════════════════════════════════
  if (step === "generate") {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 -mt-20">
        <RefreshCw className="size-8 text-amber-400/40 animate-spin" />
        <p className="text-sm text-white/50">
          {lang === "kr" ? "프로필을 만들고 있습니다..." : "Building your profile..."}
        </p>
        <p className="text-[11px] text-white/25">
          {domainName} · {actionNames.join(", ")} · {spScales.map(s => dimLabel(SCALES, s)).join(", ")}
        </p>
        <p className="text-[10px] text-white/20 mt-4">
          {lang === "kr" ? "다음 단계에서 확인하고 수정할 수 있습니다" : "You'll be able to review and edit in the next step"}
        </p>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // STEP: REFINE — Review AI-enhanced descriptions
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
        {/* Clear instruction header */}
        <div className="rounded-xl border border-amber-400/15 bg-amber-400/[0.03] px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white/90">
                {lang === "kr" ? "프로필을 확인하고 수정하세요" : "Review & edit your profile"}
              </h3>
              <p className="text-[12px] text-white/45 mt-1">
                {lang === "kr" ? "아래 내용을 확인하고, 텍스트를 탭하면 수정할 수 있습니다. 완료되면 저장하세요." : "Check the details below. Tap any text to edit. Save when you're happy."}
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
              {/* Editable title */}
              {editingIdx?.type === "sp" && editingIdx.idx === i * 10 ? (
                <Textarea
                  value={editVal}
                  onChange={(e) => setEditVal(e.target.value)}
                  onBlur={() => { updateProfile(i, "title", editVal); setEditingIdx(null); }}
                  className="text-[15px] font-bold bg-transparent border-white/[0.08] text-white/90 min-h-12 resize-none"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => { setEditingIdx({ type: "sp", idx: i * 10 }); setEditVal(profile.title); }}
                  className="text-left w-full group"
                >
                  <h4 className="text-[15px] font-bold text-white/90 group-hover:text-white transition-colors">
                    {profile.title}
                    <Pencil className="size-3 inline ml-2 opacity-0 group-hover:opacity-40" />
                  </h4>
                </button>
              )}

              {/* Editable bullets */}
              <div className="space-y-1.5">
                <p className="text-[9px] text-amber-400/40 font-medium uppercase tracking-wide">
                  {lang === "kr" ? "이런 도움을 드릴 수 있습니다" : "I can help you with"}
                </p>
                {profile.bullets.map((b, j) => (
                  <div key={j} className="flex items-start gap-2">
                    <span className="text-amber-400/30 text-[12px] mt-[1px] shrink-0">→</span>
                    {editingIdx?.type === "sp" && editingIdx.idx === i * 10 + j + 1 ? (
                      <Textarea
                        value={editVal}
                        onChange={(e) => setEditVal(e.target.value)}
                        onBlur={() => { updateBullet(i, j, editVal); setEditingIdx(null); }}
                        className="flex-1 text-[12px] bg-transparent border-white/[0.08] text-white/70 min-h-10 resize-none"
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => { setEditingIdx({ type: "sp", idx: i * 10 + j + 1 }); setEditVal(b); }}
                        className="flex-1 text-left text-[12px] text-white/55 hover:text-white/70 transition-colors group"
                      >
                        {b}<Pencil className="size-2.5 inline ml-1 opacity-0 group-hover:opacity-30" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Editable proof */}
              {editingIdx?.type === "sp" && editingIdx.idx === i * 10 + 9 ? (
                <Textarea
                  value={editVal}
                  onChange={(e) => setEditVal(e.target.value)}
                  onBlur={() => { updateProfile(i, "proof", editVal); setEditingIdx(null); }}
                  className="text-[11px] bg-white/[0.02] border-white/[0.08] text-white/50 min-h-12"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => { setEditingIdx({ type: "sp", idx: i * 10 + 9 }); setEditVal(profile.proof); }}
                  className="w-full text-left px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04] group"
                >
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
          <div className="flex items-center gap-2">
            <p className="text-[10px] tracking-[0.15em] text-amber-400/55 uppercase font-semibold">
              {lang === "kr" ? "함께 풀고 싶은 고민" : "Seeking Perspectives"}
            </p>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
              <Lock className="size-2 text-white/20" />
              <span className="text-[7px] text-white/20 uppercase">{lang === "kr" ? "비공개" : "Private"}</span>
            </span>
          </div>
          <div className="space-y-2">
            {chDetails.map((c, i) => (
              <div key={i}>
                {editingIdx?.type === "ch" && editingIdx.idx === i ? (
                  <div className="space-y-1.5">
                    <Textarea
                      value={editVal}
                      onChange={(e) => setEditVal(e.target.value)}
                      onBlur={() => { const updated = [...chDetails]; updated[i] = editVal; setChDetails(updated); setEditingIdx(null); }}
                      className="text-[13px] bg-white/[0.02] border-white/[0.07] text-white/65 min-h-16"
                      autoFocus
                    />
                  </div>
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
              <p className="text-[13px] text-white/60 leading-relaxed">
                {lang === "kr" ? (dreamRefinedKr || dreamRefined) : dreamRefined}
              </p>
            </div>
          </section>
        )}

        {/* Card Preview */}
        <section className="space-y-3">
          <p className="text-[10px] tracking-[0.15em] text-white/30 uppercase font-medium">
            {lang === "kr" ? "카드 미리보기" : "Card Preview"}
          </p>
          <CardPreview />
        </section>

        {/* Actions */}
        <div className="space-y-3 pb-8">
          <Button onClick={handleSave} disabled={saving}
            className="w-full h-11 bg-white text-black hover:bg-white/90 rounded-xl text-sm font-medium">
            {saving ? (lang === "kr" ? "저장 중..." : "Saving...") : (lang === "kr" ? "저장하고 프로필 보기" : "Save & View My Profile")}
          </Button>
          <Button variant="ghost" onClick={() => setStep("challenges")}
            className="w-full h-9 text-white/30 hover:text-white/50 text-sm">
            <ArrowLeft className="size-4 mr-1" /> {lang === "kr" ? "이전으로 돌아가기" : "Go back"}
          </Button>
          <div className="flex gap-3 justify-center">
            <Button variant="ghost" onClick={() => setStep("domain")}
              className="h-8 text-white/20 hover:text-white/40 text-[11px]">
              {lang === "kr" ? "처음부터 다시" : "Start over"}
            </Button>
            <Button variant="ghost" onClick={generateWithAI} disabled={generating}
              className="h-8 text-white/20 hover:text-white/40 text-[11px]">
              <RefreshCw className={`size-3 mr-1 ${generating ? "animate-spin" : ""}`} />
              {lang === "kr" ? "다시 생성" : "Regenerate"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // STEP: DONE — Card saved
  // ════════════════════════════════════════════════════════
  return (
    <div className="space-y-10">
      <CardPreview interactive />

      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-white/55">
          <Check className="size-4" />
          <span className="text-sm">{lang === "kr" ? "카드 저장 완료" : "Card saved"}</span>
        </div>
        <p className="text-[11px] text-white/30">
          {lang === "kr" ? "키워드를 탭하면 전체 설명을 볼 수 있습니다" : "Tap any keyword to see the full description"}
        </p>
        <Button variant="ghost" onClick={() => setStep("domain")}
          className="h-9 text-white/35 hover:text-white/55 text-[11px]">
          {lang === "kr" ? "카드 수정" : "Edit my card"}
        </Button>
      </div>

      {/* Match Suggestions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-amber-400/45" />
            <h3 className="text-sm font-medium text-white/70">
              {lang === "kr" ? "추천 연결" : "Suggested connections"}
            </h3>
          </div>
          <button
            onClick={loadMatches}
            disabled={loadingMatches}
            className="text-[10px] text-white/35 hover:text-white/55 transition-colors"
          >
            {loadingMatches ? <RefreshCw className="size-3 animate-spin" /> : (lang === "kr" ? "새로고침" : "Refresh")}
          </button>
        </div>

        {matchSuggestions.length > 0 ? (
          <div className="space-y-3">
            {matchSuggestions.map((match) => (
              <div key={match.memberId} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2">
                <div className="flex items-center gap-3">
                  {match.imageUrl ? (
                    <img src={match.imageUrl} alt="" className="size-9 rounded-full object-cover ring-1 ring-white/[0.06]" />
                  ) : (
                    <div className="flex size-9 items-center justify-center rounded-full bg-white/[0.03] text-xs font-medium text-white/40 ring-1 ring-white/[0.06]">
                      {match.firstName[0]}{match.lastName[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-white/80">{match.firstName} {match.lastName}</p>
                    {(match.jobTitle || match.company) && (
                      <p className="text-[11px] text-white/40 truncate">{match.jobTitle}{match.jobTitle && match.company && " · "}{match.company}</p>
                    )}
                  </div>
                </div>
                <p className="text-[12px] text-amber-300/55 leading-relaxed">{match.matchReason}</p>
              </div>
            ))}
          </div>
        ) : (
          <button
            onClick={loadMatches}
            disabled={loadingMatches}
            className="w-full rounded-xl border border-dashed border-white/[0.08] py-6 text-center text-[12px] text-white/35 hover:text-white/50 hover:border-white/[0.15] transition-all"
          >
            {loadingMatches ? (
              <span className="flex items-center justify-center gap-2"><RefreshCw className="size-3 animate-spin" /> {lang === "kr" ? "최적의 매칭을 찾는 중..." : "Finding your best matches..."}</span>
            ) : (
              lang === "kr" ? "연결 추천 보기" : "See who you should connect with"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
