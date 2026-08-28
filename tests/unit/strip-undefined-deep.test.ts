import { describe, expect, it } from "vitest";
import { stripUndefinedDeep } from "@/lib/utils";

describe("stripUndefinedDeep", () => {
  it("omits undefined keys nested in session-like payloads", () => {
    const input = {
      id: "s1",
      notes: undefined,
      blocksCompleted: [
        { blockId: "scale_mode_lab", completedAt: "2026-01-01T00:00:00.000Z", notes: undefined },
        { blockId: "gospel_core", completedAt: "2026-01-01T00:00:00.000Z", notes: "ok" },
      ],
    };
    expect(stripUndefinedDeep(input)).toEqual({
      id: "s1",
      blocksCompleted: [
        { blockId: "scale_mode_lab", completedAt: "2026-01-01T00:00:00.000Z" },
        { blockId: "gospel_core", completedAt: "2026-01-01T00:00:00.000Z", notes: "ok" },
      ],
    });
  });

  it("keeps null (Firestore-safe) while dropping undefined", () => {
    expect(stripUndefinedDeep({ a: null, b: undefined })).toEqual({ a: null });
  });
});
