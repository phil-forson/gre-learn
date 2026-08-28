import type {
  SpeakingAudioLesson,
  SpeakingProgress,
} from "@/features/speaking/types";

export interface SpeakingRepository {
  getProgress(userId: string, unitId: string): Promise<SpeakingProgress | null>;
  listProgress(userId: string): Promise<SpeakingProgress[]>;
  upsertProgress(progress: SpeakingProgress): Promise<SpeakingProgress>;
  getAudioLesson(
    userId: string,
    speakingUnitId: string,
    contentHash: string,
  ): Promise<SpeakingAudioLesson | null>;
  saveAudioLesson(lesson: SpeakingAudioLesson): Promise<SpeakingAudioLesson>;
}
