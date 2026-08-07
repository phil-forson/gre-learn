import type {
  AudioLesson,
  ReviewEvent,
  VocabularyEntry,
} from "@/features/vocabulary/types";
import { getDb } from "@/lib/db/firebase-admin";
import type {
  ListVocabularyParams,
  ListVocabularyResult,
  VocabularyRepository,
} from "./types";

const COL = {
  vocabulary: "vocabulary",
  reviewEvents: "reviewEvents",
  audioLessons: "audioLessons",
} as const;

export class FirebaseVocabularyRepository implements VocabularyRepository {
  private db = getDb();

  async list(params: ListVocabularyParams): Promise<ListVocabularyResult> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    let query = this.db
      .collection(COL.vocabulary)
      .where("userId", "==", params.userId);

    if (params.favoritesOnly) {
      query = query.where("isFavorite", "==", true);
    }
    if (params.status) {
      query = query.where("status", "==", params.status);
    }

    const snap = await query.get();
    let items = snap.docs.map((d) => d.data() as VocabularyEntry);

    if (params.query) {
      const q = params.query.toLowerCase();
      items = items.filter(
        (v) =>
          v.word.toLowerCase().includes(q) ||
          v.normalizedWord.includes(q),
      );
    }

    items = this.sortEntries(items, params.sort);
    const total = items.length;
    const start = (page - 1) * pageSize;
    return {
      items: items.slice(start, start + pageSize),
      total,
      page,
      pageSize,
    };
  }

  private sortEntries(
    items: VocabularyEntry[],
    sort: ListVocabularyParams["sort"],
  ): VocabularyEntry[] {
    const copy = [...items];
    switch (sort) {
      case "oldest":
        return copy.sort(
          (a, b) =>
            new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime(),
        );
      case "alpha":
        return copy.sort((a, b) =>
          a.normalizedWord.localeCompare(b.normalizedWord),
        );
      case "newest":
      default:
        return copy.sort(
          (a, b) =>
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
        );
    }
  }

  async getById(userId: string, id: string): Promise<VocabularyEntry | null> {
    const doc = await this.db.collection(COL.vocabulary).doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data() as VocabularyEntry;
    if (data.userId !== userId) return null;
    return data;
  }

  async getByNormalizedWord(
    userId: string,
    normalizedWord: string,
  ): Promise<VocabularyEntry | null> {
    const snap = await this.db
      .collection(COL.vocabulary)
      .where("userId", "==", userId)
      .where("normalizedWord", "==", normalizedWord)
      .limit(1)
      .get();
    if (snap.empty) return null;
    return snap.docs[0]!.data() as VocabularyEntry;
  }

  async create(entry: VocabularyEntry): Promise<VocabularyEntry> {
    await this.db.collection(COL.vocabulary).doc(entry.id).set(entry);
    return entry;
  }

  async update(
    userId: string,
    id: string,
    patch: Partial<VocabularyEntry>,
  ): Promise<VocabularyEntry> {
    const existing = await this.getById(userId, id);
    if (!existing) throw new Error("Vocabulary entry not found");
    const next = {
      ...existing,
      ...patch,
      id: existing.id,
      userId: existing.userId,
    };
    await this.db.collection(COL.vocabulary).doc(id).set(next);
    return next;
  }

  async delete(userId: string, id: string): Promise<void> {
    const existing = await this.getById(userId, id);
    if (!existing) return;
    await this.db.collection(COL.vocabulary).doc(id).delete();
    const lessons = await this.db
      .collection(COL.audioLessons)
      .where("vocabularyEntryId", "==", id)
      .get();
    const batch = this.db.batch();
    lessons.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }

  async countStats(userId: string) {
    const snap = await this.db
      .collection(COL.vocabulary)
      .where("userId", "==", userId)
      .get();
    const items = snap.docs.map((d) => d.data() as VocabularyEntry);
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const today = new Date().toISOString().slice(0, 10);
    return {
      total: items.length,
      favorites: items.filter((v) => v.isFavorite).length,
      addedThisWeek: items.filter(
        (v) => new Date(v.dateAdded).getTime() >= weekAgo,
      ).length,
      reviewedToday: items.filter(
        (v) => v.lastReviewedAt && v.lastReviewedAt.startsWith(today),
      ).length,
    };
  }

  async listEligibleForReview(userId: string): Promise<VocabularyEntry[]> {
    const snap = await this.db
      .collection(COL.vocabulary)
      .where("userId", "==", userId)
      .get();
    return snap.docs
      .map((d) => d.data() as VocabularyEntry)
      .filter(
        (v) =>
          Boolean(v.content) &&
          ["ready", "audio_ready", "audio_pending", "audio_failed"].includes(
            v.status,
          ),
      );
  }

  async addReviewEvent(event: ReviewEvent): Promise<ReviewEvent> {
    await this.db.collection(COL.reviewEvents).doc(event.id).set(event);
    return event;
  }

  async getAudioLesson(
    vocabularyEntryId: string,
    contentHash: string,
  ): Promise<AudioLesson | null> {
    const snap = await this.db
      .collection(COL.audioLessons)
      .where("vocabularyEntryId", "==", vocabularyEntryId)
      .where("contentHash", "==", contentHash)
      .limit(5)
      .get();
    const lesson = snap.docs
      .map((d) => d.data() as AudioLesson)
      .find((l) => l.status !== "stale");
    return lesson ?? null;
  }

  async saveAudioLesson(lesson: AudioLesson): Promise<AudioLesson> {
    await this.db.collection(COL.audioLessons).doc(lesson.id).set(lesson);
    return lesson;
  }

  async markAudioStale(vocabularyEntryId: string): Promise<void> {
    const snap = await this.db
      .collection(COL.audioLessons)
      .where("vocabularyEntryId", "==", vocabularyEntryId)
      .get();
    const batch = this.db.batch();
    snap.docs.forEach((doc) => {
      const data = doc.data() as AudioLesson;
      batch.set(doc.ref, {
        ...data,
        status: "stale",
        segments: data.segments.map((s) => ({ ...s, status: "stale" })),
      });
    });
    await batch.commit();
  }
}

export function createFirebaseRepository(): VocabularyRepository {
  return new FirebaseVocabularyRepository();
}
