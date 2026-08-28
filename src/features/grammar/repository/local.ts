import { LocalVocabularyRepository } from "@/features/vocabulary/repository/local";
import type {
  GrammarAudioLesson,
  GrammarProgress,
} from "@/features/grammar/types";
import type { GrammarRepository } from "./types";

export type LocalGrammarRepositoryOptions = {
  /** Override store directory. Tests must pass an isolated temp dir. */
  dataDir?: string;
  /** Share an existing local vocab repo (same lock + store.json). */
  vocabRepo?: LocalVocabularyRepository;
};

export class LocalGrammarRepository implements GrammarRepository {
  private readonly vocabRepo: LocalVocabularyRepository;

  constructor(options?: LocalGrammarRepositoryOptions) {
    this.vocabRepo =
      options?.vocabRepo ??
      new LocalVocabularyRepository({ dataDir: options?.dataDir });
  }

  getProgress(userId: string, unitId: string) {
    return this.vocabRepo.getGrammarProgress(userId, unitId);
  }

  listProgress(userId: string) {
    return this.vocabRepo.listGrammarProgress(userId);
  }

  upsertProgress(progress: GrammarProgress) {
    return this.vocabRepo.upsertGrammarProgress(progress);
  }

  getAudioLesson(
    userId: string,
    grammarUnitId: string,
    contentHash: string,
  ) {
    return this.vocabRepo.getGrammarAudioLesson(
      userId,
      grammarUnitId,
      contentHash,
    );
  }

  saveAudioLesson(lesson: GrammarAudioLesson) {
    return this.vocabRepo.saveGrammarAudioLesson(lesson);
  }
}
