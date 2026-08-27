import { describe, expect, it } from "vitest";
import { initialPlayerState, playerReducer } from "@/features/audio/player/state";

describe("playerReducer segment loading", () => {
  it("bumps segmentLoadKey when queue is set even if first word id is unchanged", () => {
    const queue = [
      { id: "vocab_1", word: "Austere", pronunciation: null },
    ];
    const once = playerReducer(initialPlayerState, {
      type: "SET_QUEUE",
      queue,
      mode: "shuffle",
    });
    expect(once.currentVocabularyId).toBe("vocab_1");
    expect(once.segmentLoadKey).toBe(1);
    expect(once.segments).toEqual([]);

    const withSegments = playerReducer(once, {
      type: "SET_SEGMENTS",
      segments: [
        {
          id: "s1",
          type: "word",
          text: "Austere.",
          order: 0,
          audioUrl: null,
        },
      ],
      useBrowserFallback: true,
    });
    expect(withSegments.segments).toHaveLength(1);

    // Reloading the same head word must clear segments and bump the key so the
    // player re-fetches audio (previously stuck with an empty lesson).
    const twice = playerReducer(withSegments, {
      type: "SET_QUEUE",
      queue,
      mode: "shuffle",
    });
    expect(twice.currentVocabularyId).toBe("vocab_1");
    expect(twice.segments).toEqual([]);
    expect(twice.segmentLoadKey).toBe(2);
  });

  it("bumps segmentLoadKey when moving to another queue position", () => {
    const queued = playerReducer(initialPlayerState, {
      type: "SET_QUEUE",
      queue: [
        { id: "a", word: "A", pronunciation: null },
        { id: "b", word: "B", pronunciation: null },
      ],
      mode: "all",
    });
    const next = playerReducer(queued, { type: "SET_POSITION", position: 1 });
    expect(next.currentVocabularyId).toBe("b");
    expect(next.segmentLoadKey).toBe(queued.segmentLoadKey + 1);
  });
});
