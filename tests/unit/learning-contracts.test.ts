import { describe, expect, it, expectTypeOf } from "vitest";
import { buildAudioLessonScript } from "@/features/audio/services/lesson-script";
import { SEED_CONTENT } from "@/features/generation/seed-content";
import {
  LEARNING_LOCALE,
  type ContentSourceRef,
  type ContentSourceType,
  type LessonSegment,
  type PlayerSegment,
  type ReviewQueueItem,
} from "@/features/learning/types";
import {
  buildReviewQueue,
  vocabularyEntryToReviewQueueItem,
  vocabularyEntriesToReviewQueueItems,
} from "@/features/review/services/queue";
import type { AudioLessonSegment, VocabularyEntry } from "@/features/vocabulary/types";

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
    groupId: null,
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

describe("learning engine contracts (Phase 0)", () => {
  it("uses American English locale only", () => {
    expect(LEARNING_LOCALE).toBe("en-US");
  });

  it("describes non-vocab content sources without breaking the union", () => {
    const grammarRef: ContentSourceRef = { type: "grammar", id: "g1" };
    const sentenceRef: ContentSourceRef = { type: "sentence", id: "s1" };
    const types: ContentSourceType[] = [
      "vocabulary",
      grammarRef.type,
      sentenceRef.type,
    ];
    expect(types).toEqual(["vocabulary", "grammar", "sentence"]);
  });

  it("buildAudioLessonScript output satisfies LessonSegment / PlayerSegment", () => {
    const script = buildAudioLessonScript(SEED_CONTENT.obdurate);
    expectTypeOf(script).toEqualTypeOf<AudioLessonSegment[]>();

    const asLesson: LessonSegment[] = script;
    expect(asLesson.every((s) => typeof s.id === "string")).toBe(true);
    expect(asLesson.every((s) => typeof s.type === "string")).toBe(true);
    expect(asLesson.every((s) => typeof s.text === "string")).toBe(true);
    expect(asLesson.every((s) => typeof s.order === "number")).toBe(true);

    const hydrated: PlayerSegment[] = script.map((s) => ({
      id: s.id,
      type: s.type,
      text: s.text,
      order: s.order,
      pauseAfterMs: s.pauseAfterMs,
      audioUrl: null,
    }));
    expect(hydrated).toHaveLength(script.length);
    expect(hydrated[0]).toMatchObject({
      type: "word",
      audioUrl: null,
    });
  });

  it("maps VocabularyEntry → ReviewQueueItem while queue API stays vocab-shaped", () => {
    const ready = entry("1", "laconic");
    const failed = entry("2", "obdurate", {
      status: "generation_failed",
      content: null,
    });

    const item = vocabularyEntryToReviewQueueItem(ready);
    expect(item).toEqual(
      expect.objectContaining({
        sourceType: "vocabulary",
        sourceId: "1",
        title: ready.word,
        eligible: true,
        isFavorite: false,
      } satisfies Partial<ReviewQueueItem>),
    );
    expect(item.subtitle).toContain("using very few words");

    expect(vocabularyEntryToReviewQueueItem(failed).eligible).toBe(false);

    const vocabQueue = buildReviewQueue([ready, failed], "all");
    expect(vocabQueue).toHaveLength(1);
    expect(vocabQueue[0]).toMatchObject({ id: "1", word: ready.word });

    const shared = vocabularyEntriesToReviewQueueItems(vocabQueue);
    expect(shared).toEqual([
      expect.objectContaining({
        sourceType: "vocabulary",
        sourceId: "1",
        title: ready.word,
        eligible: true,
      }),
    ]);
  });

  it("allows a ReviewQueueItem from a future non-vocab source", () => {
    const grammarItem: ReviewQueueItem = {
      sourceType: "grammar",
      sourceId: "clause-agreement-1",
      title: "Subject–verb agreement",
      subtitle: "Match singular subjects with singular verbs",
      isFavorite: false,
      dateAdded: "2026-08-27T00:00:00.000Z",
      lastReviewedAt: null,
      reviewCount: 0,
      eligible: true,
    };
    expect(grammarItem.sourceType).not.toBe("vocabulary");
    expect(grammarItem.sourceId).toBeTruthy();
  });
});
