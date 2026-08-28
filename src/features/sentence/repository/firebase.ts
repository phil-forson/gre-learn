import {
  sentenceAudioLessonSchema,
  sentenceProgressSchema,
} from "@/features/sentence/schemas/unit";
import type {
  SentenceAudioLesson,
  SentenceProgress,
} from "@/features/sentence/types";
import { getDb } from "@/lib/db/firebase-admin";
import { AppError } from "@/lib/errors";
import type { SentenceRepository } from "./types";

const COL = {
  sentenceProgress: "sentenceProgress",
  sentenceAudioLessons: "sentenceAudioLessons",
} as const;

function normalizeSentenceProgress(raw: SentenceProgress): SentenceProgress {
  return {
    ...raw,
    knowledgeTestPassed: raw.knowledgeTestPassed ?? false,
  };
}

function assertValidProgress(progress: SentenceProgress): SentenceProgress {
  const parsed = sentenceProgressSchema.safeParse(
    normalizeSentenceProgress(progress),
  );
  if (!parsed.success) {
    throw new AppError(
      "Invalid sentence progress",
      "VALIDATION_ERROR",
      400,
      parsed.error.flatten(),
    );
  }
  return parsed.data;
}

function assertValidLesson(lesson: SentenceAudioLesson): SentenceAudioLesson {
  const parsed = sentenceAudioLessonSchema.safeParse(lesson);
  if (!parsed.success) {
    throw new AppError(
      "Invalid sentence audio lesson",
      "VALIDATION_ERROR",
      400,
      parsed.error.flatten(),
    );
  }
  return parsed.data;
}

export class FirebaseSentenceRepository implements SentenceRepository {
  private db = getDb();

  /** Load progress by document id; reject mismatched userId (IDOR guard). */
  async getProgressById(
    userId: string,
    id: string,
  ): Promise<SentenceProgress | null> {
    const doc = await this.db.collection(COL.sentenceProgress).doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data() as SentenceProgress;
    if (data.userId !== userId) return null;
    return normalizeSentenceProgress(data);
  }

  async getProgress(
    userId: string,
    unitId: string,
  ): Promise<SentenceProgress | null> {
    const snap = await this.db
      .collection(COL.sentenceProgress)
      .where("userId", "==", userId)
      .where("unitId", "==", unitId)
      .limit(1)
      .get();
    if (snap.empty) return null;
    const data = snap.docs[0]!.data() as SentenceProgress;
    if (data.userId !== userId) return null;
    return normalizeSentenceProgress(data);
  }

  async listProgress(userId: string): Promise<SentenceProgress[]> {
    const snap = await this.db
      .collection(COL.sentenceProgress)
      .where("userId", "==", userId)
      .get();
    return snap.docs
      .map((d) => d.data() as SentenceProgress)
      .filter((p) => p.userId === userId)
      .map(normalizeSentenceProgress);
  }

  async upsertProgress(progress: SentenceProgress): Promise<SentenceProgress> {
    const existing = await this.getProgress(progress.userId, progress.unitId);
    const next: SentenceProgress = existing
      ? {
          ...progress,
          id: existing.id,
          userId: existing.userId,
          unitId: existing.unitId,
        }
      : progress;
    const valid = assertValidProgress(next);
    await this.db.collection(COL.sentenceProgress).doc(valid.id).set(valid);
    return valid;
  }

  /** Load lesson by document id; reject mismatched userId (IDOR guard). */
  async getAudioLessonById(
    userId: string,
    id: string,
  ): Promise<SentenceAudioLesson | null> {
    const doc = await this.db
      .collection(COL.sentenceAudioLessons)
      .doc(id)
      .get();
    if (!doc.exists) return null;
    const data = doc.data() as SentenceAudioLesson;
    if (data.userId !== userId) return null;
    return data;
  }

  async getAudioLesson(
    userId: string,
    sentenceUnitId: string,
    contentHash: string,
  ): Promise<SentenceAudioLesson | null> {
    const snap = await this.db
      .collection(COL.sentenceAudioLessons)
      .where("userId", "==", userId)
      .where("sentenceUnitId", "==", sentenceUnitId)
      .where("contentHash", "==", contentHash)
      .limit(5)
      .get();
    const lesson = snap.docs
      .map((d) => d.data() as SentenceAudioLesson)
      .find((l) => l.userId === userId && l.status !== "stale");
    return lesson ?? null;
  }

  async saveAudioLesson(
    lesson: SentenceAudioLesson,
  ): Promise<SentenceAudioLesson> {
    const valid = assertValidLesson(lesson);
    await this.db
      .collection(COL.sentenceAudioLessons)
      .doc(valid.id)
      .set(valid);
    return valid;
  }
}

export function createFirebaseSentenceRepository(): SentenceRepository {
  return new FirebaseSentenceRepository();
}
