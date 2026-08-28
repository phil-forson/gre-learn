import type {
  GrammarAudioLesson,
  GrammarProgress,
} from "@/features/grammar/types";

export interface GrammarRepository {
  getProgress(userId: string, unitId: string): Promise<GrammarProgress | null>;
  listProgress(userId: string): Promise<GrammarProgress[]>;
  upsertProgress(progress: GrammarProgress): Promise<GrammarProgress>;
  getAudioLesson(
    userId: string,
    grammarUnitId: string,
    contentHash: string,
  ): Promise<GrammarAudioLesson | null>;
  saveAudioLesson(lesson: GrammarAudioLesson): Promise<GrammarAudioLesson>;
}
