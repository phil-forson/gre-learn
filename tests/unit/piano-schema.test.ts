import { describe, expect, it } from "vitest";
import {
  pianoProfileSchema,
  patchPianoProfileSchema,
} from "@/features/piano/schemas/profile";
import {
  completeSessionBlockSchema,
  pianoSkillProgressSchema,
  practiceSessionSchema,
} from "@/features/piano/schemas/session";
import {
  createYoutubeNoteSchema,
  patchYoutubeNoteSchema,
  youtubeNoteSchema,
} from "@/features/piano/schemas/note";

describe("piano schemas", () => {
  it("accepts a valid profile", () => {
    const parsed = pianoProfileSchema.safeParse({
      id: "p1",
      userId: "u1",
      activePhaseIndex: 0,
      templateId: "piano-60",
      remindersEnabled: true,
      timezone: "UTC",
      dateCreated: "2026-01-01T00:00:00.000Z",
      dateUpdated: "2026-01-01T00:00:00.000Z",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid phase index on patch", () => {
    expect(
      patchPianoProfileSchema.safeParse({ activePhaseIndex: 9 }).success,
    ).toBe(false);
  });

  it("validates practice session and block completion", () => {
    expect(
      practiceSessionSchema.safeParse({
        id: "s1",
        userId: "u1",
        localDay: "2026-08-28",
        templateId: "piano-60",
        blocksCompleted: [
          { blockId: "gospel_core", completedAt: "2026-08-28T12:00:00.000Z" },
        ],
        skillIdsTouched: ["sk_number_system"],
        sourceNoteIds: [],
        durationMin: 20,
        dateCreated: "2026-08-28T12:00:00.000Z",
        dateUpdated: "2026-08-28T12:00:00.000Z",
      }).success,
    ).toBe(true);

    expect(
      completeSessionBlockSchema.safeParse({ blockId: "scale_mode_lab" })
        .success,
    ).toBe(true);
  });

  it("validates skill progress", () => {
    expect(
      pianoSkillProgressSchema.safeParse({
        id: "sp1",
        userId: "u1",
        skillId: "sk_number_system",
        status: "practiced",
        timesPracticed: 1,
        lastPracticedAt: "2026-08-28T12:00:00.000Z",
        dateCreated: "2026-08-28T12:00:00.000Z",
        dateUpdated: "2026-08-28T12:00:00.000Z",
      }).success,
    ).toBe(true);
  });

  it("caps note rawText and validates URL", () => {
    expect(
      createYoutubeNoteSchema.safeParse({
        rawText: "a".repeat(20_001),
      }).success,
    ).toBe(false);

    expect(
      createYoutubeNoteSchema.safeParse({
        rawText: "Gospel 2-5-1 walkup notes",
        url: "https://www.youtube.com/watch?v=abcdefghijk",
      }).success,
    ).toBe(true);

    expect(
      createYoutubeNoteSchema.safeParse({
        url: "https://www.youtube.com/watch?v=abcdefghijk",
      }).success,
    ).toBe(true);

    expect(
      createYoutubeNoteSchema.safeParse({}).success,
    ).toBe(false);

    expect(
      createYoutubeNoteSchema.safeParse({
        rawText: "notes",
        url: "ftp://bad.example/video",
      }).success,
    ).toBe(false);

    expect(
      createYoutubeNoteSchema.safeParse({
        url: "https://example.com/not-youtube",
      }).success,
    ).toBe(false);

    expect(
      youtubeNoteSchema.safeParse({
        id: "n1",
        userId: "u1",
        rawText: "rootless voicings",
        summary: "Rootless voicings notes",
        skillTagIds: ["sk_rootless_ab"],
        practicePrompts: ["Practice A/B forms"],
        status: "inbox",
        contentHash: "abcdef0123456789",
        dateCreated: "2026-08-28T12:00:00.000Z",
        dateUpdated: "2026-08-28T12:00:00.000Z",
      }).success,
    ).toBe(true);

    expect(
      patchYoutubeNoteSchema.safeParse({ action: "map" }).success,
    ).toBe(true);
  });
});
