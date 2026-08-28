import { LEARNING_LOCALE } from "@/features/learning/types";

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

export const SKILL_TRACK_IDS = [
  "vocabulary",
  "grammar",
  "sentence",
  "speaking",
] as const;
export type SkillTrackId = (typeof SKILL_TRACK_IDS)[number];

export type PathMode = "standard" | "fast";

export type PlacementStatus = "not_started" | "completed" | "skipped";

export type BandScore = {
  correct: number;
  total: number;
};

export type PlacementResult = {
  recommendedLevel: CefrLevel;
  correctCount: number;
  itemCount: number;
  scoresByBand: Record<CefrLevel, BandScore>;
  method: "rules";
  skippedUnitIds: string[];
  answeredAt: string;
};

export type ContinueHint = {
  trackId: SkillTrackId;
  href: string;
  label: string;
  updatedAt: string;
};

export type LearningProfile = {
  id: string;
  userId: string;
  locale: typeof LEARNING_LOCALE;
  cefrLevel: CefrLevel | null;
  pathMode: PathMode;
  activeTrackId: SkillTrackId;
  placementStatus: PlacementStatus;
  lastPlacementAt: string | null;
  lastPlacement: PlacementResult | null;
  continueHint: ContinueHint | null;
  dateCreated: string;
  dateUpdated: string;
};

export type SkillTrackStatus = "live" | "placeholder";

export type SkillTrack = {
  id: SkillTrackId;
  label: string;
  description: string;
  status: SkillTrackStatus;
  href: string;
  strandTags?: string[];
};

export type ContinueTarget = {
  href: string;
  label: string;
  trackId: SkillTrackId;
  needsPlacement: boolean;
};

export type PlacementChoice = {
  id: string;
  text: string;
};

export type PlacementItem = {
  id: string;
  band: CefrLevel;
  prompt: string;
  kind: "mcq" | "cloze";
  choices: PlacementChoice[];
  /** Correct choice id — never sent to the client on GET. */
  correctChoiceId: string;
};

export type PublicPlacementItem = Omit<PlacementItem, "correctChoiceId">;

export type PlacementAnswer = {
  itemId: string;
  choiceId: string;
};
