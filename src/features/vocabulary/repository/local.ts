import { promises as fs } from "fs";
import path from "path";
import type {
  GrammarAudioLesson,
  GrammarProgress,
} from "@/features/grammar/types";
import type {
  SentenceAudioLesson,
  SentenceProgress,
} from "@/features/sentence/types";
import type {
  SpeakingAudioLesson,
  SpeakingProgress,
} from "@/features/speaking/types";
import type {
  NotificationPreferences,
  PushDeviceToken,
} from "@/features/notifications/types";
import type {
  PianoProfile,
  PianoSkillProgress,
  PracticeSession,
  YoutubeNote,
} from "@/features/piano/types";
import type { LearningProfile } from "@/features/path/types";
import type {
  AudioLesson,
  ReviewEvent,
  VocabularyEntry,
  WordGroup,
} from "@/features/vocabulary/types";
import {
  sortOrdersForReorder,
  sortWordGroups,
} from "@/features/vocabulary/services/sort-order";
import type {
  ListVocabularyParams,
  ListVocabularyResult,
  VocabularyRepository,
} from "./types";

type StoreShape = {
  vocabulary: VocabularyEntry[];
  reviewEvents: ReviewEvent[];
  audioLessons: AudioLesson[];
  wordGroups: WordGroup[];
  learningProfiles: LearningProfile[];
  grammarProgress: GrammarProgress[];
  grammarAudioLessons: GrammarAudioLesson[];
  sentenceProgress: SentenceProgress[];
  sentenceAudioLessons: SentenceAudioLesson[];
  speakingProgress: SpeakingProgress[];
  speakingAudioLessons: SpeakingAudioLesson[];
  notificationPreferences: NotificationPreferences[];
  pushDeviceTokens: PushDeviceToken[];
  pianoProfiles: PianoProfile[];
  pianoSessions: PracticeSession[];
  pianoSkillProgress: PianoSkillProgress[];
  youtubeNotes: YoutubeNote[];
};

export type LocalVocabularyRepositoryOptions = {
  /** Override store directory. Production default: `<cwd>/data`. Tests must pass an isolated temp dir. */
  dataDir?: string;
};

const DEFAULT_DATA_DIR = path.join(process.cwd(), "data");
const LOCK_STALE_MS = 30_000;
const LOCK_TIMEOUT_MS = 15_000;
const READ_RETRY_ATTEMPTS = 5;

const emptyStore = (): StoreShape => ({
  vocabulary: [],
  reviewEvents: [],
  audioLessons: [],
  wordGroups: [],
  learningProfiles: [],
  grammarProgress: [],
  grammarAudioLessons: [],
  sentenceProgress: [],
  sentenceAudioLessons: [],
  speakingProgress: [],
  speakingAudioLessons: [],
  notificationPreferences: [],
  pushDeviceTokens: [],
  pianoProfiles: [],
  pianoSessions: [],
  pianoSkillProgress: [],
  youtubeNotes: [],
});

function normalizeEntry(raw: VocabularyEntry): VocabularyEntry {
  return { ...raw, groupId: raw.groupId ?? null };
}

function normalizeGrammarProgress(raw: GrammarProgress): GrammarProgress {
  return {
    ...raw,
    knowledgeTestPassed: raw.knowledgeTestPassed ?? false,
  };
}

function normalizeSentenceProgress(raw: SentenceProgress): SentenceProgress {
  return {
    ...raw,
    knowledgeTestPassed: raw.knowledgeTestPassed ?? false,
  };
}

function normalizeSpeakingProgress(raw: SpeakingProgress): SpeakingProgress {
  return {
    ...raw,
    knowledgeTestPassed: raw.knowledgeTestPassed ?? false,
  };
}

