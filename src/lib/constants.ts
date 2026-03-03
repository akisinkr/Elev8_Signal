export const APP_NAME = "Superpower Exchange";
export const APP_DESCRIPTION = "Trade your superpowers with elite leaders";

export const ONBOARDING_STEPS = [
  "welcome",
  "basic-info",
  "professional",
  "superpowers",
  "challenges",
  "communication",
  "availability",
  "review",
] as const;

export const MATCH_STATUS_LABELS = {
  PROPOSED: "Proposed",
  PRESENTED: "Presented",
  ACCEPTED: "Accepted",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  DECLINED: "Declined",
} as const;

export const MESSAGE_TYPES = {
  TEXT: "Text",
  VOICE_NOTE: "Voice Note",
} as const;
