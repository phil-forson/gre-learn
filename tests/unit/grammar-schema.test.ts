import { describe, expect, it } from "vitest";
import {
  getPresentPerfectExperienceUnit,
  grammarUnitHashParts,
} from "@/features/grammar/seed/present-perfect-experience";
import { toPublicGrammarUnit } from "@/features/grammar/catalog";
import {
  generateGrammarAudioSchema,
  submitGrammarMicroTaskSchema,
  validateGrammarAudioLesson,
  validateGrammarProgress,
  validateGrammarUnit,
} from "@/features/grammar/schemas/unit";
import { contentHash } from "@/lib/utils";
import { LEARNING_LOCALE } from "@/features/learning/types";

describe("grammar schema + seed", () => {
  it("parses the Present Perfect seed and keeps a stable contentHash", async () => {
    const unit = await getPresentPerfectExperienceUnit();
    expect(unit.id).toBe("present-perfect-experience");
    expect(unit.cefrBand).toBe("A2");
    expect(unit.locale).toBe(LEARNING_LOCALE);
    expect(unit.microTask.items.length).toBeGreaterThanOrEqual(3);
    expect(unit.microTask.items.length).toBeLessThanOrEqual(5);

    const again = await getPresentPerfectExperienceUnit();
    expect(again.contentHash).toBe(unit.contentHash);

    const recomputed = await contentHash(grammarUnitHashParts(unit));
    expect(recomputed).toBe(unit.contentHash);
    expect(validateGrammarUnit(unit).success).toBe(true);
  });

  it("never leaks correctChoiceId on public DTOs", async () => {
    const unit = await getPresentPerfectExperienceUnit();
    const pub = toPublicGrammarUnit(unit);
    const json = JSON.stringify(pub);
    expect(json).not.toContain("correctChoiceId");
    for (const item of pub.microTask.items) {
      expect(
        Object.prototype.hasOwnProperty.call(item, "correctChoiceId"),
      ).toBe(false);
    }
    expect(unit.microTask.items[0]!.correctChoiceId).toBeTruthy();
    expect(unit.knowledgeTest).toBeDefined();
    expect(pub.knowledgeTest).toBeDefined();
    for (const item of pub.knowledgeTest!.items) {
      expect(
        Object.prototype.hasOwnProperty.call(item, "correctChoiceId"),
      ).toBe(false);
    }
  });

  it("defaults knowledgeTestPassed when omitted on progress", () => {
    const parsed = validateGrammarProgress({
      id: "gprog_1",
      userId: "u1",
      unitId: "present-perfect-experience",
      status: "completed",
      microTaskPassed: true,
      lastPlayedAt: null,
      reviewCount: 1,
      contentHash: "abcdefgh",
      dateUpdated: "2026-01-01T00:00:00.000Z",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.knowledgeTestPassed).toBe(false);
    }
  });

  it("rejects units with mismatched correctChoiceId", () => {
    const bad = {
      id: "x",
      slug: "x",
      title: "X",
      cefrBand: "A2",
      locale: LEARNING_LOCALE,
      strandTags: ["language-focused learning"],
      contentVersion: 1,
      contentHash: "abcdefgh",
      form: {
        focus: "f",
        ruleSummary: "r",
        patterns: ["p"],
        examples: [{ id: "e1", sentence: "S." }],
      },
      microTask: {
        id: "mt",
        prompt: "Choose",
        items: [
          {
            id: "i1",
            kind: "mcq",
            prompt: "?",
            choices: [
              { id: "a", text: "A" },
              { id: "b", text: "B" },
            ],
            correctChoiceId: "z",
          },
          {
            id: "i2",
            kind: "mcq",
            prompt: "?",
            choices: [
              { id: "a", text: "A" },
              { id: "b", text: "B" },
            ],
            correctChoiceId: "a",
          },
          {
            id: "i3",
            kind: "mcq",
            prompt: "?",
            choices: [
              { id: "a", text: "A" },
              { id: "b", text: "B" },
            ],
            correctChoiceId: "b",
          },
        ],
      },
    };
    expect(validateGrammarUnit(bad).success).toBe(false);
  });

  it("validates grammar progress and audio lesson shapes", () => {
    expect(
      validateGrammarProgress({
        id: "gprog_1",
        userId: "u1",
        unitId: "present-perfect-experience",
        status: "completed",
        microTaskPassed: true,
        knowledgeTestPassed: true,
        lastPlayedAt: null,
        reviewCount: 1,
        contentHash: "abcdefgh",
        dateUpdated: "2026-01-01T00:00:00.000Z",
      }).success,
    ).toBe(true);

    expect(
      validateGrammarAudioLesson({
        id: "gl_1",
        userId: "u1",
        grammarUnitId: "present-perfect-experience",
        contentHash: "abcdefgh",
        voice: "alloy",
        status: "ready",
        createdAt: "2026-01-01T00:00:00.000Z",
        segments: [
          {
            id: "s1",
            audioLessonId: "gl_1",
            grammarUnitId: "present-perfect-experience",
            segmentKey: "title",
            segmentType: "title",
            order: 0,
            text: "Title",
            audioUrlOrStorageKey: null,
            durationMs: null,
            contentHash: "abcdefgh",
            status: "pending",
            error: null,
          },
        ],
      }).success,
    ).toBe(true);

    expect(
      validateGrammarAudioLesson({
        id: "gl_1",
        userId: "u1",
        grammarUnitId: "x",
        contentHash: "abcdefgh",
        voice: "alloy",
        status: "ready",
        createdAt: "2026-01-01T00:00:00.000Z",
        segments: [
          {
            id: "s1",
            audioLessonId: "gl_1",
            grammarUnitId: "x",
            segmentKey: "title",
            segmentType: "definition",
            order: 0,
            text: "Title",
            audioUrlOrStorageKey: null,
            durationMs: null,
            contentHash: "abcdefgh",
            status: "pending",
            error: null,
          },
        ],
      }).success,
    ).toBe(false);
  });
});
