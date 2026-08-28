import { describe, expect, it } from "vitest";
import {
  SENTENCE_CURRICULUM,
  SPEAKING_CURRICULUM,
  isMoreThanOneBandBelow,
} from "@/features/path/curriculum";
import { SKILL_TRACKS } from "@/features/path/catalog";

describe("path curriculum maps", () => {
  it("maps 10 speaking + 10 sentence units with MVP 1–5 seeded", () => {
    expect(SPEAKING_CURRICULUM).toHaveLength(10);
    expect(SENTENCE_CURRICULUM).toHaveLength(10);
    expect(SPEAKING_CURRICULUM.filter((u) => u.seeded)).toHaveLength(5);
    expect(SENTENCE_CURRICULUM.filter((u) => u.seeded)).toHaveLength(5);
    expect(SPEAKING_CURRICULUM[0]!.id).toBe("spoken-short-turns");
    expect(SENTENCE_CURRICULUM[0]!.id).toBe("sentence-combining-clarity");
  });

  it("treats more-than-one-band-below correctly for sentence continue", () => {
    // B2 profile: one below = B1 (keep); more than one = A2/A1 (skip)
    expect(isMoreThanOneBandBelow("A1", "B2")).toBe(true);
    expect(isMoreThanOneBandBelow("A2", "B2")).toBe(true);
    expect(isMoreThanOneBandBelow("B1", "B2")).toBe(false);
    expect(isMoreThanOneBandBelow("B2", "B2")).toBe(false);
    expect(isMoreThanOneBandBelow("B1", "C1")).toBe(true);
    expect(isMoreThanOneBandBelow("B2", "C1")).toBe(false);
  });

  it("flips sentence and speaking tracks to live", () => {
    expect(SKILL_TRACKS.find((t) => t.id === "sentence")?.status).toBe("live");
    expect(SKILL_TRACKS.find((t) => t.id === "speaking")?.status).toBe("live");
  });
});
