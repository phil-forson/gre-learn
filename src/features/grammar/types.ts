import { LEARNING_LOCALE, type LessonSegment } from "@/features/learning/types";
import type { CefrLevel } from "@/features/path/types";

export type GrammarCefrBand = CefrLevel;

export type GrammarFormExample = {
  id: string;
  sentence: string;
  note?: string;
};

export type GrammarFormContent = {
  focus: string;
  ruleSummary: string;
  patterns: string[];
  examples: GrammarFormExample[];
  contrastNote?: string;
};

export type GrammarMicroTaskChoice = {
  id: string;
  text: string;
};

export type GrammarMicroTaskItem = {
  id: string;
  kind: "mcq" | "cloze";
  prompt: string;
  choices: GrammarMicroTaskChoice[];
  /** Correct choice id — never sent to the client on GET. */
  correctChoiceId: string;
};

export type GrammarMicroTask = {
  id: string;
  prompt: string;
  items: GrammarMicroTaskItem[];
};

export type GrammarKnowledgeTestChoice = {
  id: string;
  text: string;
};

export type GrammarKnowledgeTestItem = {
  id: string;
  kind: "mcq" | "cloze" | "error_correction";
  prompt: string;
  choices: GrammarKnowledgeTestChoice[];
  /** Correct choice id — never sent to the client on GET. */
  correctChoiceId: string;
};

export type GrammarKnowledgeTest = {
  id: string;
  title: string;
  prompt: string;
  items: GrammarKnowledgeTestItem[];
};

export type GrammarUnit = {
  id: string;
  slug: string;
  title: string;
  cefrBand: GrammarCefrBand;
  locale: typeof LEARNING_LOCALE;
  strandTags: string[];
  contentVersion: number;
  contentHash: string;
  form: GrammarFormContent;
  microTask: GrammarMicroTask;
  /** Optional deeper quiz — does not gate unit completion. */
  knowledgeTest?: GrammarKnowledgeTest;
};

export type PublicGrammarMicroTaskItem = Omit<
  GrammarMicroTaskItem,
  "correctChoiceId"
>;

export type PublicGrammarMicroTask = {
  id: string;
  prompt: string;
  items: PublicGrammarMicroTaskItem[];
};

export type PublicGrammarKnowledgeTestItem = Omit<
  GrammarKnowledgeTestItem,
  "correctChoiceId"
>;

export type PublicGrammarKnowledgeTest = {
  id: string;
  title: string;
  prompt: string;
  items: PublicGrammarKnowledgeTestItem[];
};

export type PublicGrammarUnit = Omit<
  GrammarUnit,
  "microTask" | "knowledgeTest"
> & {
  microTask: PublicGrammarMicroTask;
  knowledgeTest?: PublicGrammarKnowledgeTest;
};

export type GrammarProgressStatus =
  | "not_started"
  | "in_progress"
  | "completed";

export type GrammarProgress = {
  id: string;
  userId: string;
  unitId: string;
  status: GrammarProgressStatus;
  microTaskPassed: boolean;
  /** Sticky; defaults false for rows written before this field existed. */
  knowledgeTestPassed: boolean;
  lastPlayedAt: string | null;
  reviewCount: number;
  contentHash: string;
  dateUpdated: string;
};

export type GrammarSegmentType =
  | "title"
  | "focus"
  | "rule"
  | "pattern"
  | "example"
  | "contrast"
  | "task_lead_in";

/** Grammar lesson segment — satisfies shared LessonSegment for the player. */
export type GrammarLessonSegment = LessonSegment & {
  type: GrammarSegmentType;
};

export type GrammarStoredAudioSegment = {
  id: string;
  audioLessonId: string;
  grammarUnitId: string;
  segmentKey: string;
  segmentType: GrammarSegmentType;
  order: number;
  text: string;
  audioUrlOrStorageKey: string | null;
  durationMs: number | null;
  contentHash: string;
  status: "pending" | "ready" | "failed" | "stale";
  error: string | null;
};

export type GrammarAudioLesson = {
  id: string;
  userId: string;
  grammarUnitId: string;
  contentHash: string;
  voice: string;
  status: "pending" | "ready" | "failed" | "stale";
  createdAt: string;
  segments: GrammarStoredAudioSegment[];
};

export type GrammarMicroTaskAnswer = {
  itemId: string;
  choiceId: string;
};

export type GrammarMicroTaskScore = {
  correctCount: number;
  itemCount: number;
  passed: boolean;
  itemResults: Array<{
    itemId: string;
    correct: boolean;
    correctChoiceId: string;
  }>;
};

export type GrammarKnowledgeTestAnswer = {
  itemId: string;
  choiceId: string;
};

export type GrammarKnowledgeTestScore = {
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
