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
  createLocalGrammarRepository,
  setGrammarRepositoryForTests,
} from "@/features/grammar/repository";
import { getPresentPerfectExperienceUnit } from "@/features/grammar/seed/present-perfect-experience";
import { toPublicGrammarUnit } from "@/features/grammar/catalog";
import {
  ensureGrammarAudioLesson,
  submitUnitKnowledgeTest,
  submitUnitMicroTask,
} from "@/features/grammar/services/grammar-service";
import { resolveContinueTarget } from "@/features/path/services/continue-service";
import { GRAMMAR_CONTINUE_HREF } from "@/features/grammar/catalog";
import type { VocabularyEntry } from "@/features/vocabulary/types";
import { createId, nowIso } from "@/lib/utils";
import { getPresentPerfectResultUnit } from "@/features/grammar/seed/present-perfect-result";

/**
 * NEVER use process.cwd()/data here. That is the live vocabulary store.
 * Tests must use an isolated temp directory only.
 */
let testDataDir: string;

async function createIsolatedDataDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "gre-learn-grammar-test-"));
}

describe("grammar persistence + continue integration", () => {
  beforeEach(async () => {
    testDataDir = await createIsolatedDataDir();
    const vocabRepo = new LocalVocabularyRepository({ dataDir: testDataDir });
    setVocabularyRepositoryForTests(vocabRepo);
    setPathRepositoryForTests(
      createLocalPathRepository({ dataDir: testDataDir, vocabRepo }),
    );
    setGrammarRepositoryForTests(
      createLocalGrammarRepository({ dataDir: testDataDir, vocabRepo }),
    );
  });

  afterEach(async () => {
    setGrammarRepositoryForTests(null);
    setPathRepositoryForTests(null);
    setVocabularyRepositoryForTests(null);
    await fs.rm(testDataDir, { recursive: true, force: true });
  });

  it("defaults missing grammar keys and does not wipe vocabulary", async () => {
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

    const unit = await getPresentPerfectExperienceUnit();
    await ensureGrammarAudioLesson(unit.id);

    const raw = JSON.parse(
      await fs.readFile(path.join(testDataDir, "store.json"), "utf8"),
    );
    expect(raw.vocabulary).toHaveLength(1);
    expect(Array.isArray(raw.grammarProgress)).toBe(true);
    expect(Array.isArray(raw.grammarAudioLessons)).toBe(true);
    expect(raw.grammarAudioLessons.length).toBeGreaterThanOrEqual(1);
    expect(raw.audioLessons ?? []).toEqual([]);
  });

  it("generate is idempotent on same hash/voice and strips correct keys from public unit", async () => {
    const unit = await getPresentPerfectExperienceUnit();
    const first = await ensureGrammarAudioLesson(unit.id);
    const second = await ensureGrammarAudioLesson(unit.id);

    expect(second.lesson.id).toBe(first.lesson.id);
    expect(second.lesson.contentHash).toBe(unit.contentHash);
    expect(second.script.map((s) => s.text)).toEqual(
      first.script.map((s) => s.text),
    );
    expect(JSON.stringify(second.unit)).not.toContain("correctChoiceId");
    expect(toPublicGrammarUnit(unit).microTask.items[0]).not.toHaveProperty(
      "correctChoiceId",
    );
  });

  it("micro-task submit updates progress", async () => {
    const unit = await getPresentPerfectExperienceUnit();
    const answers = unit.microTask.items.map((item) => ({
      itemId: item.id,
      choiceId: item.correctChoiceId,
    }));
    const result = await submitUnitMicroTask(unit.id, { answers });
    expect(result.score.passed).toBe(true);
    expect(result.progress.status).toBe("completed");
    expect(result.progress.microTaskPassed).toBe(true);
    expect(result.progress.knowledgeTestPassed).toBe(false);
    expect(JSON.stringify(result.unit)).not.toContain("correctChoiceId");
  });

  it("knowledge test is sticky and does not gate completed status", async () => {
    const unit = await getPresentPerfectExperienceUnit();
    expect(unit.knowledgeTest).toBeDefined();
    const items = unit.knowledgeTest!.items;

    const passAnswers = items.map((item) => ({
      itemId: item.id,
      choiceId: item.correctChoiceId,
    }));
    const passed = await submitUnitKnowledgeTest(unit.id, {
      answers: passAnswers,
    });
    expect(passed.score.passed).toBe(true);
    expect(passed.progress.knowledgeTestPassed).toBe(true);
    expect(passed.progress.status).not.toBe("completed");
    expect(passed.progress.microTaskPassed).toBe(false);
    expect(JSON.stringify(passed.unit)).not.toContain("correctChoiceId");

    const failAnswers = items.map((item) => {
      const wrong = item.choices.find((c) => c.id !== item.correctChoiceId)!;
      return { itemId: item.id, choiceId: wrong.id };
    });
    const failedRetry = await submitUnitKnowledgeTest(unit.id, {
      answers: failAnswers,
    });
    expect(failedRetry.score.passed).toBe(false);
    expect(failedRetry.progress.knowledgeTestPassed).toBe(true);
    expect(failedRetry.progress.status).not.toBe("completed");

    const practice = await submitUnitMicroTask(unit.id, {
      answers: unit.microTask.items.map((item) => ({
        itemId: item.id,
        choiceId: item.correctChoiceId,
      })),
    });
    expect(practice.progress.status).toBe("completed");
    expect(practice.progress.microTaskPassed).toBe(true);
    expect(practice.progress.knowledgeTestPassed).toBe(true);
  });

  it("returns 404 when submitting a knowledge test for a unit without one", async () => {
    const unit = await getPresentPerfectResultUnit();
    await expect(
      submitUnitKnowledgeTest(unit.id, {
        answers: [{ itemId: "x", choiceId: "a" }],
      }),
    ).rejects.toMatchObject({
      status: 404,
      code: "NOT_FOUND",
    });
  });

  it("Continue routes grammar to the unit; legacy vocabulary coerces to grammar", async () => {
    const pathRepo = createLocalPathRepository({ dataDir: testDataDir });
    await pathRepo.skipPlacement("default-user", "B1");
    await pathRepo.updateProfile("default-user", { activeTrackId: "grammar" });

    const grammarTarget = await resolveContinueTarget();
    expect(grammarTarget.needsPlacement).toBe(false);
    expect(grammarTarget.href).toBe(GRAMMAR_CONTINUE_HREF);
    expect(grammarTarget.trackId).toBe("grammar");

    // Patching vocabulary is coerced to grammar (no Library/Audio continue)
    await pathRepo.updateProfile("default-user", {
      activeTrackId: "vocabulary",
    });
    const coerced = await pathRepo.getOrCreateProfile("default-user");
    expect(coerced.activeTrackId).toBe("grammar");

    const afterCoerce = await resolveContinueTarget();
    expect(afterCoerce.trackId).toBe("grammar");
    expect(afterCoerce.href).toBe(GRAMMAR_CONTINUE_HREF);
  });
});
