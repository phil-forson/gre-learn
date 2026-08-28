import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { LocalVocabularyRepository } from "@/features/vocabulary/repository/local";
import { setVocabularyRepositoryForTests } from "@/features/vocabulary/repository";
import {
  createLocalPianoRepository,
  setPianoRepositoryForTests,
} from "@/features/piano/repository";
import { getOrCreatePianoProfile } from "@/features/piano/services/profile-service";
import { getTodayPlan } from "@/features/piano/services/today-service";
import { completeSessionBlock } from "@/features/piano/services/session-service";
import {
  createYoutubeNote,
  mapNoteToPlan,
} from "@/features/piano/services/notes-service";
import { markSkillPracticed } from "@/features/piano/services/skill-service";
import type { VocabularyEntry } from "@/features/vocabulary/types";
import { createId, nowIso } from "@/lib/utils";

/**
 * NEVER use process.cwd()/data here. That is the live vocabulary store.
 * Tests must use an isolated temp directory only.
 */
let testDataDir: string;

async function createIsolatedDataDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "gre-learn-piano-test-"));
}

describe("piano persistence integration", () => {
  beforeEach(async () => {
    testDataDir = await createIsolatedDataDir();
    const vocabRepo = new LocalVocabularyRepository({ dataDir: testDataDir });
    setVocabularyRepositoryForTests(vocabRepo);
    setPianoRepositoryForTests(
      createLocalPianoRepository({ dataDir: testDataDir, vocabRepo }),
    );
  });

  afterEach(async () => {
    setPianoRepositoryForTests(null);
    setVocabularyRepositoryForTests(null);
    await fs.rm(testDataDir, { recursive: true, force: true });
  });

  it("defaults missing piano keys and does not wipe vocabulary", async () => {
    const vocabRepo = new LocalVocabularyRepository({ dataDir: testDataDir });
    const entry: VocabularyEntry = {
      id: createId("vocab"),
      userId: "default-user",
      word: "pianotest",
      normalizedWord: "pianotest",
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

    await getOrCreatePianoProfile();
    await completeSessionBlock({ blockId: "scale_mode_lab" });

    const raw = JSON.parse(
      await fs.readFile(path.join(testDataDir, "store.json"), "utf8"),
    );
    expect(raw.vocabulary).toHaveLength(1);
    expect(Array.isArray(raw.pianoProfiles)).toBe(true);
    expect(Array.isArray(raw.pianoSessions)).toBe(true);
    expect(Array.isArray(raw.pianoSkillProgress)).toBe(true);
    expect(Array.isArray(raw.youtubeNotes)).toBe(true);
    expect(raw.pianoSessions.length).toBe(1);
    expect(raw.audioLessons ?? []).toEqual([]);
  });

  it("upserts session blocks and builds today plan", async () => {
    const plan1 = await getTodayPlan();
    expect(plan1.blocks).toHaveLength(5);
    expect(plan1.totalMinutes).toBe(60);

    const session = await completeSessionBlock({
      blockId: "gospel_core",
      skillIds: ["sk_gospel_514"],
      localDay: plan1.localDay,
    });
    expect(session.blocksCompleted.map((b) => b.blockId)).toContain(
      "gospel_core",
    );
    expect(session.durationMin).toBe(20);

    const plan2 = await getTodayPlan(
      new Date(`${plan1.localDay}T15:00:00.000Z`),
    );
    const gospel = plan2.blocks.find((b) => b.id === "gospel_core");
    expect(gospel?.completed).toBe(true);
  });

  it("creates and maps YouTube notes", async () => {
    const note = await createYoutubeNote({
      rawText:
        "Today we covered gospel 2-5-1 and rootless voicings. Practice the A form shells.",
      channelHint: "PianoGroove",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });
    expect(note.status).toBe("inbox");
    expect(note.contentHash.length).toBeGreaterThanOrEqual(8);
    expect(note.summary.length).toBeGreaterThan(0);
    expect(note.skillTagIds.length).toBeGreaterThan(0);

    const mapped = await mapNoteToPlan(note.id);
    expect(mapped.status).toBe("mapped");
    expect(mapped.mappedPhaseIndex).toBe(0);

    const plan = await getTodayPlan();
    expect(plan.notePrompts.some((n) => n.noteId === note.id)).toBe(true);
  });

  it("marks skills practiced", async () => {
    const progress = await markSkillPracticed("sk_number_system", {});
    expect(progress.status).toBe("practiced");
    expect(progress.timesPracticed).toBe(1);

    const again = await markSkillPracticed("sk_number_system", {});
    expect(again.timesPracticed).toBe(2);
    expect(again.id).toBe(progress.id);
  });
});
