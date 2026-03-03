import type { Member, Match, Message, Feedback, SignalQuestion, SignalVote } from "@/generated/prisma/client";

// Re-export Prisma types
export type { Member, Match, Message, Feedback, SignalQuestion, SignalVote };

// Extended types with relations
export type MatchWithMembers = Match & {
  member1: Member;
  member2: Member;
};

export type MatchWithDetails = MatchWithMembers & {
  messages: Message[];
  feedback: Feedback[];
};

export type MessageWithSender = Message & {
  sender: Member;
};
