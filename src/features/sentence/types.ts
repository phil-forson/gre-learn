import { LEARNING_LOCALE, type LessonSegment } from "@/features/learning/types";
import type { CefrLevel } from "@/features/path/types";

export type SentenceCefrBand = CefrLevel;

export type SentenceFormExample = {
  id: string;
  sentence: string;
  note?: string;
};

export type SentenceFormContent = {
  focus: string;
  ruleSummary: string;
  patterns: string[];
  examples: SentenceFormExample[];
  contrastNote?: string;
};

export type SentenceMicroTaskChoice = {
  id: string;
  text: string;
};

export type SentenceMicroTaskItem = {
  id: string;
  kind: "mcq" | "cloze";
  prompt: string;
  choices: SentenceMicroTaskChoice[];
  /** Correct choice id — never sent to the client on GET. */
  correctChoiceId: string;
};

export type SentenceMicroTask = {
  id: string;
  prompt: string;
  items: SentenceMicroTaskItem[];
};

export type SentenceKnowledgeTestChoice = {
  id: string;
  text: string;
};

export type SentenceKnowledgeTestItem = {
  id: string;
  kind: "mcq" | "cloze" | "error_correction";
  prompt: string;
  choices: SentenceKnowledgeTestChoice[];
  /** Correct choice id — never sent to the client on GET. */
  correctChoiceId: string;
};

export type SentenceKnowledgeTest = {
  id: string;
  title: string;
  prompt: string;
  items: SentenceKnowledgeTestItem[];
};

export type SentenceUnit = {
  id: string;
  slug: string;
  title: string;
  cefrBand: SentenceCefrBand;
  locale: typeof LEARNING_LOCALE;
  strandTags: string[];
  contentVersion: number;
  contentHash: string;
  form: SentenceFormContent;
  microTask: SentenceMicroTask;
  /** Optional deeper quiz — does not gate unit completion. */
  knowledgeTest?: SentenceKnowledgeTest;
};

export type PublicSentenceMicroTaskItem = Omit<
  SentenceMicroTaskItem,
  "correctChoiceId"
>;

export type PublicSentenceMicroTask = {
  id: string;
  prompt: string;
  items: PublicSentenceMicroTaskItem[];
};

export type PublicSentenceKnowledgeTestItem = Omit<
  SentenceKnowledgeTestItem,
  "correctChoiceId"
>;

export type PublicSentenceKnowledgeTest = {
  id: string;
  title: string;
  prompt: string;
  items: PublicSentenceKnowledgeTestItem[];
};

export type PublicSentenceUnit = Omit<
  SentenceUnit,
  "microTask" | "knowledgeTest"
> & {
  microTask: PublicSentenceMicroTask;
  knowledgeTest?: PublicSentenceKnowledgeTest;
};

export type SentenceProgressStatus =
  | "not_started"
  | "in_progress"
  | "completed";

export type SentenceProgress = {
  id: string;
  userId: string;
  unitId: string;
  status: SentenceProgressStatus;
  microTaskPassed: boolean;
  /** Sticky; defaults false for rows written before this field existed. */
  knowledgeTestPassed: boolean;
  lastPlayedAt: string | null;
  reviewCount: number;
  contentHash: string;
  dateUpdated: string;
};

export type SentenceSegmentType =
  | "title"
  | "focus"
  | "rule"
  | "pattern"
  | "example"
  | "contrast"
  | "task_lead_in";

export type SentenceLessonSegment = LessonSegment & {
  type: SentenceSegmentType;
};

export type SentenceStoredAudioSegment = {
  id: string;
  audioLessonId: string;
  sentenceUnitId: string;
  segmentKey: string;
  segmentType: SentenceSegmentType;
  order: number;
  text: string;
  audioUrlOrStorageKey: string | null;
  durationMs: number | null;
  contentHash: string;
  status: "pending" | "ready" | "failed" | "stale";
  error: string | null;
};

export type SentenceAudioLesson = {
  id: string;
  userId: string;
  sentenceUnitId: string;
  contentHash: string;
  voice: string;
  status: "pending" | "ready" | "failed" | "stale";
  createdAt: string;
  segments: SentenceStoredAudioSegment[];
};

export type SentenceMicroTaskAnswer = {
  itemId: string;
  choiceId: string;
};

export type SentenceMicroTaskScore = {
  correctCount: number;
  itemCount: number;
  passed: boolean;
  itemResults: Array<{
    itemId: string;
    correct: boolean;
    correctChoiceId: string;
  }>;
};

export type SentenceKnowledgeTestAnswer = {
  itemId: string;
  choiceId: string;
};

export type SentenceKnowledgeTestScore = {
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
