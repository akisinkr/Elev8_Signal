import type {
  SignalQuestion,
  SignalVote,
  SignalAnswer,
  SignalStatus,
  SignalCategory,
} from "@/generated/prisma/client";

export type { SignalQuestion, SignalVote, SignalAnswer, SignalStatus, SignalCategory };

export type SignalQuestionWithVotes = SignalQuestion & {
  votes: SignalVote[];
};

export type SignalResultDistribution = {
  answer: SignalAnswer;
  label: string;
  labelKr: string | null;
  count: number;
  percentage: number;
};

export type SignalResults = {
  question: SignalQuestion;
  totalVotes: number;
  distribution: SignalResultDistribution[];
  topAnswer: SignalAnswer;
  topAnswerLabel: string;
  topAnswerLabelKr: string | null;
  memberAnswer: SignalAnswer | null;
  anonymousQuotes: string[];
};

export type SignalArchiveItem = {
  signalNumber: number;
  question: string;
  category: SignalCategory;
  totalVotes: number;
  topAnswer: string;
  publishedAt: string;
};
