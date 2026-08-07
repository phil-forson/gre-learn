import { promises as fs } from "fs";
import path from "path";
import type {
  AudioLesson,
  ReviewEvent,
  VocabularyEntry,
} from "@/features/vocabulary/types";
import type {
  ListVocabularyParams,
  ListVocabularyResult,
  VocabularyRepository,
} from "./types";

type StoreShape = {
  vocabulary: VocabularyEntry[];
  reviewEvents: ReviewEvent[];
  audioLessons: AudioLesson[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

const emptyStore = (): StoreShape => ({
  vocabulary: [],
  reviewEvents: [],
  audioLessons: [],
});

async function readStore(): Promise<StoreShape> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as StoreShape;
  } catch {
    return emptyStore();
  }
}

async function writeStore(store: StoreShape): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
}

function sortEntries(
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

export class LocalVocabularyRepository implements VocabularyRepository {
  async list(params: ListVocabularyParams): Promise<ListVocabularyResult> {
    const store = await readStore();
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    let items = store.vocabulary.filter((v) => v.userId === params.userId);

    if (params.query) {
      const q = params.query.toLowerCase();
      items = items.filter(
        (v) =>
          v.word.toLowerCase().includes(q) ||
          v.normalizedWord.includes(q) ||
          v.content?.definitions.some((d) =>
            d.text.toLowerCase().includes(q),
          ),
      );
    }

    if (params.favoritesOnly) {
      items = items.filter((v) => v.isFavorite);
    }

    if (params.status) {
      items = items.filter((v) => v.status === params.status);
    }

    items = sortEntries(items, params.sort);
    const total = items.length;
    const start = (page - 1) * pageSize;
    return {
      items: items.slice(start, start + pageSize),
      total,
      page,
      pageSize,
    };
  }

  async getById(userId: string, id: string): Promise<VocabularyEntry | null> {
    const store = await readStore();
    return (
      store.vocabulary.find((v) => v.userId === userId && v.id === id) ?? null
    );
  }

  async getByNormalizedWord(
    userId: string,
    normalizedWord: string,
  ): Promise<VocabularyEntry | null> {
    const store = await readStore();
    return (
      store.vocabulary.find(
        (v) => v.userId === userId && v.normalizedWord === normalizedWord,
      ) ?? null
    );
  }

  async create(entry: VocabularyEntry): Promise<VocabularyEntry> {
    const store = await readStore();
    store.vocabulary.push(entry);
    await writeStore(store);
    return entry;
  }

  async update(
    userId: string,
    id: string,
    patch: Partial<VocabularyEntry>,
  ): Promise<VocabularyEntry> {
    const store = await readStore();
    const index = store.vocabulary.findIndex(
      (v) => v.userId === userId && v.id === id,
    );
    if (index === -1) throw new Error("Vocabulary entry not found");
    store.vocabulary[index] = {
      ...store.vocabulary[index],
      ...patch,
      id: store.vocabulary[index].id,
      userId: store.vocabulary[index].userId,
    };
    await writeStore(store);
    return store.vocabulary[index];
  }

  async delete(userId: string, id: string): Promise<void> {
    const store = await readStore();
    store.vocabulary = store.vocabulary.filter(
      (v) => !(v.userId === userId && v.id === id),
    );
    store.audioLessons = store.audioLessons.filter(
      (l) => l.vocabularyEntryId !== id,
    );
    await writeStore(store);
  }

  async countStats(userId: string) {
    const store = await readStore();
    const items = store.vocabulary.filter((v) => v.userId === userId);
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
    const store = await readStore();
    return store.vocabulary.filter(
      (v) =>
        v.userId === userId &&
        Boolean(v.content) &&
        ["ready", "audio_ready", "audio_pending", "audio_failed"].includes(
          v.status,
        ),
    );
  }

  async addReviewEvent(event: ReviewEvent): Promise<ReviewEvent> {
    const store = await readStore();
    store.reviewEvents.push(event);
    await writeStore(store);
    return event;
  }

  async getAudioLesson(
    vocabularyEntryId: string,
    contentHash: string,
  ): Promise<AudioLesson | null> {
    const store = await readStore();
    return (
      store.audioLessons.find(
        (l) =>
          l.vocabularyEntryId === vocabularyEntryId &&
          l.contentHash === contentHash &&
          l.status !== "stale",
      ) ?? null
    );
  }

  async saveAudioLesson(lesson: AudioLesson): Promise<AudioLesson> {
    const store = await readStore();
    const index = store.audioLessons.findIndex((l) => l.id === lesson.id);
    if (index >= 0) store.audioLessons[index] = lesson;
    else store.audioLessons.push(lesson);
    await writeStore(store);
    return lesson;
  }

  async markAudioStale(vocabularyEntryId: string): Promise<void> {
    const store = await readStore();
    store.audioLessons = store.audioLessons.map((lesson) =>
      lesson.vocabularyEntryId === vocabularyEntryId
        ? {
            ...lesson,
            status: "stale",
            segments: lesson.segments.map((s) => ({ ...s, status: "stale" })),
          }
        : lesson,
    );
    await writeStore(store);
  }
}

export function createLocalRepository(): VocabularyRepository {
  return new LocalVocabularyRepository();
}
