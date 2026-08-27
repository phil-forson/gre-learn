import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { LocalVocabularyRepository } from "@/features/vocabulary/repository/local";
import { setVocabularyRepositoryForTests } from "@/features/vocabulary/repository";
import {
  listVocabulary,
  toggleFavorite,
} from "@/features/vocabulary/services/vocabulary-service";
import { MockVocabularyGenerationProvider } from "@/features/generation/providers/mock";
import { buildAudioLessonScript } from "@/features/audio/services/lesson-script";
import { contentHash, createId, nowIso } from "@/lib/utils";
import type { VocabularyEntry } from "@/features/vocabulary/types";

/**
 * NEVER use process.cwd()/data here. That is the live vocabulary store.
 * Tests must use an isolated temp directory only.
 */
let testDataDir: string;

async function createIsolatedDataDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "gre-learn-vocab-test-"));
}

function createTestRepo(): LocalVocabularyRepository {
  return new LocalVocabularyRepository({ dataDir: testDataDir });
}

describe("local vocabulary persistence integration", () => {
  beforeEach(async () => {
    testDataDir = await createIsolatedDataDir();
  });

  afterEach(async () => {
    setVocabularyRepositoryForTests(null);
    await fs.rm(testDataDir, { recursive: true, force: true });
  });

  it("adds a word and prevents duplicates", async () => {
    const repo = createTestRepo();
    const provider = new MockVocabularyGenerationProvider();
    const content = await provider.generate("parsimonious");
    const hash = await contentHash([content.normalizedWord, content.definitions[0]!.text]);
    const entry: VocabularyEntry = {
      id: createId("vocab"),
      userId: "default-user",
      word: content.word,
      normalizedWord: content.normalizedWord,
      partOfSpeech: content.partOfSpeech,
      groupId: null,
      status: "ready",
      isFavorite: false,
      dateAdded: nowIso(),
      dateUpdated: nowIso(),
      lastReviewedAt: null,
      reviewCount: 0,
      contentVersion: 1,
      contentHash: hash,
      generationProvider: provider.name,
      generationModel: provider.model,
      generationError: null,
      audioStatus: "none",
      audioError: null,
      personalNote: null,
      content,
    };
    await repo.create(entry);
    const dup = await repo.getByNormalizedWord("default-user", "parsimonious");
    expect(dup?.id).toBe(entry.id);

    // TTS failure must not destroy content
    await repo.update("default-user", entry.id, {
      audioStatus: "failed",
      status: "audio_failed",
      audioError: "tts failed",
    });
    const still = await repo.getById("default-user", entry.id);
    expect(still?.content?.definitions[0]?.text).toBeTruthy();
    expect(still?.status).toBe("audio_failed");
  });

  it("regeneration bumps version and marks audio stale", async () => {
    const repo = createTestRepo();
    const content = await new MockVocabularyGenerationProvider().generate("laconic");
    const entry: VocabularyEntry = {
      id: createId("vocab"),
      userId: "default-user",
      word: content.word,
      normalizedWord: content.normalizedWord,
      partOfSpeech: content.partOfSpeech,
      groupId: null,
      status: "ready",
      isFavorite: false,
      dateAdded: nowIso(),
      dateUpdated: nowIso(),
      lastReviewedAt: null,
      reviewCount: 0,
      contentVersion: 1,
      contentHash: "oldhash",
      generationProvider: "mock",
      generationModel: "m",
      generationError: null,
      audioStatus: "ready",
      audioError: null,
      personalNote: null,
      content,
    };
    await repo.create(entry);
    await repo.saveAudioLesson({
      id: "lesson1",
      vocabularyEntryId: entry.id,
      contentHash: "oldhash",
      voice: "alloy",
      status: "ready",
      createdAt: nowIso(),
      segments: [],
    });

    const newHash = await contentHash(["new", "content"]);
    await repo.update("default-user", entry.id, {
      contentVersion: 2,
      contentHash: newHash,
      audioStatus: "stale",
    });
    await repo.markAudioStale(entry.id);
    const lesson = await repo.getAudioLesson(entry.id, "oldhash");
    expect(lesson).toBeNull();
    const script = buildAudioLessonScript(content);
    expect(script.length).toBeGreaterThan(5);
  });

  it("concurrent mutations do not wipe vocabulary", async () => {
    const repo = createTestRepo();
    const base: VocabularyEntry = {
      id: "vocab_seed",
      userId: "default-user",
      word: "seed",
      normalizedWord: "seed",
      partOfSpeech: ["noun"],
      groupId: null,
      status: "ready",
      isFavorite: false,
      dateAdded: nowIso(),
      dateUpdated: nowIso(),
      lastReviewedAt: null,
      reviewCount: 0,
      contentVersion: 1,
      contentHash: "hash",
      generationProvider: "mock",
      generationModel: "m",
      generationError: null,
      audioStatus: "none",
      audioError: null,
      personalNote: null,
      content: null,
    };
    await repo.create(base);

    await Promise.all(
      Array.from({ length: 40 }, (_, i) =>
        i % 2 === 0
          ? repo.addReviewEvent({
              id: createId("review"),
              userId: "default-user",
              vocabularyEntryId: base.id,
              playedAt: nowIso(),
              action: i % 4 === 0 ? "played" : "completed",
            })
          : repo.update("default-user", base.id, {
              reviewCount: i,
              dateUpdated: nowIso(),
            }),
      ),
    );

    const still = await repo.getById("default-user", base.id);
    expect(still?.word).toBe("seed");
    const listed = await repo.list({
      userId: "default-user",
      page: 1,
      pageSize: 50,
      sort: "newest",
    });
    expect(listed.total).toBe(1);
  });

  it("toggleFavorite persists and favoritesOnly lists starred words", async () => {
    const repo = createTestRepo();
    setVocabularyRepositoryForTests(repo);

    const starred: VocabularyEntry = {
      id: "vocab_fav",
      userId: "default-user",
      word: "laconic",
      normalizedWord: "laconic",
      partOfSpeech: ["adjective"],
      groupId: null,
      status: "ready",
      isFavorite: false,
      dateAdded: nowIso(),
      dateUpdated: nowIso(),
      lastReviewedAt: null,
      reviewCount: 0,
      contentVersion: 1,
      contentHash: "hash",
      generationProvider: "mock",
      generationModel: "m",
      generationError: null,
      audioStatus: "none",
      audioError: null,
      personalNote: null,
      content: null,
    };
    const other: VocabularyEntry = {
      ...starred,
      id: "vocab_other",
      word: "obdurate",
      normalizedWord: "obdurate",
    };
    await repo.create(starred);
    await repo.create(other);

    const toggled = await toggleFavorite(starred.id);
    expect(toggled.isFavorite).toBe(true);

    const favorites = await listVocabulary({
      favoritesOnly: true,
      sort: "alpha",
      pageSize: 50,
    });
    expect(favorites.total).toBe(1);
    expect(favorites.items.map((e) => e.id)).toEqual([starred.id]);

    const untoggled = await toggleFavorite(starred.id);
    expect(untoggled.isFavorite).toBe(false);
    const empty = await listVocabulary({ favoritesOnly: true, pageSize: 50 });
    expect(empty.total).toBe(0);
  });
});
