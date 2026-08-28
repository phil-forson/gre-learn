import { describe, expect, it } from "vitest";
import { getSentenceCombiningClarityUnit } from "@/features/sentence/seed/sentence-combining-clarity";
import { sentenceUnitHashParts } from "@/features/sentence/seed/hash";
import { toPublicSentenceUnit } from "@/features/sentence/catalog";
import {
  submitSentenceMicroTaskSchema,
  validateSentenceProgress,
  validateSentenceUnit,
} from "@/features/sentence/schemas/unit";
import { contentHash } from "@/lib/utils";
import { LEARNING_LOCALE } from "@/features/learning/types";
import { listSentenceUnits } from "@/features/sentence/catalog";

describe("sentence schema + seed", () => {
  it("parses MVP unit 1 and keeps a stable contentHash", async () => {
    const unit = await getSentenceCombiningClarityUnit();
    expect(unit.id).toBe("sentence-combining-clarity");
    expect(unit.cefrBand).toBe("B1");
    expect(unit.locale).toBe(LEARNING_LOCALE);
    expect(unit.microTask.items.length).toBeGreaterThanOrEqual(3);

    const again = await getSentenceCombiningClarityUnit();
    expect(again.contentHash).toBe(unit.contentHash);
    const recomputed = await contentHash(sentenceUnitHashParts(unit));
    expect(recomputed).toBe(unit.contentHash);
    expect(validateSentenceUnit(unit).success).toBe(true);
  });

  it("loads five seeded units and never leaks correctChoiceId publicly", async () => {
    const units = await listSentenceUnits();
    expect(units).toHaveLength(5);
    for (const unit of units) {
      const pub = toPublicSentenceUnit(unit);
      expect(JSON.stringify(pub)).not.toContain("correctChoiceId");
      expect(unit.microTask.items[0]!.correctChoiceId).toBeTruthy();
    }
  });

  it("defaults knowledgeTestPassed when omitted on progress", () => {
    const parsed = validateSentenceProgress({
      id: "sprog_1",
      userId: "u1",
      unitId: "sentence-combining-clarity",
      status: "completed",
      microTaskPassed: true,
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
      submitSentenceMicroTaskSchema.safeParse({
        answers: [{ itemId: "mt1", choiceId: "a" }],
      }).success,
    ).toBe(true);
  });
});
