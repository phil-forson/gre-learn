import { describe, expect, it } from "vitest";
import {
  buildFingeringDisplay,
  getMajorScaleFingering,
  MAJOR_SCALE_FINGERING_SOURCE,
  MAJOR_SCALE_FINGERINGS,
  splitHandPattern,
} from "@/features/piano/curriculum/scale-fingerings";
import { isLearningSource } from "@/lib/learning-source";
import { pickFocusKey } from "@/features/piano/services/lesson-detail";

/** One-octave ascending fingerings from pianoscales.org major scale charts. */
const PIANOSCALES_ONE_OCTAVE: Record<
  string,
  { rh: number[]; lh: number[] }
> = {
  C: { rh: [1, 2, 3, 1, 2, 3, 4, 5], lh: [5, 4, 3, 2, 1, 3, 2, 1] },
  G: { rh: [1, 2, 3, 1, 2, 3, 4, 5], lh: [5, 4, 3, 2, 1, 3, 2, 1] },
  D: { rh: [1, 2, 3, 1, 2, 3, 4, 5], lh: [5, 4, 3, 2, 1, 3, 2, 1] },
  A: { rh: [1, 2, 3, 1, 2, 3, 4, 5], lh: [5, 4, 3, 2, 1, 3, 2, 1] },
  E: { rh: [1, 2, 3, 1, 2, 3, 4, 5], lh: [5, 4, 3, 2, 1, 3, 2, 1] },
  B: { rh: [1, 2, 3, 1, 2, 3, 4, 5], lh: [4, 3, 2, 1, 4, 3, 2, 1] },
  "F#": { rh: [2, 3, 4, 1, 2, 3, 1, 2], lh: [4, 3, 2, 1, 3, 2, 1, 4] },
  Db: { rh: [2, 3, 1, 2, 3, 4, 1, 2], lh: [3, 2, 1, 4, 3, 2, 1, 3] },
  Ab: { rh: [3, 4, 1, 2, 3, 1, 2, 3], lh: [3, 2, 1, 4, 3, 2, 1, 3] },
  Eb: { rh: [3, 1, 2, 3, 4, 1, 2, 3], lh: [3, 2, 1, 4, 3, 2, 1, 3] },
  Bb: { rh: [2, 1, 2, 3, 1, 2, 3, 4], lh: [3, 2, 1, 4, 3, 2, 1, 3] },
  F: { rh: [1, 2, 3, 4, 1, 2, 3, 4], lh: [5, 4, 3, 2, 1, 3, 2, 1] },
};

describe("scale fingerings", () => {
  it("cites a verifiable online source", () => {
    expect(isLearningSource(MAJOR_SCALE_FINGERING_SOURCE)).toBe(true);
    expect(MAJOR_SCALE_FINGERING_SOURCE.url).toMatch(/^https:\/\//);
  });

  it("matches pianoscales.org for all 12 major keys", () => {
    for (const [key, expected] of Object.entries(PIANOSCALES_ONE_OCTAVE)) {
      const scale = getMajorScaleFingering(key);
      expect(scale, `${key} should exist`).not.toBeNull();
      expect(scale!.rightHandAscending).toEqual(expected.rh);
      expect(scale!.leftHandAscending).toEqual(expected.lh);
    }
    expect(Object.keys(MAJOR_SCALE_FINGERINGS)).toHaveLength(12);
  });

  it("B major uses CAGED right hand (1-2-3-1-2-3-4-5), not 2-1-2-3", () => {
    const b = getMajorScaleFingering("B")!;
    expect(b.rightHandAscending).toEqual([1, 2, 3, 1, 2, 3, 4, 5]);
    expect(b.leftHandAscending).toEqual([4, 3, 2, 1, 4, 3, 2, 1]);
    const display = buildFingeringDisplay("B")!;
    expect(display.rightHand.pattern).toBe("1-2-3 · 1-2-3-4-5");
    expect(display.leftHand.pattern).toBe("4-3-2-1 · 4-3-2-1");
  });

  it("groups thumb crossings readably", () => {
    expect(splitHandPattern([1, 2, 3, 1, 2, 3, 4, 5], "RH").map((g) =>
      g.join("-"),
    )).toEqual(["1-2-3", "1-2-3-4-5"]);
    expect(splitHandPattern([4, 3, 2, 1, 4, 3, 2, 1], "LH").map((g) =>
      g.join("-"),
    )).toEqual(["4-3-2-1", "4-3-2-1"]);
  });

  it("pickFocusKey prefers incomplete keys", () => {
    expect(pickFocusKey("2026-08-28", ["C", "G"])).not.toBe("C");
    expect(pickFocusKey("2026-08-28", ["C", "G"])).not.toBe("G");
  });
});
