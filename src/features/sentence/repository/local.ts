import { LocalVocabularyRepository } from "@/features/vocabulary/repository/local";
import type {
  SentenceAudioLesson,
  SentenceProgress,
} from "@/features/sentence/types";
import type { SentenceRepository } from "./types";

export type LocalSentenceRepositoryOptions = {
  /** Override store directory. Tests must pass an isolated temp dir. */
  dataDir?: string;
  /** Share an existing local vocab repo (same lock + store.json). */
  vocabRepo?: LocalVocabularyRepository;
};

export class LocalSentenceRepository implements SentenceRepository {
  private readonly vocabRepo: LocalVocabularyRepository;

  constructor(options?: LocalSentenceRepositoryOptions) {
    this.vocabRepo =
      options?.vocabRepo ??
      new LocalVocabularyRepository({ dataDir: options?.dataDir });
  }

  getProgress(userId: string, unitId: string) {
    return this.vocabRepo.getSentenceProgress(userId, unitId);
  }

  listProgress(userId: string) {
    return this.vocabRepo.listSentenceProgress(userId);
  }

  upsertProgress(progress: SentenceProgress) {
    return this.vocabRepo.upsertSentenceProgress(progress);
  }

  getAudioLesson(
    userId: string,
    sentenceUnitId: string,
    contentHash: string,
  ) {
    return this.vocabRepo.getSentenceAudioLesson(
      userId,
      sentenceUnitId,
      contentHash,
    );
  }

  saveAudioLesson(lesson: SentenceAudioLesson) {
    return this.vocabRepo.saveSentenceAudioLesson(lesson);
  }
}
