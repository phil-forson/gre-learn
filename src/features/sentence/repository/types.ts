import type {
  SentenceAudioLesson,
  SentenceProgress,
} from "@/features/sentence/types";

export interface SentenceRepository {
  getProgress(userId: string, unitId: string): Promise<SentenceProgress | null>;
  listProgress(userId: string): Promise<SentenceProgress[]>;
  upsertProgress(progress: SentenceProgress): Promise<SentenceProgress>;
  getAudioLesson(
    userId: string,
    sentenceUnitId: string,
    contentHash: string,
  ): Promise<SentenceAudioLesson | null>;
  saveAudioLesson(lesson: SentenceAudioLesson): Promise<SentenceAudioLesson>;
}
