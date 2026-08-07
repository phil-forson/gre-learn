import { describe, expect, it } from "vitest";
import {
  validateLearningContent,
  vocabularyLearningContentSchema,
} from "@/features/vocabulary/schemas/learning-content";
import { SEED_CONTENT } from "@/features/generation/seed-content";

describe("learning content schema", () => {
  it("accepts all seed content", () => {
    for (const content of Object.values(SEED_CONTENT)) {
      const result = validateLearningContent(content);
      expect(result.success, content.word).toBe(true);
    }
  });

  it("requires exactly one primary definition", () => {
    const base = structuredClone(SEED_CONTENT.laconic);
    base.definitions = [
      { text: "one", isPrimary: true },
      { text: "two", isPrimary: true },
    ];
    const result = vocabularyLearningContentSchema.safeParse(base);
    expect(result.success).toBe(false);
  });

  it("requires memory hook and example", () => {
    const base = structuredClone(SEED_CONTENT.laconic);
    base.memoryHook.text = "";
    expect(validateLearningContent(base).success).toBe(false);
  });
});
