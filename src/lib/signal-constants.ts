import type { SignalStatus, SignalCategory } from "@/generated/prisma/client";

export const SIGNAL_STATUS_LABELS: Record<SignalStatus, string> = {
  DRAFT: "Draft",
  LIVE: "Live",
  CLOSED: "Closed",
  PUBLISHED: "Published",
};

export const SIGNAL_CATEGORY_LABELS: Record<SignalCategory, string> = {
  AI_STRATEGY: "AI & Strategy",
  KOREA_TACTICAL: "Korea Tactical",
  LEADERSHIP: "Leadership",
  WILDCARD: "Wildcard",
  SYNTHESIS: "Synthesis",
};

export const SIGNAL_ANSWER_KEYS = ["A", "B", "C", "D", "E"] as const;

export const MAX_WHY_LENGTH = 280;