function normalizePianoSkillProgress(
  raw: PianoSkillProgress,
): PianoSkillProgress {
  return {
    ...raw,
    keysCompleted: Array.isArray(raw.keysCompleted) ? raw.keysCompleted : [],
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isErrno(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === code
  );
}

function parseStore(raw: string): StoreShape {
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("store.json is not a JSON object");
  }
  const record = parsed as Record<string, unknown>;
  if (
    !Array.isArray(record.vocabulary) ||
    !Array.isArray(record.reviewEvents) ||
    !Array.isArray(record.audioLessons)
  ) {
    throw new Error("store.json has an invalid shape");
  }
  return {
    vocabulary: (record.vocabulary as VocabularyEntry[]).map(normalizeEntry),
    reviewEvents: record.reviewEvents as ReviewEvent[],
    audioLessons: record.audioLessons as AudioLesson[],
    wordGroups: Array.isArray(record.wordGroups)
      ? (record.wordGroups as WordGroup[])
      : [],
    learningProfiles: Array.isArray(record.learningProfiles)
      ? (record.learningProfiles as LearningProfile[])
      : [],
    grammarProgress: Array.isArray(record.grammarProgress)
      ? (record.grammarProgress as GrammarProgress[]).map(
          normalizeGrammarProgress,
        )
      : [],
    grammarAudioLessons: Array.isArray(record.grammarAudioLessons)
      ? (record.grammarAudioLessons as GrammarAudioLesson[])
      : [],
    sentenceProgress: Array.isArray(record.sentenceProgress)
      ? (record.sentenceProgress as SentenceProgress[]).map(
          normalizeSentenceProgress,
        )
      : [],
    sentenceAudioLessons: Array.isArray(record.sentenceAudioLessons)
      ? (record.sentenceAudioLessons as SentenceAudioLesson[])
      : [],
    speakingProgress: Array.isArray(record.speakingProgress)
      ? (record.speakingProgress as SpeakingProgress[]).map(
          normalizeSpeakingProgress,
        )
      : [],
    speakingAudioLessons: Array.isArray(record.speakingAudioLessons)
      ? (record.speakingAudioLessons as SpeakingAudioLesson[])
      : [],
    notificationPreferences: Array.isArray(record.notificationPreferences)
      ? (record.notificationPreferences as NotificationPreferences[])
      : [],
    pushDeviceTokens: Array.isArray(record.pushDeviceTokens)
      ? (record.pushDeviceTokens as PushDeviceToken[])
      : [],
    pianoProfiles: Array.isArray(record.pianoProfiles)
      ? (record.pianoProfiles as PianoProfile[])
      : [],
    pianoSessions: Array.isArray(record.pianoSessions)
      ? (record.pianoSessions as PracticeSession[])
      : [],
    pianoSkillProgress: Array.isArray(record.pianoSkillProgress)
      ? (record.pianoSkillProgress as PianoSkillProgress[]).map(
          normalizePianoSkillProgress,
        )
      : [],
    youtubeNotes: Array.isArray(record.youtubeNotes)
      ? (record.youtubeNotes as YoutubeNote[])
      : [],
  };
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
  private readonly dataDir: string;
  private readonly dataFile: string;
  private readonly lockFile: string;
  private mutationChain: Promise<unknown> = Promise.resolve();

  constructor(options?: LocalVocabularyRepositoryOptions) {
    this.dataDir = options?.dataDir ?? DEFAULT_DATA_DIR;
    this.dataFile = path.join(this.dataDir, "store.json");
    this.lockFile = path.join(this.dataDir, "store.json.lock");
  }

  /**
   * Read store. Missing file → empty. Corrupt/truncated → retry, then throw.
   * Never silently treat a corrupt file as empty (that caused data wipes).
   */
  private async readStore(): Promise<StoreShape> {
    for (let attempt = 0; attempt < READ_RETRY_ATTEMPTS; attempt++) {
      try {
        const raw = await fs.readFile(this.dataFile, "utf8");
        if (raw.trim() === "") {
          if (attempt < READ_RETRY_ATTEMPTS - 1) {
            await sleep(15 * (attempt + 1));
            continue;
          }
          throw new Error("store.json is empty");
        }
        return parseStore(raw);
      } catch (error) {
        if (isErrno(error, "ENOENT")) {
          return emptyStore();
        }
        const retryable =
          error instanceof SyntaxError ||
          (error instanceof Error && error.message === "store.json is empty");
        if (retryable && attempt < READ_RETRY_ATTEMPTS - 1) {
          await sleep(15 * (attempt + 1));
          continue;
        }
        throw error;
      }
    }
    throw new Error("Failed to read store.json after retries");
  }

  /** Write via temp file + rename so readers never see a truncated store.json. */
  private async writeStore(store: StoreShape): Promise<void> {
    await fs.mkdir(this.dataDir, { recursive: true });
    const payload = JSON.stringify(store, null, 2);
    const tmp = path.join(
      this.dataDir,
      `store.json.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`,
    );
    try {
      await fs.writeFile(tmp, payload, "utf8");
      try {
        await fs.rename(tmp, this.dataFile);
      } catch (error) {
        // Windows cannot rename over an existing file.
        if (process.platform === "win32" || isErrno(error, "EEXIST")) {
          await fs.copyFile(tmp, this.dataFile);
          await fs.unlink(tmp);
        } else {
          throw error;
        }
      }
    } catch (error) {
      await fs.unlink(tmp).catch(() => undefined);
      throw error;
    }
  }

  private async releaseLock(handle: fs.FileHandle): Promise<void> {
    await handle.close().catch(() => undefined);
    await fs.unlink(this.lockFile).catch(() => undefined);
  }

  private async tryBreakStaleLock(): Promise<void> {
    try {
      const stat = await fs.stat(this.lockFile);
      if (Date.now() - stat.mtimeMs > LOCK_STALE_MS) {
        await fs.unlink(this.lockFile).catch(() => undefined);
      }
    } catch {
      // lock already gone
    }
  }

  private async acquireFileLock(): Promise<fs.FileHandle> {
    await fs.mkdir(this.dataDir, { recursive: true });
    const started = Date.now();
    while (Date.now() - started < LOCK_TIMEOUT_MS) {
      try {
        return await fs.open(this.lockFile, "wx");
      } catch (error) {
        if (!isErrno(error, "EEXIST")) throw error;
        await this.tryBreakStaleLock();
        await sleep(15 + Math.floor(Math.random() * 25));
      }
    }
    throw new Error("Timed out waiting for store.json lock");
  }

  private withStoreLock<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.mutationChain.then(fn, fn);
    this.mutationChain = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  private async mutateStore<T>(
    fn: (store: StoreShape) => T | Promise<T>,
  ): Promise<T> {
    return this.withStoreLock(async () => {
      const handle = await this.acquireFileLock();
      try {
        const store = await this.readStore();
        const result = await fn(store);
        await this.writeStore(store);
        return result;
      } finally {
        await this.releaseLock(handle);
      }
    });
  }

  async list(params: ListVocabularyParams): Promise<ListVocabularyResult> {
    const store = await this.readStore();
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

    if (params.groupId === "ungrouped") {
      items = items.filter((v) => v.groupId === null);
    } else if (params.groupId) {
      items = items.filter((v) => v.groupId === params.groupId);
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
    const store = await this.readStore();
    return (
      store.vocabulary.find((v) => v.userId === userId && v.id === id) ?? null
    );
  }

  async getByNormalizedWord(
    userId: string,
    normalizedWord: string,
  ): Promise<VocabularyEntry | null> {
    const store = await this.readStore();
    return (
      store.vocabulary.find(
        (v) => v.userId === userId && v.normalizedWord === normalizedWord,
      ) ?? null
    );
  }

  async create(entry: VocabularyEntry): Promise<VocabularyEntry> {
    return this.mutateStore((store) => {
      store.vocabulary.push(entry);
      return entry;
    });
  }

  async update(
    userId: string,
    id: string,
    patch: Partial<VocabularyEntry>,
  ): Promise<VocabularyEntry> {
    return this.mutateStore((store) => {
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
      return store.vocabulary[index];
    });
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.mutateStore((store) => {
      store.vocabulary = store.vocabulary.filter(
        (v) => !(v.userId === userId && v.id === id),
      );
      store.audioLessons = store.audioLessons.filter(
        (l) => l.vocabularyEntryId !== id,
      );
    });
  }

  async countStats(userId: string) {
    const store = await this.readStore();
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
    const store = await this.readStore();
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
    return this.mutateStore((store) => {
      store.reviewEvents.push(event);
      return event;
    });
  }

  async getAudioLesson(
    vocabularyEntryId: string,
    contentHash: string,
  ): Promise<AudioLesson | null> {
    const store = await this.readStore();
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
    return this.mutateStore((store) => {
      const index = store.audioLessons.findIndex((l) => l.id === lesson.id);
      if (index >= 0) store.audioLessons[index] = lesson;
      else store.audioLessons.push(lesson);
      return lesson;
    });
  }

  async markAudioStale(vocabularyEntryId: string): Promise<void> {
    await this.mutateStore((store) => {
      store.audioLessons = store.audioLessons.map((lesson) =>
        lesson.vocabularyEntryId === vocabularyEntryId
          ? {
              ...lesson,
              status: "stale",
              segments: lesson.segments.map((s) => ({ ...s, status: "stale" })),
            }
          : lesson,
      );
    });
  }

  async listWordGroups(userId: string): Promise<WordGroup[]> {
    const store = await this.readStore();
    return sortWordGroups(
      store.wordGroups.filter((g) => g.userId === userId),
    );
  }

  async getWordGroup(userId: string, id: string): Promise<WordGroup | null> {
    const store = await this.readStore();
    return (
      store.wordGroups.find((g) => g.userId === userId && g.id === id) ?? null
    );
  }

  async createWordGroup(group: WordGroup): Promise<WordGroup> {
    return this.mutateStore((store) => {
      store.wordGroups.push(group);
      return group;
    });
  }

  async updateWordGroup(
    userId: string,
    id: string,
    patch: Partial<Pick<WordGroup, "name" | "sortOrder" | "dateUpdated">>,
  ): Promise<WordGroup> {
    return this.mutateStore((store) => {
      const index = store.wordGroups.findIndex(
        (g) => g.userId === userId && g.id === id,
      );
      if (index === -1) throw new Error("Word group not found");
      store.wordGroups[index] = { ...store.wordGroups[index], ...patch };
      return store.wordGroups[index];
    });
  }

  async deleteWordGroup(userId: string, id: string): Promise<void> {
    await this.mutateStore((store) => {
      store.wordGroups = store.wordGroups.filter(
        (g) => !(g.userId === userId && g.id === id),
      );
      store.vocabulary = store.vocabulary.map((v) =>
        v.userId === userId && v.groupId === id
          ? { ...v, groupId: null }
          : v,
      );
    });
  }

  async reorderWordGroups(
    userId: string,
    orderedIds: string[],
  ): Promise<WordGroup[]> {
    return this.mutateStore((store) => {
      const userGroups = store.wordGroups.filter((g) => g.userId === userId);
      const idSet = new Set(userGroups.map((g) => g.id));
      if (
        orderedIds.length !== userGroups.length ||
        new Set(orderedIds).size !== orderedIds.length ||
        orderedIds.some((id) => !idSet.has(id))
      ) {
        throw new Error("Invalid group reorder payload");
      }
      const orders = sortOrdersForReorder(orderedIds.length);
      const byId = new Map(userGroups.map((g) => [g.id, g]));
      const now = new Date().toISOString();
      const reordered = orderedIds.map((id, index) => ({
        ...byId.get(id)!,
        sortOrder: orders[index]!,
        dateUpdated: now,
      }));
      store.wordGroups = [
        ...store.wordGroups.filter((g) => g.userId !== userId),
        ...reordered,
      ];
      return sortWordGroups(reordered);
    });
  }

  async assignWordToGroup(
    userId: string,
    vocabularyId: string,
    groupId: string | null,
  ): Promise<VocabularyEntry> {
    return this.mutateStore((store) => {
      if (groupId !== null) {
        const group = store.wordGroups.find(
          (g) => g.userId === userId && g.id === groupId,
        );
        if (!group) throw new Error("Word group not found");
      }
      const index = store.vocabulary.findIndex(
        (v) => v.userId === userId && v.id === vocabularyId,
      );
      if (index === -1) throw new Error("Vocabulary entry not found");
      store.vocabulary[index] = {
        ...store.vocabulary[index],
        groupId,
        dateUpdated: new Date().toISOString(),
      };
      return store.vocabulary[index];
    });
  }

  async getLearningProfile(userId: string): Promise<LearningProfile | null> {
    const store = await this.readStore();
    return (
      store.learningProfiles.find((p) => p.userId === userId) ?? null
    );
  }

  async upsertLearningProfile(
    profile: LearningProfile,
  ): Promise<LearningProfile> {
    return this.mutateStore((store) => {
      const index = store.learningProfiles.findIndex(
        (p) => p.userId === profile.userId,
      );
      if (index >= 0) {
        // Preserve identity: never overwrite another user's row via id clash
        store.learningProfiles[index] = {
          ...profile,
          id: store.learningProfiles[index].id,
          userId: store.learningProfiles[index].userId,
        };
        return store.learningProfiles[index];
      }
      store.learningProfiles.push(profile);
      return profile;
    });
  }

  async getGrammarProgress(
    userId: string,
    unitId: string,
  ): Promise<GrammarProgress | null> {
    const store = await this.readStore();
    return (
      store.grammarProgress.find(
        (p) => p.userId === userId && p.unitId === unitId,
      ) ?? null
    );
  }

  async listGrammarProgress(userId: string): Promise<GrammarProgress[]> {
    const store = await this.readStore();
    return store.grammarProgress.filter((p) => p.userId === userId);
  }

  async upsertGrammarProgress(
    progress: GrammarProgress,
  ): Promise<GrammarProgress> {
    return this.mutateStore((store) => {
      const index = store.grammarProgress.findIndex(
        (p) => p.userId === progress.userId && p.unitId === progress.unitId,
      );
      if (index >= 0) {
        store.grammarProgress[index] = {
          ...progress,
          id: store.grammarProgress[index].id,
          userId: store.grammarProgress[index].userId,
          unitId: store.grammarProgress[index].unitId,
        };
        return store.grammarProgress[index];
      }
      store.grammarProgress.push(progress);
      return progress;
    });
  }

  async getGrammarAudioLesson(
    userId: string,
    grammarUnitId: string,
    contentHash: string,
  ): Promise<GrammarAudioLesson | null> {
    const store = await this.readStore();
    return (
      store.grammarAudioLessons.find(
        (l) =>
          l.userId === userId &&
          l.grammarUnitId === grammarUnitId &&
          l.contentHash === contentHash &&
          l.status !== "stale",
      ) ?? null
    );
  }

  async saveGrammarAudioLesson(
    lesson: GrammarAudioLesson,
  ): Promise<GrammarAudioLesson> {
    return this.mutateStore((store) => {
      const index = store.grammarAudioLessons.findIndex(
        (l) => l.id === lesson.id && l.userId === lesson.userId,
      );
      if (index >= 0) {
        store.grammarAudioLessons[index] = {
          ...lesson,
          userId: store.grammarAudioLessons[index].userId,
        };
        return store.grammarAudioLessons[index];
      }
      store.grammarAudioLessons.push(lesson);
      return lesson;
    });
  }

  async getSentenceProgress(
    userId: string,
    unitId: string,
  ): Promise<SentenceProgress | null> {
    const store = await this.readStore();
    return (
      store.sentenceProgress.find(
        (p) => p.userId === userId && p.unitId === unitId,
      ) ?? null
    );
  }

  async listSentenceProgress(userId: string): Promise<SentenceProgress[]> {
    const store = await this.readStore();
    return store.sentenceProgress.filter((p) => p.userId === userId);
  }

  async upsertSentenceProgress(
    progress: SentenceProgress,
  ): Promise<SentenceProgress> {
    return this.mutateStore((store) => {
      const index = store.sentenceProgress.findIndex(
        (p) => p.userId === progress.userId && p.unitId === progress.unitId,
      );
      if (index >= 0) {
        store.sentenceProgress[index] = {
          ...progress,
          id: store.sentenceProgress[index].id,
          userId: store.sentenceProgress[index].userId,
          unitId: store.sentenceProgress[index].unitId,
        };
        return store.sentenceProgress[index];
      }
      store.sentenceProgress.push(progress);
      return progress;
    });
  }

  async getSentenceAudioLesson(
    userId: string,
    sentenceUnitId: string,
    contentHash: string,
  ): Promise<SentenceAudioLesson | null> {
    const store = await this.readStore();
    return (
      store.sentenceAudioLessons.find(
        (l) =>
          l.userId === userId &&
          l.sentenceUnitId === sentenceUnitId &&
          l.contentHash === contentHash &&
          l.status !== "stale",
      ) ?? null
    );
  }

  async saveSentenceAudioLesson(
    lesson: SentenceAudioLesson,
  ): Promise<SentenceAudioLesson> {
    return this.mutateStore((store) => {
      const index = store.sentenceAudioLessons.findIndex(
        (l) => l.id === lesson.id && l.userId === lesson.userId,
      );
      if (index >= 0) {
        store.sentenceAudioLessons[index] = {
          ...lesson,
          userId: store.sentenceAudioLessons[index].userId,
        };
        return store.sentenceAudioLessons[index];
      }
      store.sentenceAudioLessons.push(lesson);
      return lesson;
    });
  }

  async getSpeakingProgress(
    userId: string,
    unitId: string,
  ): Promise<SpeakingProgress | null> {
    const store = await this.readStore();
    return (
      store.speakingProgress.find(
        (p) => p.userId === userId && p.unitId === unitId,
      ) ?? null
    );
  }

  async listSpeakingProgress(userId: string): Promise<SpeakingProgress[]> {
    const store = await this.readStore();
    return store.speakingProgress.filter((p) => p.userId === userId);
  }

  async upsertSpeakingProgress(
    progress: SpeakingProgress,
  ): Promise<SpeakingProgress> {
    return this.mutateStore((store) => {
      const index = store.speakingProgress.findIndex(
        (p) => p.userId === progress.userId && p.unitId === progress.unitId,
      );
      if (index >= 0) {
        store.speakingProgress[index] = {
          ...progress,
          id: store.speakingProgress[index].id,
          userId: store.speakingProgress[index].userId,
          unitId: store.speakingProgress[index].unitId,
        };
        return store.speakingProgress[index];
      }
      store.speakingProgress.push(progress);
      return progress;
    });
  }

  async getSpeakingAudioLesson(
    userId: string,
    speakingUnitId: string,
    contentHash: string,
  ): Promise<SpeakingAudioLesson | null> {
    const store = await this.readStore();
    return (
      store.speakingAudioLessons.find(
        (l) =>
          l.userId === userId &&
          l.speakingUnitId === speakingUnitId &&
          l.contentHash === contentHash &&
          l.status !== "stale",
      ) ?? null
    );
  }

  async saveSpeakingAudioLesson(
    lesson: SpeakingAudioLesson,
  ): Promise<SpeakingAudioLesson> {
    return this.mutateStore((store) => {
      const index = store.speakingAudioLessons.findIndex(
        (l) => l.id === lesson.id && l.userId === lesson.userId,
      );
      if (index >= 0) {
        store.speakingAudioLessons[index] = {
          ...lesson,
          userId: store.speakingAudioLessons[index].userId,
        };
        return store.speakingAudioLessons[index];
      }
      store.speakingAudioLessons.push(lesson);
      return lesson;
    });
  }

  async getNotificationPreferences(
    userId: string,
  ): Promise<NotificationPreferences | null> {
    const store = await this.readStore();
    return (
      store.notificationPreferences.find((p) => p.userId === userId) ?? null
    );
  }

  async listNotificationPreferences(): Promise<NotificationPreferences[]> {
    const store = await this.readStore();
    return [...store.notificationPreferences];
  }

  async upsertNotificationPreferences(
    prefs: NotificationPreferences,
  ): Promise<NotificationPreferences> {
    return this.mutateStore((store) => {
      const index = store.notificationPreferences.findIndex(
        (p) => p.userId === prefs.userId,
      );
      if (index >= 0) {
        store.notificationPreferences[index] = {
          ...prefs,
          id: store.notificationPreferences[index].id,
          userId: store.notificationPreferences[index].userId,
        };
        return store.notificationPreferences[index];
      }
      store.notificationPreferences.push(prefs);
      return prefs;
    });
  }

  async listPushDeviceTokens(userId: string): Promise<PushDeviceToken[]> {
    const store = await this.readStore();
    return store.pushDeviceTokens.filter((t) => t.userId === userId);
  }

  async upsertPushDeviceToken(
    token: PushDeviceToken,
  ): Promise<PushDeviceToken> {
    const MAX_TOKENS_PER_USER = 3;
    return this.mutateStore((store) => {
      const byToken = store.pushDeviceTokens.findIndex(
        (t) => t.token === token.token,
      );
      if (byToken >= 0) {
        store.pushDeviceTokens[byToken] = {
          ...token,
          id: store.pushDeviceTokens[byToken].id,
          userId: token.userId,
          dateCreated: store.pushDeviceTokens[byToken].dateCreated,
        };
        return store.pushDeviceTokens[byToken];
      }
      store.pushDeviceTokens.push(token);
      const forUser = store.pushDeviceTokens
        .filter((t) => t.userId === token.userId)
        .sort((a, b) => a.dateCreated.localeCompare(b.dateCreated));
      if (forUser.length > MAX_TOKENS_PER_USER) {
        const drop = forUser.slice(0, forUser.length - MAX_TOKENS_PER_USER);
        const dropIds = new Set(drop.map((t) => t.id));
        store.pushDeviceTokens = store.pushDeviceTokens.filter(
          (t) => !dropIds.has(t.id),
        );
      }
      return token;
    });
  }

  async deletePushDeviceToken(userId: string, token: string): Promise<void> {
    await this.mutateStore((store) => {
      store.pushDeviceTokens = store.pushDeviceTokens.filter(
        (t) => !(t.userId === userId && t.token === token),
      );
      return undefined;
    });
  }

  async deleteAllPushDeviceTokens(userId: string): Promise<void> {
    await this.mutateStore((store) => {
      store.pushDeviceTokens = store.pushDeviceTokens.filter(
        (t) => t.userId !== userId,
      );
      return undefined;
    });
  }

  async getPianoProfile(userId: string): Promise<PianoProfile | null> {
    const store = await this.readStore();
    return store.pianoProfiles.find((p) => p.userId === userId) ?? null;
  }

  async upsertPianoProfile(profile: PianoProfile): Promise<PianoProfile> {
    return this.mutateStore((store) => {
      const index = store.pianoProfiles.findIndex(
        (p) => p.userId === profile.userId,
      );
      if (index >= 0) {
        store.pianoProfiles[index] = {
          ...profile,
          id: store.pianoProfiles[index].id,
          userId: store.pianoProfiles[index].userId,
        };
        return store.pianoProfiles[index];
      }
      store.pianoProfiles.push(profile);
      return profile;
    });
  }

  async listPianoSessions(userId: string): Promise<PracticeSession[]> {
    const store = await this.readStore();
    return store.pianoSessions.filter((s) => s.userId === userId);
  }

  async getPianoSessionByDay(
    userId: string,
    localDay: string,
  ): Promise<PracticeSession | null> {
    const store = await this.readStore();
    return (
      store.pianoSessions.find(
        (s) => s.userId === userId && s.localDay === localDay,
      ) ?? null
    );
  }

  async upsertPianoSession(
    session: PracticeSession,
  ): Promise<PracticeSession> {
    return this.mutateStore((store) => {
      const index = store.pianoSessions.findIndex(
        (s) =>
          s.userId === session.userId && s.localDay === session.localDay,
      );
      if (index >= 0) {
        store.pianoSessions[index] = {
          ...session,
          id: store.pianoSessions[index].id,
          userId: store.pianoSessions[index].userId,
          localDay: store.pianoSessions[index].localDay,
        };
        return store.pianoSessions[index];
      }
      store.pianoSessions.push(session);
      return session;
    });
  }

  async listPianoSkillProgress(
    userId: string,
  ): Promise<PianoSkillProgress[]> {
    const store = await this.readStore();
    return store.pianoSkillProgress.filter((p) => p.userId === userId);
  }

  async upsertPianoSkillProgress(
    progress: PianoSkillProgress,
  ): Promise<PianoSkillProgress> {
    return this.mutateStore((store) => {
      const index = store.pianoSkillProgress.findIndex(
        (p) =>
          p.userId === progress.userId && p.skillId === progress.skillId,
      );
      if (index >= 0) {
        store.pianoSkillProgress[index] = {
          ...progress,
          id: store.pianoSkillProgress[index].id,
          userId: store.pianoSkillProgress[index].userId,
          skillId: store.pianoSkillProgress[index].skillId,
        };
        return store.pianoSkillProgress[index];
      }
      store.pianoSkillProgress.push(progress);
      return progress;
    });
  }

  async listYoutubeNotes(userId: string): Promise<YoutubeNote[]> {
    const store = await this.readStore();
    return store.youtubeNotes.filter((n) => n.userId === userId);
  }

  async getYoutubeNote(
    userId: string,
    noteId: string,
  ): Promise<YoutubeNote | null> {
    const store = await this.readStore();
    return (
      store.youtubeNotes.find(
        (n) => n.userId === userId && n.id === noteId,
      ) ?? null
    );
  }

  async upsertYoutubeNote(note: YoutubeNote): Promise<YoutubeNote> {
    return this.mutateStore((store) => {
      const index = store.youtubeNotes.findIndex(
        (n) => n.id === note.id && n.userId === note.userId,
      );
      if (index >= 0) {
        store.youtubeNotes[index] = {
          ...note,
          id: store.youtubeNotes[index].id,
          userId: store.youtubeNotes[index].userId,
        };
        return store.youtubeNotes[index];
      }
      store.youtubeNotes.push(note);
      return note;
    });
  }
}

export function createLocalRepository(): VocabularyRepository {
  return new LocalVocabularyRepository();
}
