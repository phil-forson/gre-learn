import { describe, expect, it } from "vitest";
import { getPlacementBank } from "@/features/path/placement/bank";
import { scorePlacement } from "@/features/path/placement/score";
import type { PlacementAnswer } from "@/features/path/types";

function allCorrect(): PlacementAnswer[] {
  return getPlacementBank().map((item) => ({
    itemId: item.id,
    choiceId: item.correctChoiceId,
  }));
}

function allWrong(): PlacementAnswer[] {
  return getPlacementBank().map((item) => {
    const wrong = item.choices.find((c) => c.id !== item.correctChoiceId)!;
    return { itemId: item.id, choiceId: wrong.id };
  });
}

function correctThroughBand(maxBandIndex: number): PlacementAnswer[] {
  const bands = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
  const allowed = new Set(bands.slice(0, maxBandIndex + 1));
  return getPlacementBank().map((item) => {
    if (allowed.has(item.band)) {
      return { itemId: item.id, choiceId: item.correctChoiceId };
    }
    const wrong = item.choices.find((c) => c.id !== item.correctChoiceId)!;
    return { itemId: item.id, choiceId: wrong.id };
  });
}

describe("placement scorer", () => {
  it("has 12–18 AmE bank items", () => {
    const bank = getPlacementBank();
    expect(bank.length).toBeGreaterThanOrEqual(12);
    expect(bank.length).toBeLessThanOrEqual(18);
  });

  it("recommends a high level when all answers are correct", () => {
    const result = scorePlacement(allCorrect());
    expect(result.method).toBe("rules");
    expect(result.correctCount).toBe(result.itemCount);
    expect(["B2", "C1", "C2"]).toContain(result.recommendedLevel);
    expect(result.skippedUnitIds).toEqual([]);
  });

  it("recommends A1 when all answers are wrong", () => {
    const result = scorePlacement(allWrong());
    expect(result.correctCount).toBe(0);
    expect(result.recommendedLevel).toBe("A1");
  });

  it("is stable for a mid-band fixture", () => {
    const answers = correctThroughBand(2); // A1–B1 correct
    const a = scorePlacement(answers);
    const b = scorePlacement(answers);
    expect(a.recommendedLevel).toBe(b.recommendedLevel);
    expect(a.correctCount).toBe(b.correctCount);
    expect(["A2", "B1", "B2"]).toContain(a.recommendedLevel);
  });

  it("rejects unknown item ids and empty answers", () => {
    expect(() => scorePlacement([])).toThrow();
    expect(() =>
      scorePlacement([{ itemId: "nope", choiceId: "a" }]),
    ).toThrow();
    expect(() =>
      scorePlacement([
        {
          itemId: getPlacementBank()[0]!.id,
          choiceId: "not-a-real-choice",
        },
      ]),
    ).toThrow();
  });
});
