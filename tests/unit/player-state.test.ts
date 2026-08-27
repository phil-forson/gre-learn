import { describe, expect, it } from "vitest";
import { initialPlayerState, playerReducer } from "@/features/audio/player/state";

describe("playerReducer segment loading", () => {
  it("bumps segmentLoadKey when queue is set even if first word id is unchanged", () => {
    const queue = [
      { id: "vocab_1", word: "Austere", isFavorite: false, pronunciation: null },
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

  it("sets shuffle true when queue mode is shuffle", () => {
    const next = playerReducer(initialPlayerState, {
      type: "SET_QUEUE",
      queue: [{ id: "a", word: "A", isFavorite: false, pronunciation: null }],
      mode: "shuffle",
    });
    expect(next.shuffle).toBe(true);
    expect(next.mode).toBe("shuffle");

    const alphabetical = playerReducer(next, {
      type: "SET_QUEUE",
      queue: [{ id: "a", word: "A", isFavorite: false, pronunciation: null }],
      mode: "all",
    });
    expect(alphabetical.shuffle).toBe(false);
    expect(alphabetical.mode).toBe("all");
  });

  it("bumps segmentLoadKey when moving to another queue position", () => {
    const queued = playerReducer(initialPlayerState, {
      type: "SET_QUEUE",
      queue: [
        { id: "a", word: "A", isFavorite: false, pronunciation: null },
        { id: "b", word: "B", isFavorite: true, pronunciation: null },
      ],
      mode: "all",
    });
    const next = playerReducer(queued, { type: "SET_POSITION", position: 1 });
    expect(next.currentVocabularyId).toBe("b");
    expect(next.segmentLoadKey).toBe(queued.segmentLoadKey + 1);
  });

  it("updates isFavorite on a queue item without resetting playback", () => {
    const queued = playerReducer(initialPlayerState, {
      type: "SET_QUEUE",
      queue: [
        { id: "a", word: "A", isFavorite: false, pronunciation: null },
        { id: "b", word: "B", isFavorite: false, pronunciation: null },
      ],
      mode: "all",
    });
    const playing = playerReducer(queued, { type: "PLAY" });
    const favorited = playerReducer(playing, {
      type: "SET_FAVORITE",
      id: "a",
      isFavorite: true,
    });
    expect(favorited.queue[0]?.isFavorite).toBe(true);
    expect(favorited.queue[1]?.isFavorite).toBe(false);
    expect(favorited.isPlaying).toBe(true);
    expect(favorited.segmentLoadKey).toBe(playing.segmentLoadKey);
    expect(favorited.currentVocabularyId).toBe("a");
  });

  it("resets segment index when narration fields change", () => {
    const withSegments = playerReducer(initialPlayerState, {
      type: "SET_SEGMENTS",
      segments: [
        {
          id: "s1",
          type: "word",
          text: "Austere.",
          order: 0,
          audioUrl: null,
        },
        {
          id: "s2",
          type: "spelling",
          text: "A.",
          order: 1,
          audioUrl: null,
        },
      ],
      useBrowserFallback: true,
    });
    const mid = playerReducer(withSegments, {
      type: "SET_SEGMENT_INDEX",
      index: 1,
    });
    expect(mid.currentSegmentIndex).toBe(1);

    const next = playerReducer(mid, {
      type: "SET_NARRATION_FIELDS",
      fields: { ...mid.narrationFields, spelling: false },
    });
    expect(next.currentSegmentIndex).toBe(0);
    expect(next.narrationFields.spelling).toBe(false);
    expect(next.segments).toHaveLength(2);
  });
});
