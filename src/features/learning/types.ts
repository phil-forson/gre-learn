/**
 * Shared learning-engine contracts (Phase 0).
 * Vocab is Track 0 today; grammar/sentence are placeholders for later tracks.
 * American English (en-US) is the sole variety for Phases 0–5.
 */

/** Sole locale / variety for generation + TTS defaults through Phase 5. */
export const LEARNING_LOCALE = "en-US" as const;

/**
 * Polymorphic lesson content source.
 * Only `"vocabulary"` is produced today; `"grammar"` | `"sentence"` reserve the union.
 */
export type ContentSourceType = "vocabulary" | "grammar" | "sentence";

export type ContentSourceRef = {
  type: ContentSourceType;
  id: string;
};

/**
 * Segment shape any lesson script must emit for the segment player.
 * The player consumes text/order/audio without knowing vocabulary fields.
 */
export type LessonSegment = {
  id: string;
  /** Domain-specific key (e.g. vocab AudioSegmentType, later grammar keys). */
  type: string;
  text: string;
  order: number;
  pauseAfterMs?: number;
  /** Optional when script is built before TTS; player hydrates after generate. */
  audioUrl?: string | null;
};

/**
 * Hydrated segment ready for playback / synced transcript highlight.
 */
export type PlayerSegment = {
  id: string;
  type: string;
  text: string;
  order: number;
  pauseAfterMs?: number;
  audioUrl: string | null;
};

/**
 * Review-queue item that can later accept multi-source lessons.
 * Vocab APIs may still return VocabularyEntry; map via vocabularyEntryToReviewQueueItem.
 */
export type ReviewQueueItem = {
  sourceType: ContentSourceType;
  sourceId: string;
  /** Primary display label (word for vocab; topic/title for other tracks). */
  title: string;
  subtitle?: string | null;
  isFavorite: boolean;
  dateAdded: string;
  lastReviewedAt: string | null;
  reviewCount: number;
  eligible: boolean;
};

export type ReviewMode = "all" | "shuffle" | "recent" | "favorites";
