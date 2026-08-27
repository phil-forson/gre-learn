import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { LocalVocabularyRepository } from "@/features/vocabulary/repository/local";
import { createId, nowIso } from "@/lib/utils";
import type { VocabularyEntry, WordGroup } from "@/features/vocabulary/types";

let testDataDir: string;

async function createIsolatedDataDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "gre-learn-groups-test-"));
}

function createTestRepo(): LocalVocabularyRepository {
  return new LocalVocabularyRepository({ dataDir: testDataDir });
}

function sampleEntry(
  id: string,
  word: string,
  groupId: string | null = null,
): VocabularyEntry {
  return {
    id,
    userId: "default-user",
    word,
    normalizedWord: word.toLowerCase(),
    partOfSpeech: ["adjective"],
    groupId,
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
    content: {
      word,
      normalizedWord: word.toLowerCase(),
      partOfSpeech: ["adjective"],
      pronunciation: { simple: "test" },
      definitions: [{ text: "test definition", isPrimary: true }],
      etymology: {
        summary: "test",
        isUsefulForRootLearning: false,
        components: [],
      },
      memoryHook: { text: "hook", type: "story" },
      synonyms: [{ word: "syn" }],
      antonyms: [],
      exampleSentences: [{ text: "Example." }],
      wordFamily: [],
      confusedWith: [],
    },
  };
}

function sampleGroup(id: string, name: string, sortOrder: string): WordGroup {
  const now = nowIso();
  return {
    id,
    userId: "default-user",
    name,
    sortOrder,
    dateCreated: now,
    dateUpdated: now,
  };
}

describe("word groups persistence", () => {
  beforeEach(async () => {
    testDataDir = await createIsolatedDataDir();
  });

  afterEach(async () => {
    await fs.rm(testDataDir, { recursive: true, force: true });
  });

  it("creates groups sorted by sortOrder with localeCompare numeric", async () => {
    const repo = createTestRepo();
    await repo.createWordGroup(sampleGroup("g2", "Week 2", "2"));
    await repo.createWordGroup(sampleGroup("g10", "Week 10", "10"));
    await repo.createWordGroup(sampleGroup("g1", "Week 1", "1"));

    const groups = await repo.listWordGroups("default-user");
    expect(groups.map((g) => g.name)).toEqual(["Week 1", "Week 2", "Week 10"]);
  });

  it("assigns words to a group and filters the library list", async () => {
    const repo = createTestRepo();
    await repo.createWordGroup(sampleGroup("g1", "Set A", "1"));
    await repo.create(sampleEntry("v1", "alpha", "g1"));
    await repo.create(sampleEntry("v2", "beta", null));

    const inGroup = await repo.list({
      userId: "default-user",
      groupId: "g1",
      page: 1,
      pageSize: 20,
    });
    expect(inGroup.total).toBe(1);
    expect(inGroup.items[0]?.word).toBe("alpha");

    const ungrouped = await repo.list({
      userId: "default-user",
      groupId: "ungrouped",
      page: 1,
      pageSize: 20,
    });
    expect(ungrouped.total).toBe(1);
    expect(ungrouped.items[0]?.word).toBe("beta");
  });

  it("rejects assign when group does not exist", async () => {
    const repo = createTestRepo();
    await repo.create(sampleEntry("v1", "alpha"));

    await expect(
      repo.assignWordToGroup("default-user", "v1", "missing"),
    ).rejects.toThrow(/not found/i);
  });

  it("delete group nulls member groupId without deleting vocabulary", async () => {
    const repo = createTestRepo();
    await repo.createWordGroup(sampleGroup("g1", "Set A", "1"));
    await repo.create(sampleEntry("v1", "alpha", "g1"));

    await repo.deleteWordGroup("default-user", "g1");

    const entry = await repo.getById("default-user", "v1");
    expect(entry?.groupId).toBeNull();
    expect(entry?.word).toBe("alpha");
    expect(await repo.listWordGroups("default-user")).toHaveLength(0);
  });

  it("reorders groups and legacy store without wordGroups loads empty array", async () => {
    const repo = createTestRepo();
    await repo.createWordGroup(sampleGroup("g1", "A", "1"));
    await repo.createWordGroup(sampleGroup("g2", "B", "2"));
    await repo.create(sampleEntry("v1", "legacy", "g1"));
    const reordered = await repo.reorderWordGroups("default-user", ["g2", "g1"]);
    expect(reordered.map((g) => g.id)).toEqual(["g2", "g1"]);

    const legacyPath = path.join(testDataDir, "store.json");
    const legacy = JSON.parse(await fs.readFile(legacyPath, "utf8")) as Record<
      string,
      unknown
    >;
    delete legacy.wordGroups;
    const vocab = legacy.vocabulary as VocabularyEntry[];
    legacy.vocabulary = vocab.map((entry) => {
      const { groupId: _removed, ...rest } = entry as VocabularyEntry & {
        groupId?: string | null;
      };
      return rest;
    });
    await fs.writeFile(legacyPath, JSON.stringify(legacy, null, 2));

    const fresh = createTestRepo();
    expect(await fresh.listWordGroups("default-user")).toEqual([]);
    const entry = await fresh.getById("default-user", "v1");
    expect(entry?.groupId).toBeNull();
  });
});

describe("word group ids", () => {
  it("uses createId group prefix", () => {
    expect(createId("group")).toMatch(/^group_/);
  });
});
