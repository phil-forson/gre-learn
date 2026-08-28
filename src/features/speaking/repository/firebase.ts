import {
  speakingAudioLessonSchema,
  speakingProgressSchema,
} from "@/features/speaking/schemas/unit";
import type {
  SpeakingAudioLesson,
  SpeakingProgress,
} from "@/features/speaking/types";
import { getDb } from "@/lib/db/firebase-admin";
import { AppError } from "@/lib/errors";
import type { SpeakingRepository } from "./types";

const COL = {
  speakingProgress: "speakingProgress",
  speakingAudioLessons: "speakingAudioLessons",
} as const;

function normalizeSpeakingProgress(raw: SpeakingProgress): SpeakingProgress {
  return {
    ...raw,
    knowledgeTestPassed: raw.knowledgeTestPassed ?? false,
  };
}

function assertValidProgress(progress: SpeakingProgress): SpeakingProgress {
  const parsed = speakingProgressSchema.safeParse(
    normalizeSpeakingProgress(progress),
  );
  if (!parsed.success) {
    throw new AppError(
      "Invalid speaking progress",
      "VALIDATION_ERROR",
      400,
      parsed.error.flatten(),
    );
  }
  return parsed.data;
}

function assertValidLesson(lesson: SpeakingAudioLesson): SpeakingAudioLesson {
  const parsed = speakingAudioLessonSchema.safeParse(lesson);
  if (!parsed.success) {
    throw new AppError(
      "Invalid speaking audio lesson",
      "VALIDATION_ERROR",
      400,
      parsed.error.flatten(),
    );
  }
  return parsed.data;
}

export class FirebaseSpeakingRepository implements SpeakingRepository {
  private db = getDb();

  /** Load progress by document id; reject mismatched userId (IDOR guard). */
  async getProgressById(
    userId: string,
    id: string,
  ): Promise<SpeakingProgress | null> {
    const doc = await this.db.collection(COL.speakingProgress).doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data() as SpeakingProgress;
    if (data.userId !== userId) return null;
    return normalizeSpeakingProgress(data);
  }

  async getProgress(
    userId: string,
    unitId: string,
  ): Promise<SpeakingProgress | null> {
    const snap = await this.db
      .collection(COL.speakingProgress)
      .where("userId", "==", userId)
      .where("unitId", "==", unitId)
      .limit(1)
      .get();
    if (snap.empty) return null;
    const data = snap.docs[0]!.data() as SpeakingProgress;
    if (data.userId !== userId) return null;
    return normalizeSpeakingProgress(data);
  }

  async listProgress(userId: string): Promise<SpeakingProgress[]> {
    const snap = await this.db
      .collection(COL.speakingProgress)
      .where("userId", "==", userId)
      .get();
    return snap.docs
      .map((d) => d.data() as SpeakingProgress)
      .filter((p) => p.userId === userId)
      .map(normalizeSpeakingProgress);
  }

  async upsertProgress(progress: SpeakingProgress): Promise<SpeakingProgress> {
    const existing = await this.getProgress(progress.userId, progress.unitId);
    const next: SpeakingProgress = existing
      ? {
          ...progress,
          id: existing.id,
          userId: existing.userId,
          unitId: existing.unitId,
        }
      : progress;
    const valid = assertValidProgress(next);
    await this.db.collection(COL.speakingProgress).doc(valid.id).set(valid);
    return valid;
  }

  /** Load lesson by document id; reject mismatched userId (IDOR guard). */
  async getAudioLessonById(
    userId: string,
    id: string,
  ): Promise<SpeakingAudioLesson | null> {
    const doc = await this.db
      .collection(COL.speakingAudioLessons)
      .doc(id)
      .get();
    if (!doc.exists) return null;
    const data = doc.data() as SpeakingAudioLesson;
    if (data.userId !== userId) return null;
    return data;
  }

  async getAudioLesson(
    userId: string,
    speakingUnitId: string,
    contentHash: string,
  ): Promise<SpeakingAudioLesson | null> {
    const snap = await this.db
      .collection(COL.speakingAudioLessons)
      .where("userId", "==", userId)
      .where("speakingUnitId", "==", speakingUnitId)
      .where("contentHash", "==", contentHash)
      .limit(5)
      .get();
    const lesson = snap.docs
      .map((d) => d.data() as SpeakingAudioLesson)
      .find((l) => l.userId === userId && l.status !== "stale");
    return lesson ?? null;
  }

  async saveAudioLesson(
    lesson: SpeakingAudioLesson,
  ): Promise<SpeakingAudioLesson> {
    const valid = assertValidLesson(lesson);
    await this.db
      .collection(COL.speakingAudioLessons)
      .doc(valid.id)
      .set(valid);
    return valid;
  }
}

export function createFirebaseSpeakingRepository(): SpeakingRepository {
  return new FirebaseSpeakingRepository();
}
