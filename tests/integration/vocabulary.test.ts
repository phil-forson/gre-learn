import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import { LocalVocabularyRepository } from "@/features/vocabulary/repository/local";
import { MockVocabularyGenerationProvider } from "@/features/generation/providers/mock";
import { buildAudioLessonScript } from "@/features/audio/services/lesson-script";
import { contentHash, createId, nowIso } from "@/lib/utils";
import type { VocabularyEntry } from "@/features/vocabulary/types";

const TEST_DATA = path.join(process.cwd(), "data", "store.json");

describe("local vocabulary persistence integration", () => {
  beforeEach(async () => {
    await fs.rm(TEST_DATA, { force: true });
  });

  afterEach(async () => {
    await fs.rm(TEST_DATA, { force: true });
  });

  it("adds a word and prevents duplicates", async () => {
    const repo = new LocalVocabularyRepository();
    const provider = new MockVocabularyGenerationProvider();
    const content = await provider.generate("parsimonious");
    const hash = await contentHash([content.normalizedWord, content.definitions[0]!.text]);
    const entry: VocabularyEntry = {
      id: createId("vocab"),
      userId: "default-user",
      word: content.word,
      normalizedWord: content.normalizedWord,
      partOfSpeech: content.partOfSpeech,
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
    const repo = new LocalVocabularyRepository();
    const content = await new MockVocabularyGenerationProvider().generate("laconic");
    const entry: VocabularyEntry = {
      id: createId("vocab"),
      userId: "default-user",
      word: content.word,
      normalizedWord: content.normalizedWord,
      partOfSpeech: content.partOfSpeech,
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
});
