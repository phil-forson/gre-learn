import { LEARNING_LOCALE, type LessonSegment } from "@/features/learning/types";
import type { CefrLevel } from "@/features/path/types";

export type SpeakingCefrBand = CefrLevel;

export type SpeakingFormExample = {
  id: string;
  sentence: string;
  note?: string;
};

export type SpeakingFormContent = {
  focus: string;
  ruleSummary: string;
  patterns: string[];
  examples: SpeakingFormExample[];
  contrastNote?: string;
};

export type SpeakingMicroTaskChoice = {
  id: string;
  text: string;
};

export type SpeakingMicroTaskItem = {
  id: string;
  kind: "mcq" | "cloze";
  prompt: string;
  choices: SpeakingMicroTaskChoice[];
  /** Correct choice id — never sent to the client on GET. */
  correctChoiceId: string;
};

export type SpeakingMicroTask = {
  id: string;
  prompt: string;
  items: SpeakingMicroTaskItem[];
};

export type SpeakingKnowledgeTestChoice = {
  id: string;
  text: string;
};

export type SpeakingKnowledgeTestItem = {
  id: string;
  kind: "mcq" | "cloze" | "error_correction";
  prompt: string;
  choices: SpeakingKnowledgeTestChoice[];
  /** Correct choice id — never sent to the client on GET. */
  correctChoiceId: string;
};

export type SpeakingKnowledgeTest = {
  id: string;
  title: string;
  prompt: string;
  items: SpeakingKnowledgeTestItem[];
};

export type SpeakingUnit = {
  id: string;
  slug: string;
  title: string;
  cefrBand: SpeakingCefrBand;
  locale: typeof LEARNING_LOCALE;
  strandTags: string[];
  contentVersion: number;
  contentHash: string;
  form: SpeakingFormContent;
  microTask: SpeakingMicroTask;
  /** Optional deeper quiz — does not gate unit completion. */
  knowledgeTest?: SpeakingKnowledgeTest;
};

export type PublicSpeakingMicroTaskItem = Omit<
  SpeakingMicroTaskItem,
  "correctChoiceId"
>;

export type PublicSpeakingMicroTask = {
  id: string;
  prompt: string;
  items: PublicSpeakingMicroTaskItem[];
};

export type PublicSpeakingKnowledgeTestItem = Omit<
  SpeakingKnowledgeTestItem,
  "correctChoiceId"
>;

export type PublicSpeakingKnowledgeTest = {
  id: string;
  title: string;
  prompt: string;
  items: PublicSpeakingKnowledgeTestItem[];
};

export type PublicSpeakingUnit = Omit<
  SpeakingUnit,
  "microTask" | "knowledgeTest"
> & {
  microTask: PublicSpeakingMicroTask;
  knowledgeTest?: PublicSpeakingKnowledgeTest;
};

export type SpeakingProgressStatus =
  | "not_started"
  | "in_progress"
  | "completed";

export type SpeakingProgress = {
  id: string;
  userId: string;
  unitId: string;
  status: SpeakingProgressStatus;
  microTaskPassed: boolean;
  /** Sticky; defaults false for rows written before this field existed. */
  knowledgeTestPassed: boolean;
  lastPlayedAt: string | null;
  reviewCount: number;
  contentHash: string;
  dateUpdated: string;
};

export type SpeakingSegmentType =
  | "title"
  | "focus"
  | "rule"
  | "pattern"
  | "example"
  | "contrast"
  | "task_lead_in";

export type SpeakingLessonSegment = LessonSegment & {
  type: SpeakingSegmentType;
};

export type SpeakingStoredAudioSegment = {
  id: string;
  audioLessonId: string;
  speakingUnitId: string;
  segmentKey: string;
  segmentType: SpeakingSegmentType;
  order: number;
  text: string;
  audioUrlOrStorageKey: string | null;
  durationMs: number | null;
  contentHash: string;
  status: "pending" | "ready" | "failed" | "stale";
  error: string | null;
};

export type SpeakingAudioLesson = {
  id: string;
  userId: string;
  speakingUnitId: string;
  contentHash: string;
  voice: string;
  status: "pending" | "ready" | "failed" | "stale";
  createdAt: string;
  segments: SpeakingStoredAudioSegment[];
};

export type SpeakingMicroTaskAnswer = {
  itemId: string;
  choiceId: string;
};

export type SpeakingMicroTaskScore = {
  correctCount: number;
  itemCount: number;
  passed: boolean;
  itemResults: Array<{
    itemId: string;
    correct: boolean;
    correctChoiceId: string;
  }>;
};

export type SpeakingKnowledgeTestAnswer = {
  itemId: string;
  choiceId: string;
};

export type SpeakingKnowledgeTestScore = {
  correctCount: number;
  itemCount: number;
  passThreshold: number;
  passed: boolean;
  itemResults: Array<{
    itemId: string;
    correct: boolean;
    correctChoiceId: string;
  }>;
};
