import { describe, expect, it } from "vitest";
import { SKILL_TRACKS, isSkillTrackId, isCefrLevel } from "@/features/path/catalog";
import {
  learningProfileSchema,
  patchLearningProfileSchema,
} from "@/features/path/schemas/profile";
import { placementResultSchema } from "@/features/path/schemas/placement";
import { LEARNING_LOCALE } from "@/features/learning/types";

describe("path schemas + catalog", () => {
  it("lists three Path tracks all live; vocabulary not catalogued", () => {
    expect(SKILL_TRACKS).toHaveLength(3);
    expect(SKILL_TRACKS.find((t) => t.id === "vocabulary")).toBeUndefined();
    expect(SKILL_TRACKS.every((t) => t.status === "live")).toBe(true);
    expect(SKILL_TRACKS.map((t) => t.id).sort()).toEqual(
      ["grammar", "sentence", "speaking"].sort(),
    );
    // Legacy id still valid for schema / isSkillTrackId
    expect(isSkillTrackId("vocabulary")).toBe(true);
  });

  it("still accepts legacy vocabulary activeTrackId in schema", () => {
    const ok = learningProfileSchema.safeParse({
      id: "p1",
      userId: "u1",
      locale: LEARNING_LOCALE,
      cefrLevel: "B1",
      pathMode: "standard",
      activeTrackId: "vocabulary",
      placementStatus: "skipped",
      lastPlacementAt: null,
      lastPlacement: null,
      continueHint: null,
      dateCreated: "2026-01-01T00:00:00.000Z",
      dateUpdated: "2026-01-01T00:00:00.000Z",
    });
    expect(ok.success).toBe(true);
  });

  it("rejects bad CEFR levels and track ids", () => {
    expect(isCefrLevel("B1")).toBe(true);
    expect(isCefrLevel("B3")).toBe(false);
    expect(isSkillTrackId("grammar")).toBe(true);
    expect(isSkillTrackId("listening")).toBe(false);

    const bad = learningProfileSchema.safeParse({
      id: "p1",
      userId: "u1",
      locale: LEARNING_LOCALE,
      cefrLevel: "B3",
      pathMode: "standard",
      activeTrackId: "vocabulary",
      placementStatus: "not_started",
      lastPlacementAt: null,
      lastPlacement: null,
      continueHint: null,
      dateCreated: "2026-01-01T00:00:00.000Z",
      dateUpdated: "2026-01-01T00:00:00.000Z",
    });
    expect(bad.success).toBe(false);
  });

  it("PATCH allowlist is strict", () => {
    expect(
      patchLearningProfileSchema.safeParse({ cefrLevel: "B2" }).success,
    ).toBe(true);
    expect(
      patchLearningProfileSchema.safeParse({ placementStatus: "completed" })
        .success,
    ).toBe(false);
    expect(
      patchLearningProfileSchema.safeParse({ userId: "other" }).success,
    ).toBe(false);
  });

  it("rejects placement results with bad method or level", () => {
    const base = {
      recommendedLevel: "B1",
      correctCount: 10,
      itemCount: 15,
      scoresByBand: {
        A1: { correct: 3, total: 3 },
        A2: { correct: 3, total: 3 },
        B1: { correct: 2, total: 3 },
        B2: { correct: 2, total: 3 },
        C1: { correct: 0, total: 3 },
        C2: { correct: 0, total: 0 },
      },
      method: "rules",
      skippedUnitIds: [],
      answeredAt: "2026-01-01T00:00:00.000Z",
    };
    expect(placementResultSchema.safeParse(base).success).toBe(true);
    expect(
      placementResultSchema.safeParse({ ...base, method: "openai" }).success,
    ).toBe(false);
    expect(
      placementResultSchema.safeParse({ ...base, recommendedLevel: "Z9" })
        .success,
    ).toBe(false);
  });
});
