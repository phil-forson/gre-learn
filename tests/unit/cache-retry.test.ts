import { describe, expect, it } from "vitest";
import {
  hasCachedLearningContent,
  shouldRetryGeneration,
} from "@/features/generation/services/generate-cached";
import type { VocabularyEntry } from "@/features/vocabulary/types";
import { SEED_CONTENT } from "@/features/generation/seed-content";

function base(
  overrides: Partial<VocabularyEntry> = {},
): VocabularyEntry {
  return {
    id: "1",
    userId: "u",
    word: "Laconic",
    normalizedWord: "laconic",
    partOfSpeech: ["adjective"],
    status: "ready",
    isFavorite: false,
    dateAdded: new Date().toISOString(),
    dateUpdated: new Date().toISOString(),
    lastReviewedAt: null,
    reviewCount: 0,
    contentVersion: 1,
    contentHash: "h",
    generationProvider: "openai",
    generationModel: "gpt-4o",
    generationError: null,
    audioStatus: "none",
    audioError: null,
    personalNote: null,
    content: SEED_CONTENT.laconic,
    ...overrides,
  };
}

describe("generation cache / retry policy", () => {
  it("treats ready content as cache hit", () => {
    expect(hasCachedLearningContent(base())).toBe(true);
    expect(shouldRetryGeneration(base())).toBe(false);
  });

  it("retries failed generation on re-add", () => {
    const failed = base({
      status: "generation_failed",
      content: null,
      generationError: "failed",
      contentVersion: 0,
    });
    expect(hasCachedLearningContent(failed)).toBe(false);
    expect(shouldRetryGeneration(failed)).toBe(true);
  });

  it("does not treat incomplete content as cache", () => {
    const incomplete = base({
      status: "generating",
      content: null,
    });
    expect(shouldRetryGeneration(incomplete)).toBe(true);
  });
});
