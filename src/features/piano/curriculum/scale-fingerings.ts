import { CIRCLE_OF_FIFTHS_KEYS } from "@/features/piano/assign-block-lessons";
import type { LearningSource } from "@/lib/learning-source";

/** Finger numbers: 1=thumb … 5=pinky (standard piano pedagogy). */
export type ScaleFingering = {
  key: string;
  notes: string[];
  rightHandAscending: number[];
  leftHandAscending: number[];
};

/** Verified against pianoscales.org one-octave major scale charts. */
export const MAJOR_SCALE_FINGERING_SOURCE: LearningSource = {
  title: "pianoscales.org — Piano Major Scales",
  url: "https://pianoscales.org/major.html",
  note: "One-octave ascending RH/LH fingerings for all 12 major keys",
};

/** @deprecated Use MAJOR_SCALE_FINGERING_SOURCE */
export const FINGERING_SOURCE = MAJOR_SCALE_FINGERING_SOURCE.title;

/** Standard major-scale fingerings — one octave ascending per hand. */
export const MAJOR_SCALE_FINGERINGS: Record<string, ScaleFingering> = {
  C: {
    key: "C",
    notes: ["C", "D", "E", "F", "G", "A", "B", "C"],
    rightHandAscending: [1, 2, 3, 1, 2, 3, 4, 5],
    leftHandAscending: [5, 4, 3, 2, 1, 3, 2, 1],
  },
  G: {
    key: "G",
    notes: ["G", "A", "B", "C", "D", "E", "F#", "G"],
    rightHandAscending: [1, 2, 3, 1, 2, 3, 4, 5],
    leftHandAscending: [5, 4, 3, 2, 1, 3, 2, 1],
  },
  D: {
    key: "D",
    notes: ["D", "E", "F#", "G", "A", "B", "C#", "D"],
    rightHandAscending: [1, 2, 3, 1, 2, 3, 4, 5],
    leftHandAscending: [5, 4, 3, 2, 1, 3, 2, 1],
  },
  A: {
    key: "A",
    notes: ["A", "B", "C#", "D", "E", "F#", "G#", "A"],
    rightHandAscending: [1, 2, 3, 1, 2, 3, 4, 5],
    leftHandAscending: [5, 4, 3, 2, 1, 3, 2, 1],
  },
  E: {
    key: "E",
    notes: ["E", "F#", "G#", "A", "B", "C#", "D#", "E"],
    rightHandAscending: [1, 2, 3, 1, 2, 3, 4, 5],
    leftHandAscending: [5, 4, 3, 2, 1, 3, 2, 1],
  },
  B: {
    key: "B",
    notes: ["B", "C#", "D#", "E", "F#", "G#", "A#", "B"],
    // CAGED right hand (same as C/G/D/A/E); left hand starts on 4 to keep thumb on white keys.
    rightHandAscending: [1, 2, 3, 1, 2, 3, 4, 5],
    leftHandAscending: [4, 3, 2, 1, 4, 3, 2, 1],
  },
  "F#": {
    key: "F#",
    notes: ["F#", "G#", "A#", "B", "C#", "D#", "E#", "F#"],
    rightHandAscending: [2, 3, 4, 1, 2, 3, 1, 2],
    leftHandAscending: [4, 3, 2, 1, 3, 2, 1, 4],
  },
  Db: {
    key: "Db",
    notes: ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C", "Db"],
    rightHandAscending: [2, 3, 1, 2, 3, 4, 1, 2],
    leftHandAscending: [3, 2, 1, 4, 3, 2, 1, 3],
  },
  Ab: {
    key: "Ab",
    notes: ["Ab", "Bb", "C", "Db", "Eb", "F", "G", "Ab"],
    rightHandAscending: [3, 4, 1, 2, 3, 1, 2, 3],
    leftHandAscending: [3, 2, 1, 4, 3, 2, 1, 3],
  },
  Eb: {
    key: "Eb",
    notes: ["Eb", "F", "G", "Ab", "Bb", "C", "D", "Eb"],
    rightHandAscending: [3, 1, 2, 3, 4, 1, 2, 3],
    leftHandAscending: [3, 2, 1, 4, 3, 2, 1, 3],
  },
  Bb: {
    key: "Bb",
    notes: ["Bb", "C", "D", "Eb", "F", "G", "A", "Bb"],
    rightHandAscending: [2, 1, 2, 3, 1, 2, 3, 4],
    leftHandAscending: [3, 2, 1, 4, 3, 2, 1, 3],
  },
  F: {
    key: "F",
    notes: ["F", "G", "A", "Bb", "C", "D", "E", "F"],
    rightHandAscending: [1, 2, 3, 4, 1, 2, 3, 4],
    leftHandAscending: [5, 4, 3, 2, 1, 3, 2, 1],
  },
};

export const ALL_MAJOR_KEYS = [...CIRCLE_OF_FIFTHS_KEYS] as string[];

export function getMajorScaleFingering(key: string): ScaleFingering | null {
  return MAJOR_SCALE_FINGERINGS[key] ?? null;
}

/** Split at thumb-under (RH) or finger-4-over (LH) crossings for readable groups. */
export function splitHandPattern(
  fingers: number[],
  hand: "RH" | "LH",
): number[][] {
  const groups: number[][] = [];
  let current: number[] = [];
  for (let i = 0; i < fingers.length; i++) {
    const finger = fingers[i]!;
    const prev = i > 0 ? fingers[i - 1]! : null;
    const isCrossing =
      hand === "RH"
        ? finger === 1 && prev !== null && prev > 1
        : finger === 4 && prev === 1;
    if (isCrossing && current.length > 0) {
      groups.push(current);
      current = [finger];
    } else {
      current.push(finger);
    }
  }
  if (current.length > 0) groups.push(current);
  return groups.length > 0 ? groups : [fingers];
}

export type FingeringHandDisplay = {
  label: string;
  notes: string[];
  fingers: number[];
  pattern: string;
};

export type FingeringDisplay = {
  key: string;
  rightHand: FingeringHandDisplay;
  leftHand: FingeringHandDisplay;
  note: string;
  source: LearningSource;
};

export function buildFingeringDisplay(key: string): FingeringDisplay | null {
  const f = getMajorScaleFingering(key);
  if (!f) return null;

  const toHand = (
    label: string,
    notes: string[],
    fingers: number[],
    hand: "RH" | "LH",
  ): FingeringHandDisplay => ({
    label,
    notes,
    fingers,
    pattern: splitHandPattern(fingers, hand)
      .map((g) => g.join("-"))
      .join(" · "),
  });

  return {
    key,
    rightHand: toHand("Right hand", f.notes, f.rightHandAscending, "RH"),
    leftHand: toHand("Left hand", f.notes, f.leftHandAscending, "LH"),
    note: "1 = thumb, 5 = pinky. Ascending shown — descend with reversed fingers. For two octaves, repeat the same hand pattern.",
    source: MAJOR_SCALE_FINGERING_SOURCE,
  };
}

/** @deprecated Use buildFingeringDisplay — kept for tests migrating off arrow chains. */
export function formatFingerLine(
  notes: string[],
  fingers: number[],
): string {
  return notes.map((note, i) => `${note} (${fingers[i]})`).join(" · ");
}
