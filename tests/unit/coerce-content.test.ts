import { describe, expect, it } from "vitest";
import { coerceLearningContent } from "@/features/generation/services/coerce-content";
import {
  formatLearningContentErrors,
  validateLearningContent,
} from "@/features/vocabulary/schemas/learning-content";

describe("coerceLearningContent", () => {
  it("normalizes common messy AI shapes into valid content", () => {
    const coerced = coerceLearningContent(
      {
        word: "Pellucid",
        partOfSpeech: "adjective",
        pronunciation: { simple: "puh-LOO-sid", confidence: "HIGH" },
        definitions: [{ text: "transparently clear", isPrimary: true }],
        etymology: {
          summary: "From Latin pellucidus (through + light).",
          isUsefulForRootLearning: true,
          components: [
            {
              text: "lucid",
              type: "root",
              meaning: "light/clear",
              explanation: "shared with lucid",
              relatedWords: "lucid, translucent",
              confidence: "high",
            },
          ],
        },
        memoryHook: "Clear pool water — pellucid prose",
        synonyms: ["limpid", { word: "transparent" }],
        antonyms: ["opaque"],
        exampleSentences: ["Her pellucid argument clarified the theory."],
        wordFamily: ["pellucidity"],
      },
      "Pellucid",
      "pellucid",
    );

    const result = validateLearningContent(coerced);
    if (!result.success) {
      throw new Error(formatLearningContentErrors(result.error));
    }
    expect(result.data.normalizedWord).toBe("pellucid");
    expect(result.data.synonyms[0]?.word).toBe("limpid");
    expect(result.data.definitions.filter((d) => d.isPrimary)).toHaveLength(1);
    expect(result.data.memoryHook.text.length).toBeGreaterThan(5);
  });

  it("fills missing fields rather than failing hard", () => {
    const coerced = coerceLearningContent({ word: "X" }, "Test", "test");
    const result = validateLearningContent(coerced);
    expect(result.success).toBe(true);
  });
});

describe("formatLearningContentErrors", () => {
  it("includes field paths", () => {
    const result = validateLearningContent({ word: "x" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = formatLearningContentErrors(result.error);
      expect(msg).toMatch(/:/);
      expect(msg.toLowerCase()).not.toBe("invalid input; invalid input");
    }
  });
});
