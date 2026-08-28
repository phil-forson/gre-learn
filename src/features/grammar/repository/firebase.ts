import {
  grammarAudioLessonSchema,
  grammarProgressSchema,
} from "@/features/grammar/schemas/unit";
import type {
  GrammarAudioLesson,
  GrammarProgress,
} from "@/features/grammar/types";
import { getDb } from "@/lib/db/firebase-admin";
import { AppError } from "@/lib/errors";
import type { GrammarRepository } from "./types";

const COL = {
  grammarProgress: "grammarProgress",
  grammarAudioLessons: "grammarAudioLessons",
} as const;

function normalizeGrammarProgress(raw: GrammarProgress): GrammarProgress {
  return {
    ...raw,
    knowledgeTestPassed: raw.knowledgeTestPassed ?? false,
  };
}

function assertValidProgress(progress: GrammarProgress): GrammarProgress {
  const parsed = grammarProgressSchema.safeParse(
    normalizeGrammarProgress(progress),
  );
  if (!parsed.success) {
    throw new AppError(
      "Invalid grammar progress",
      "VALIDATION_ERROR",
      400,
      parsed.error.flatten(),
    );
  }
  return parsed.data;
}

function assertValidLesson(lesson: GrammarAudioLesson): GrammarAudioLesson {
  const parsed = grammarAudioLessonSchema.safeParse(lesson);
  if (!parsed.success) {
    throw new AppError(
      "Invalid grammar audio lesson",
      "VALIDATION_ERROR",
      400,
      parsed.error.flatten(),
    );
  }
  return parsed.data;
}

export class FirebaseGrammarRepository implements GrammarRepository {
  private db = getDb();

  /** Load progress by document id; reject mismatched userId (IDOR guard). */
  async getProgressById(
    userId: string,
    id: string,
  ): Promise<GrammarProgress | null> {
    const doc = await this.db.collection(COL.grammarProgress).doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data() as GrammarProgress;
    if (data.userId !== userId) return null;
    return normalizeGrammarProgress(data);
  }

  async getProgress(
    userId: string,
    unitId: string,
  ): Promise<GrammarProgress | null> {
    const snap = await this.db
      .collection(COL.grammarProgress)
      .where("userId", "==", userId)
      .where("unitId", "==", unitId)
      .limit(1)
      .get();
    if (snap.empty) return null;
    const data = snap.docs[0]!.data() as GrammarProgress;
    if (data.userId !== userId) return null;
    return normalizeGrammarProgress(data);
  }

  async listProgress(userId: string): Promise<GrammarProgress[]> {
    const snap = await this.db
      .collection(COL.grammarProgress)
      .where("userId", "==", userId)
      .get();
    return snap.docs
      .map((d) => d.data() as GrammarProgress)
      .filter((p) => p.userId === userId)
      .map(normalizeGrammarProgress);
  }

  async upsertProgress(progress: GrammarProgress): Promise<GrammarProgress> {
    const existing = await this.getProgress(progress.userId, progress.unitId);
    const next: GrammarProgress = existing
      ? {
          ...progress,
          id: existing.id,
          userId: existing.userId,
          unitId: existing.unitId,
        }
      : progress;
    const valid = assertValidProgress(next);
    await this.db.collection(COL.grammarProgress).doc(valid.id).set(valid);
    return valid;
  }

  /** Load lesson by document id; reject mismatched userId (IDOR guard). */
  async getAudioLessonById(
    userId: string,
    id: string,
  ): Promise<GrammarAudioLesson | null> {
    const doc = await this.db
      .collection(COL.grammarAudioLessons)
      .doc(id)
      .get();
    if (!doc.exists) return null;
    const data = doc.data() as GrammarAudioLesson;
    if (data.userId !== userId) return null;
    return data;
  }

  async getAudioLesson(
    userId: string,
    grammarUnitId: string,
    contentHash: string,
  ): Promise<GrammarAudioLesson | null> {
    const snap = await this.db
      .collection(COL.grammarAudioLessons)
      .where("userId", "==", userId)
      .where("grammarUnitId", "==", grammarUnitId)
      .where("contentHash", "==", contentHash)
      .limit(5)
      .get();
    const lesson = snap.docs
      .map((d) => d.data() as GrammarAudioLesson)
      .find((l) => l.userId === userId && l.status !== "stale");
    return lesson ?? null;
  }

  async saveAudioLesson(
    lesson: GrammarAudioLesson,
  ): Promise<GrammarAudioLesson> {
    const valid = assertValidLesson(lesson);
    await this.db
      .collection(COL.grammarAudioLessons)
      .doc(valid.id)
      .set(valid);
    return valid;
  }
}

export function createFirebaseGrammarRepository(): GrammarRepository {
  return new FirebaseGrammarRepository();
}
