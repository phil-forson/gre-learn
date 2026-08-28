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
  createLocalSentenceRepository,
  setSentenceRepositoryForTests,
} from "@/features/sentence/repository";
import { getSentenceCombiningClarityUnit } from "@/features/sentence/seed/sentence-combining-clarity";
import { toPublicSentenceUnit } from "@/features/sentence/catalog";
import {
  ensureSentenceAudioLesson,
  submitUnitMicroTask,
} from "@/features/sentence/services/sentence-service";
import { resolveContinueTarget } from "@/features/path/services/continue-service";
import { resolveSentenceContinueHref } from "@/features/sentence/catalog";
import type { VocabularyEntry } from "@/features/vocabulary/types";
import { createId, nowIso } from "@/lib/utils";

/**
 * NEVER use process.cwd()/data here. That is the live vocabulary store.
 * Tests must use an isolated temp directory only.
 */
let testDataDir: string;

async function createIsolatedDataDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "gre-learn-sentence-test-"));
}

describe("sentence persistence + continue integration", () => {
  beforeEach(async () => {
    testDataDir = await createIsolatedDataDir();
    const vocabRepo = new LocalVocabularyRepository({ dataDir: testDataDir });
    setVocabularyRepositoryForTests(vocabRepo);
    setPathRepositoryForTests(
      createLocalPathRepository({ dataDir: testDataDir, vocabRepo }),
    );
    setSentenceRepositoryForTests(
      createLocalSentenceRepository({ dataDir: testDataDir, vocabRepo }),
    );
  });

  afterEach(async () => {
    setSentenceRepositoryForTests(null);
    setPathRepositoryForTests(null);
    setVocabularyRepositoryForTests(null);
    await fs.rm(testDataDir, { recursive: true, force: true });
  });

  it("defaults missing sentence keys and does not wipe vocabulary", async () => {
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

    const unit = await getSentenceCombiningClarityUnit();
    await ensureSentenceAudioLesson(unit.id);

    const raw = JSON.parse(
      await fs.readFile(path.join(testDataDir, "store.json"), "utf8"),
    );
    expect(raw.vocabulary).toHaveLength(1);
    expect(Array.isArray(raw.sentenceProgress)).toBe(true);
    expect(Array.isArray(raw.sentenceAudioLessons)).toBe(true);
    expect(raw.sentenceAudioLessons.length).toBeGreaterThanOrEqual(1);
  });

  it("strips correctChoiceId and scores micro-task to complete", async () => {
    const unit = await getSentenceCombiningClarityUnit();
    const audio = await ensureSentenceAudioLesson(unit.id);
    expect(JSON.stringify(audio.unit)).not.toContain("correctChoiceId");
    expect(toPublicSentenceUnit(unit).microTask.items[0]).not.toHaveProperty(
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

  it("sentence continue skips units more than one band below profile CEFR", async () => {
    const pathRepo = createLocalPathRepository({ dataDir: testDataDir });
    await pathRepo.skipPlacement("default-user", "C1");
    await pathRepo.updateProfile("default-user", { activeTrackId: "sentence" });

    // B1 unit is more than one band below C1 → skipped; first eligible is B2
    const href = await resolveSentenceContinueHref();
    expect(href.href).toBe("/sentence/connectors-additive-contrast");

    const target = await resolveContinueTarget();
    expect(target.trackId).toBe("sentence");
    expect(target.needsPlacement).toBe(false);
    expect(target.href).toBe("/sentence/connectors-additive-contrast");
  });
});
