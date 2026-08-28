import { LocalVocabularyRepository } from "@/features/vocabulary/repository/local";
import type {
  SpeakingAudioLesson,
  SpeakingProgress,
} from "@/features/speaking/types";
import type { SpeakingRepository } from "./types";

export type LocalSpeakingRepositoryOptions = {
  /** Override store directory. Tests must pass an isolated temp dir. */
  dataDir?: string;
  /** Share an existing local vocab repo (same lock + store.json). */
  vocabRepo?: LocalVocabularyRepository;
};

export class LocalSpeakingRepository implements SpeakingRepository {
  private readonly vocabRepo: LocalVocabularyRepository;

  constructor(options?: LocalSpeakingRepositoryOptions) {
    this.vocabRepo =
      options?.vocabRepo ??
      new LocalVocabularyRepository({ dataDir: options?.dataDir });
  }

  getProgress(userId: string, unitId: string) {
    return this.vocabRepo.getSpeakingProgress(userId, unitId);
  }

  listProgress(userId: string) {
    return this.vocabRepo.listSpeakingProgress(userId);
  }

  upsertProgress(progress: SpeakingProgress) {
    return this.vocabRepo.upsertSpeakingProgress(progress);
  }

  getAudioLesson(
    userId: string,
    speakingUnitId: string,
    contentHash: string,
  ) {
    return this.vocabRepo.getSpeakingAudioLesson(
      userId,
      speakingUnitId,
      contentHash,
    );
  }

  saveAudioLesson(lesson: SpeakingAudioLesson) {
    return this.vocabRepo.saveSpeakingAudioLesson(lesson);
  }
}
