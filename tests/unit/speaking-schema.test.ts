import { describe, expect, it } from "vitest";
import { getSpokenShortTurnsUnit } from "@/features/speaking/seed/spoken-short-turns";
import { speakingUnitHashParts } from "@/features/speaking/seed/hash";
import {
  listSpeakingUnits,
  toPublicSpeakingUnit,
} from "@/features/speaking/catalog";
import {
  submitSpeakingMicroTaskSchema,
  validateSpeakingProgress,
  validateSpeakingUnit,
} from "@/features/speaking/schemas/unit";
import { buildSpeakingLessonScript } from "@/features/speaking/services/lesson-script";
import { contentHash } from "@/lib/utils";
import { LEARNING_LOCALE } from "@/features/learning/types";

describe("speaking schema + seed", () => {
  it("parses MVP unit 1 and keeps a stable contentHash", async () => {
    const unit = await getSpokenShortTurnsUnit();
    expect(unit.id).toBe("spoken-short-turns");
    expect(unit.cefrBand).toBe("A2");
    expect(unit.locale).toBe(LEARNING_LOCALE);
    expect(unit.microTask.items.length).toBeGreaterThanOrEqual(3);

    const again = await getSpokenShortTurnsUnit();
    expect(again.contentHash).toBe(unit.contentHash);
    const recomputed = await contentHash(speakingUnitHashParts(unit));
    expect(recomputed).toBe(unit.contentHash);
    expect(validateSpeakingUnit(unit).success).toBe(true);
  });

  it("builds a deterministic audio script for speaking MVP", async () => {
    const unit = await getSpokenShortTurnsUnit();
    const script = buildSpeakingLessonScript(unit);
    expect(script.length).toBeGreaterThan(3);
    expect(script[0]!.type).toBe("title");
    expect(script.map((s) => s.order)).toEqual(
      script.map((_, i) => i),
    );
  });

  it("loads five seeded units and never leaks correctChoiceId publicly", async () => {
    const units = await listSpeakingUnits();
    expect(units).toHaveLength(5);
    for (const unit of units) {
      const pub = toPublicSpeakingUnit(unit);
      expect(JSON.stringify(pub)).not.toContain("correctChoiceId");
      expect(unit.microTask.items[0]!.correctChoiceId).toBeTruthy();
    }
  });

  it("defaults knowledgeTestPassed when omitted on progress", () => {
    const parsed = validateSpeakingProgress({
      id: "spkprog_1",
      userId: "u1",
      unitId: "spoken-short-turns",
      status: "in_progress",
      microTaskPassed: false,
      lastPlayedAt: null,
      reviewCount: 0,
      contentHash: "hashhash",
      dateUpdated: "2026-01-01T00:00:00.000Z",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.knowledgeTestPassed).toBe(false);
    }
  });

  it("validates micro-task submit payload shape", () => {
    expect(
      submitSpeakingMicroTaskSchema.safeParse({
        answers: [{ itemId: "mt1", choiceId: "a" }],
      }).success,
    ).toBe(true);
  });
});
