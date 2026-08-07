import type {
  AudioLesson,
  ReviewEvent,
  VocabularyEntry,
} from "@/features/vocabulary/types";

export type ListVocabularyParams = {
  userId: string;
  query?: string;
  status?: string;
  favoritesOnly?: boolean;
  sort?: "alpha" | "newest" | "oldest";
  page?: number;
  pageSize?: number;
};

export type ListVocabularyResult = {
  items: VocabularyEntry[];
  total: number;
  page: number;
  pageSize: number;
};

export interface VocabularyRepository {
  list(params: ListVocabularyParams): Promise<ListVocabularyResult>;
  getById(userId: string, id: string): Promise<VocabularyEntry | null>;
  getByNormalizedWord(
    userId: string,
    normalizedWord: string,
  ): Promise<VocabularyEntry | null>;
  create(entry: VocabularyEntry): Promise<VocabularyEntry>;
  update(
    userId: string,
    id: string,
    patch: Partial<VocabularyEntry>,
  ): Promise<VocabularyEntry>;
  delete(userId: string, id: string): Promise<void>;
  countStats(userId: string): Promise<{
    total: number;
    favorites: number;
    addedThisWeek: number;
    reviewedToday: number;
  }>;
  listEligibleForReview(userId: string): Promise<VocabularyEntry[]>;
  addReviewEvent(event: ReviewEvent): Promise<ReviewEvent>;
  getAudioLesson(
    vocabularyEntryId: string,
    contentHash: string,
  ): Promise<AudioLesson | null>;
  saveAudioLesson(lesson: AudioLesson): Promise<AudioLesson>;
  markAudioStale(vocabularyEntryId: string): Promise<void>;
}
