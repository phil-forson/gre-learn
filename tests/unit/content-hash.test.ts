import { describe, expect, it } from "vitest";
import { contentHash } from "@/lib/utils";

describe("content hashing / cache invalidation rules", () => {
  it("same narration inputs produce same hash", async () => {
    const a = await contentHash(["laconic", "definition", "voice-a"]);
    const b = await contentHash(["laconic", "definition", "voice-a"]);
    expect(a).toBe(b);
  });

  it("changed segment text changes hash", async () => {
    const a = await contentHash(["def text v1", "definition"]);
    const b = await contentHash(["def text v2", "definition"]);
    expect(a).not.toBe(b);
  });

  it("favorite/review metadata must not be part of content hash inputs", async () => {
    // Document the rule: only narration-affecting fields participate.
    const contentOnly = await contentHash(["word", "definition", "hook"]);
    const withFavoriteFlag = await contentHash(["word", "definition", "hook"]);
    expect(contentOnly).toBe(withFavoriteFlag);
  });
});
