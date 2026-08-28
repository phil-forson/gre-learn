import type { LearningSource } from "@/lib/learning-source";
import { PIANO_SOURCES } from "@/features/piano/curriculum/sources";

/**
 * RCM Grade 5 minimum: major scales hands together, two octaves, ♪ = 104 BPM.
 * Same tempo for every key (including B and Ab) — not slower for sharp/flat keys.
 * @see PIANO_SOURCES.rcmGrade5Scales
 */
export const RCM_GRADE5_MAJOR_SCALE_TEMPO = {
  startBpm: 88,
  targetBpm: 104,
  noteValue: "eighth note (♪)",
  source: PIANO_SOURCES.rcmGrade5Scales satisfies LearningSource,
} as const;

export type ScalePracticeTempo = {
  startBpm: number;
  targetBpm: number;
  noteValue: string;
};

/** Single tempo table for all major-key scale work — fingerings do not carry BPM. */
export function getScalePracticeTempo(): ScalePracticeTempo {
  return {
    startBpm: RCM_GRADE5_MAJOR_SCALE_TEMPO.startBpm,
    targetBpm: RCM_GRADE5_MAJOR_SCALE_TEMPO.targetBpm,
    noteValue: RCM_GRADE5_MAJOR_SCALE_TEMPO.noteValue,
  };
}

export function formatScaleTempoHowToUse(
  startBpm: number,
  targetBpm: number,
  noteValue: string,
  options?: { rcmLabel?: boolean },
): string {
  const rcm =
    options?.rcmLabel ?
      ` (${PIANO_SOURCES.rcmSyllabi.title} Grade 5 minimum: ♪ = ${RCM_GRADE5_MAJOR_SCALE_TEMPO.targetBpm}.)`
    : "";
  return `Set metronome to ${startBpm} BPM. Each click = one ${noteValue.replace(/[()♪]/g, "").trim()}. When you play 4 clean two-octave hands-together reps in a row with even tone, raise by 4 BPM until you reach ${targetBpm} BPM.${rcm}`;
}
