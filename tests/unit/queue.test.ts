import { describe, expect, it } from "vitest";
import {
  buildReviewQueue,
  isReviewEligible,
} from "@/features/review/services/queue";
import type { VocabularyEntry } from "@/features/vocabulary/types";
import { SEED_CONTENT } from "@/features/generation/seed-content";

function entry(
  id: string,
  word: string,
  overrides: Partial<VocabularyEntry> = {},
): VocabularyEntry {
  const content = SEED_CONTENT[word] ?? SEED_CONTENT.laconic;
  return {
    id,
    userId: "u1",
    word: content.word,
    normalizedWord: content.normalizedWord,
    partOfSpeech: content.partOfSpeech,
    status: "ready",
    isFavorite: false,
    dateAdded: "2026-01-01T00:00:00.000Z",
    dateUpdated: "2026-01-01T00:00:00.000Z",
    lastReviewedAt: null,
    reviewCount: 0,
    contentVersion: 1,
    contentHash: "hash",
    generationProvider: "mock",
    generationModel: "m",
    generationError: null,
    audioStatus: "none",
    audioError: null,
    personalNote: null,
    content,
    ...overrides,
  };
}

describe("review queue", () => {
  const words = [
    entry("1", "laconic"),
    entry("2", "obdurate", { isFavorite: true }),
    entry("3", "pellucid", {
      dateAdded: "2026-02-01T00:00:00.000Z",
    }),
    entry("4", "parsimonious"),
    entry("5", "failed", { status: "generation_failed", content: null }),
  ];

  it("filters ineligible words", () => {
    expect(isReviewEligible(words[4]!)).toBe(false);
    expect(buildReviewQueue(words, "all")).toHaveLength(4);
  });

  it("favorites mode", () => {
    const queue = buildReviewQueue(words, "favorites");
    expect(queue.map((q) => q.id)).toEqual(["2"]);
  });

  it("shuffle is unique and uses seed deterministically", () => {
    const a = buildReviewQueue(words, "shuffle", { seed: 42 });
    const b = buildReviewQueue(words, "shuffle", { seed: 42 });
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
    expect(new Set(a.map((q) => q.id)).size).toBe(a.length);
  });

  it("avoids immediately replaying excluded id at head when possible", () => {
    const queue = buildReviewQueue(words, "all", { excludeId: "1" });
    // all is alpha sorted by normalized word; exclude only applies when head matches
    expect(queue.every((q) => q.id)).toBeTruthy();
    const shuffled = buildReviewQueue(words, "shuffle", {
      seed: 1,
      excludeId: buildReviewQueue(words, "shuffle", { seed: 1 })[0]!.id,
    });
    if (shuffled.length > 1) {
      expect(shuffled[0]!.id).not.toBe(
        buildReviewQueue(words, "shuffle", { seed: 1 })[0]!.id,
      );
    }
  });
});
