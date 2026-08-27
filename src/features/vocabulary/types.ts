import type { LessonSegment } from "@/features/learning/types";

export type {
  ContentSourceRef,
  ContentSourceType,
  LessonSegment,
  PlayerSegment,
  ReviewQueueItem,
} from "@/features/learning/types";
export { LEARNING_LOCALE } from "@/features/learning/types";

export type VocabularyStatus =
  | "pending"
  | "generating"
  | "ready"
  | "generation_failed"
  | "audio_pending"
  | "audio_ready"
  | "audio_failed";

export type Definition = {
  text: string;
  sense?: string;
  isPrimary: boolean;
};

export type EtymologyComponent = {
  text: string;
  type: "prefix" | "root" | "stem" | "suffix" | "other";
  origin?: string | null;
  meaning: string;
  explanation: string;
  relatedWords: string[];
  confidence: "high" | "medium" | "low";
};

export type VocabularyLearningContent = {
  word: string;
  normalizedWord: string;
  partOfSpeech: string[];
  pronunciation: {
    ipa?: string | null;
    simple?: string | null;
    confidence?: "high" | "medium" | "low";
  };
  definitions: Definition[];
  etymology: {
    summary: string;
    isUsefulForRootLearning: boolean;
    uncertaintyNote?: string | null;
    components: EtymologyComponent[];
  };
  memoryHook: {
    text: string;
    type: "visual" | "sound" | "story" | "wordplay" | "other";
  };
  synonyms: Array<{ word: string; note?: string | null }>;
  antonyms: string[];
  exampleSentences: Array<{ text: string; targetSense?: string | null }>;
  wordFamily: string[];
  usageNotes?: string | null;
  confusedWith: Array<{ word: string; distinction?: string | null }>;
};

export type WordGroup = {
  id: string;
  userId: string;
  name: string;
  sortOrder: string;
  dateCreated: string;
  dateUpdated: string;
};

export type VocabularyEntry = {
  id: string;
  userId: string;
  word: string;
  normalizedWord: string;
  partOfSpeech: string[];
  groupId: string | null;
  status: VocabularyStatus;
  isFavorite: boolean;
  dateAdded: string;
  dateUpdated: string;
  lastReviewedAt: string | null;
  reviewCount: number;
  contentVersion: number;
  contentHash: string | null;
  generationProvider: string | null;
  generationModel: string | null;
  generationError: string | null;
  audioStatus: "none" | "pending" | "ready" | "failed" | "stale";
  audioError: string | null;
  personalNote: string | null;
  content: VocabularyLearningContent | null;
  isDemo?: boolean;
};

export type AudioSegmentType =
  | "word"
  | "spelling"
  | "pronunciation"
  | "definition"
  | "etymology"
  | "memory_hook"
  | "synonyms"
  | "example";

/** Vocab lesson segment — satisfies shared LessonSegment for the player. */
export type AudioLessonSegment = LessonSegment & {
  type: AudioSegmentType;
};

export type StoredAudioSegment = {
  id: string;
  audioLessonId: string;
  vocabularyEntryId: string;
  segmentKey: string;
  segmentType: AudioSegmentType;
  order: number;
  text: string;
  audioUrlOrStorageKey: string | null;
  durationMs: number | null;
  contentHash: string;
  status: "pending" | "ready" | "failed" | "stale";
  error: string | null;
};

export type AudioLesson = {
  id: string;
  vocabularyEntryId: string;
  contentHash: string;
  voice: string;
  status: "pending" | "ready" | "failed" | "stale";
  createdAt: string;
  segments: StoredAudioSegment[];
};

export type ReviewAction = "played" | "completed" | "know_it" | "review_more";

export type ReviewEvent = {
  id: string;
  userId: string;
  vocabularyEntryId: string;
  playedAt: string;
  action: ReviewAction;
};

export type { ReviewMode } from "@/features/learning/types";
