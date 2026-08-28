import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { LocalVocabularyRepository } from "@/features/vocabulary/repository/local";
import { setVocabularyRepositoryForTests } from "@/features/vocabulary/repository";
import {
  createLocalPathRepository,
  setPathRepositoryForTests,
} from "@/features/path/repository";
import { listPublicPlacementItems } from "@/features/path/services/placement-service";
import { scorePlacement } from "@/features/path/placement/score";
import { getPlacementBank } from "@/features/path/placement/bank";
import type { VocabularyEntry } from "@/features/vocabulary/types";
import { createId, nowIso } from "@/lib/utils";

/**
 * NEVER use process.cwd()/data here. That is the live vocabulary store.
 * Tests must use an isolated temp directory only.
 */
let testDataDir: string;

async function createIsolatedDataDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "gre-learn-path-test-"));
}

describe("path repository + store integration", () => {
  beforeEach(async () => {
    testDataDir = await createIsolatedDataDir();
    const vocabRepo = new LocalVocabularyRepository({ dataDir: testDataDir });
    setVocabularyRepositoryForTests(vocabRepo);
    setPathRepositoryForTests(
      createLocalPathRepository({ dataDir: testDataDir, vocabRepo }),
    );
  });

  afterEach(async () => {
    setPathRepositoryForTests(null);
    setVocabularyRepositoryForTests(null);
    await fs.rm(testDataDir, { recursive: true, force: true });
  });

  it("loads missing learningProfiles as empty and get-or-create is idempotent", async () => {
    const pathRepo = createLocalPathRepository({ dataDir: testDataDir });
    const a = await pathRepo.getOrCreateProfile("default-user");
    const b = await pathRepo.getOrCreateProfile("default-user");
    expect(a.id).toBe(b.id);
    expect(a.cefrLevel).toBeNull();
    expect(a.activeTrackId).toBe("grammar");
    expect(a.placementStatus).toBe("not_started");
    expect(a.locale).toBe("en-US");
  });

  it("coerces legacy activeTrackId vocabulary to grammar and persists", async () => {
    const vocabRepo = new LocalVocabularyRepository({ dataDir: testDataDir });
    const now = nowIso();
    await vocabRepo.upsertLearningProfile({
      id: createId("profile"),
      userId: "default-user",
      locale: "en-US",
      cefrLevel: "B1",
      pathMode: "standard",
      activeTrackId: "vocabulary",
      placementStatus: "skipped",
      lastPlacementAt: now,
      lastPlacement: null,
      continueHint: null,
      dateCreated: now,
      dateUpdated: now,
    });

    const pathRepo = createLocalPathRepository({
      dataDir: testDataDir,
      vocabRepo,
    });
    const profile = await pathRepo.getOrCreateProfile("default-user");
    expect(profile.activeTrackId).toBe("grammar");

    const again = await pathRepo.getOrCreateProfile("default-user");
    expect(again.activeTrackId).toBe("grammar");

    const raw = JSON.parse(
      await fs.readFile(path.join(testDataDir, "store.json"), "utf8"),
    );
    expect(raw.learningProfiles[0].activeTrackId).toBe("grammar");
  });

  it("does not wipe vocabulary when saving a profile", async () => {
    const vocabRepo = new LocalVocabularyRepository({ dataDir: testDataDir });
    const entry: VocabularyEntry = {
      id: createId("vocab"),
      userId: "default-user",
      word: "testword",
      normalizedWord: "testword",
      partOfSpeech: ["noun"],
      groupId: null,
      status: "pending",
      isFavorite: false,
      dateAdded: nowIso(),
      dateUpdated: nowIso(),
      lastReviewedAt: null,
      reviewCount: 0,
      contentVersion: 1,
      contentHash: null,
      generationProvider: null,
      generationModel: null,
      generationError: null,
      audioStatus: "none",
      audioError: null,
      personalNote: null,
      content: null,
    };
    await vocabRepo.create(entry);

    const pathRepo = createLocalPathRepository({
      dataDir: testDataDir,
      vocabRepo,
    });
    await pathRepo.getOrCreateProfile("default-user");
    await pathRepo.updateProfile("default-user", { cefrLevel: "B1" });

    const stillThere = await vocabRepo.getById("default-user", entry.id);
    expect(stillThere?.normalizedWord).toBe("testword");

    const raw = JSON.parse(
      await fs.readFile(path.join(testDataDir, "store.json"), "utf8"),
    );
    expect(raw.vocabulary).toHaveLength(1);
    expect(raw.learningProfiles).toHaveLength(1);
  });

  it("persists placement only after a valid scored result", async () => {
    const pathRepo = createLocalPathRepository({ dataDir: testDataDir });
    const answers = getPlacementBank().map((item) => ({
      itemId: item.id,
      choiceId: item.correctChoiceId,
    }));
    const result = scorePlacement(answers);
    const profile = await pathRepo.savePlacement("default-user", result);
    expect(profile.placementStatus).toBe("completed");
    expect(profile.cefrLevel).toBe(result.recommendedLevel);
    expect(profile.lastPlacement?.method).toBe("rules");
  });

  it("skips placement with B1 default", async () => {
    const pathRepo = createLocalPathRepository({ dataDir: testDataDir });
    const profile = await pathRepo.skipPlacement("default-user", "B1");
    expect(profile.placementStatus).toBe("skipped");
    expect(profile.cefrLevel).toBe("B1");
    expect(profile.lastPlacement).toBeNull();
  });

  it("GET public items never include correctChoiceId", () => {
    const publicItems = listPublicPlacementItems();
    expect(publicItems.length).toBeGreaterThan(0);
    for (const item of publicItems) {
      expect(item).not.toHaveProperty("correctChoiceId");
      expect(item.choices.length).toBeGreaterThan(1);
    }
  });

  it("scopes profiles by userId", async () => {
    const pathRepo = createLocalPathRepository({ dataDir: testDataDir });
    const u1 = await pathRepo.getOrCreateProfile("user-a");
    const u2 = await pathRepo.getOrCreateProfile("user-b");
    expect(u1.id).not.toBe(u2.id);
    await pathRepo.updateProfile("user-a", { cefrLevel: "C1" });
    const refreshedB = await pathRepo.getOrCreateProfile("user-b");
    expect(refreshedB.cefrLevel).toBeNull();
  });
});
