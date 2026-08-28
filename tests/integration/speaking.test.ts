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
import {
  createLocalSpeakingRepository,
  setSpeakingRepositoryForTests,
} from "@/features/speaking/repository";
import { getSpokenShortTurnsUnit } from "@/features/speaking/seed/spoken-short-turns";
import { toPublicSpeakingUnit } from "@/features/speaking/catalog";
import {
  ensureSpeakingAudioLesson,
  submitUnitMicroTask,
} from "@/features/speaking/services/speaking-service";
import { resolveContinueTarget } from "@/features/path/services/continue-service";
import { resolveSpeakingContinueHref } from "@/features/speaking/catalog";
import type { VocabularyEntry } from "@/features/vocabulary/types";
import { createId, nowIso } from "@/lib/utils";

/**
 * NEVER use process.cwd()/data here. That is the live vocabulary store.
 * Tests must use an isolated temp directory only.
 */
let testDataDir: string;

async function createIsolatedDataDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "gre-learn-speaking-test-"));
}

describe("speaking persistence + continue integration", () => {
  beforeEach(async () => {
    testDataDir = await createIsolatedDataDir();
    const vocabRepo = new LocalVocabularyRepository({ dataDir: testDataDir });
    setVocabularyRepositoryForTests(vocabRepo);
    setPathRepositoryForTests(
      createLocalPathRepository({ dataDir: testDataDir, vocabRepo }),
    );
    setSpeakingRepositoryForTests(
      createLocalSpeakingRepository({ dataDir: testDataDir, vocabRepo }),
    );
  });

  afterEach(async () => {
    setSpeakingRepositoryForTests(null);
    setPathRepositoryForTests(null);
    setVocabularyRepositoryForTests(null);
    await fs.rm(testDataDir, { recursive: true, force: true });
  });

  it("defaults missing speaking keys and does not wipe vocabulary", async () => {
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

    const unit = await getSpokenShortTurnsUnit();
    await ensureSpeakingAudioLesson(unit.id);

    const raw = JSON.parse(
      await fs.readFile(path.join(testDataDir, "store.json"), "utf8"),
    );
    expect(raw.vocabulary).toHaveLength(1);
    expect(Array.isArray(raw.speakingProgress)).toBe(true);
    expect(Array.isArray(raw.speakingAudioLessons)).toBe(true);
    expect(raw.speakingAudioLessons.length).toBeGreaterThanOrEqual(1);
  });

  it("audio script path works and micro-task completes the unit", async () => {
    const unit = await getSpokenShortTurnsUnit();
    const audio = await ensureSpeakingAudioLesson(unit.id);
    expect(audio.script.length).toBeGreaterThan(3);
    expect(JSON.stringify(audio.unit)).not.toContain("correctChoiceId");
    expect(toPublicSpeakingUnit(unit).microTask.items[0]).not.toHaveProperty(
      "correctChoiceId",
    );

    const result = await submitUnitMicroTask(unit.id, {
      answers: unit.microTask.items.map((item) => ({
        itemId: item.id,
        choiceId: item.correctChoiceId,
      })),
    });
    expect(result.score.passed).toBe(true);
    expect(result.progress.status).toBe("completed");
  });

  it("speaking continue does not skip A2 basics for a B2 profile", async () => {
    const pathRepo = createLocalPathRepository({ dataDir: testDataDir });
    await pathRepo.skipPlacement("default-user", "B2");
    await pathRepo.updateProfile("default-user", { activeTrackId: "speaking" });

    const href = await resolveSpeakingContinueHref();
    expect(href.href).toBe("/speaking/spoken-short-turns");

    const target = await resolveContinueTarget();
    expect(target.trackId).toBe("speaking");
    expect(target.needsPlacement).toBe(false);
    expect(target.href).toBe("/speaking/spoken-short-turns");
  });
});
