import { describe, expect, it } from "vitest";
import { getPresentPerfectExperienceUnit } from "@/features/grammar/seed/present-perfect-experience";
import { getPresentPerfectResultUnit } from "@/features/grammar/seed/present-perfect-result";
import { buildGrammarLessonScript } from "@/features/grammar/services/lesson-script";
import type { PlayerSegment } from "@/features/learning/types";
import {
  knowledgeTestPassThreshold,
  scoreGrammarKnowledgeTest,
  scoreGrammarMicroTask,
} from "@/features/grammar/services/score";
import { AppError } from "@/lib/errors";

describe("buildGrammarLessonScript", () => {
  it("is deterministic and PlayerSegment-compatible", async () => {
    const unit = await getPresentPerfectExperienceUnit();
    const a = buildGrammarLessonScript(unit);
    const b = buildGrammarLessonScript(unit);

    expect(a.length).toBeGreaterThan(4);
    expect(a.map((s) => s.text)).toEqual(b.map((s) => s.text));
    expect(a.map((s) => s.type)).toEqual(b.map((s) => s.type));
    expect(a[0]?.type).toBe("title");
    expect(a.some((s) => s.type === "rule")).toBe(true);
    expect(a.some((s) => s.type === "example")).toBe(true);
    expect(a.at(-1)?.type).toBe("task_lead_in");

    const asPlayer: PlayerSegment[] = a.map((seg) => ({
      id: seg.id,
      type: seg.type,
      text: seg.text,
      order: seg.order,
      pauseAfterMs: seg.pauseAfterMs,
      audioUrl: null,
    }));
    expect(asPlayer.every((s) => typeof s.text === "string" && s.text.length)).toBe(
      true,
    );
    expect(asPlayer.map((s) => s.order)).toEqual(
      asPlayer.map((_, i) => i),
    );
  });

  it("scores micro-tasks without free-text AI", async () => {
    const unit = await getPresentPerfectExperienceUnit();
    const allCorrect = unit.microTask.items.map((item) => ({
      itemId: item.id,
      choiceId: item.correctChoiceId,
    }));
    const score = scoreGrammarMicroTask(unit, allCorrect);
    expect(score.passed).toBe(true);
    expect(score.correctCount).toBe(score.itemCount);

    const allWrong = unit.microTask.items.map((item) => {
      const wrong = item.choices.find((c) => c.id !== item.correctChoiceId)!;
      return { itemId: item.id, choiceId: wrong.id };
    });
    const failed = scoreGrammarMicroTask(unit, allWrong);
    expect(failed.passed).toBe(false);
    expect(failed.correctCount).toBe(0);
  });

  it("scores knowledge tests with ceil 80% pass threshold", async () => {
    const unit = await getPresentPerfectExperienceUnit();
    expect(unit.knowledgeTest).toBeDefined();
    const items = unit.knowledgeTest!.items;
    expect(items.length).toBeGreaterThanOrEqual(8);
    expect(items.length).toBeLessThanOrEqual(12);

    const threshold = knowledgeTestPassThreshold(items.length);
    expect(threshold).toBe(Math.ceil(items.length * 0.8));

    const allCorrect = items.map((item) => ({
      itemId: item.id,
      choiceId: item.correctChoiceId,
    }));
    const passed = scoreGrammarKnowledgeTest(unit, allCorrect);
    expect(passed.passed).toBe(true);
    expect(passed.passThreshold).toBe(threshold);

    const justBelow = items.map((item, index) => {
      if (index < threshold - 1) {
        return { itemId: item.id, choiceId: item.correctChoiceId };
      }
      const wrong = item.choices.find((c) => c.id !== item.correctChoiceId)!;
      return { itemId: item.id, choiceId: wrong.id };
    });
    const failed = scoreGrammarKnowledgeTest(unit, justBelow);
    expect(failed.correctCount).toBe(threshold - 1);
    expect(failed.passed).toBe(false);

    const atThreshold = items.map((item, index) => {
      if (index < threshold) {
        return { itemId: item.id, choiceId: item.correctChoiceId };
      }
      const wrong = item.choices.find((c) => c.id !== item.correctChoiceId)!;
      return { itemId: item.id, choiceId: wrong.id };
    });
    const edgePass = scoreGrammarKnowledgeTest(unit, atThreshold);
    expect(edgePass.correctCount).toBe(threshold);
    expect(edgePass.passed).toBe(true);
  });

  it("404s knowledge scoring when the unit has no knowledge test", async () => {
    const unit = await getPresentPerfectResultUnit();
    expect(unit.knowledgeTest).toBeUndefined();
    try {
      scoreGrammarKnowledgeTest(unit, [{ itemId: "x", choiceId: "a" }]);
      expect.unreachable("expected AppError");
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).status).toBe(404);
    }
  });
});
