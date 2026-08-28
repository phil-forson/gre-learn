import {
  CIRCLE_OF_FIFTHS_KEYS,
  keysTodayForDay,
} from "@/features/piano/assign-block-lessons";
import {
  buildFingeringDisplay,
  getMajorScaleFingering,
  ALL_MAJOR_KEYS,
  type FingeringDisplay,
} from "@/features/piano/curriculum/scale-fingerings";
import { PIANO_SOURCES } from "@/features/piano/curriculum/sources";
import {
  KEY_TRACKING_SKILL_IDS,
  SCALE_FINGERING_SKILL_IDS,
} from "@/features/piano/curriculum/skill-groups";
import type { LearningSource } from "@/lib/learning-source";
import type { PianoSkill, PianoSkillLesson } from "@/features/piano/types";

export { KEY_TRACKING_SKILL_IDS, SCALE_FINGERING_SKILL_IDS } from "@/features/piano/curriculum/skill-groups";

export type LessonTempo = {
  startBpm: number;
  targetBpm: number;
  noteValue: string;
  howToUse: string;
};

export type BlockLessonDetail = {
  why: string;
  steps: string[];
  exercise: string;
  passRule: string;
  tip?: string;
  tempo: LessonTempo | null;
  focusKey: string;
  keysCompleted: string[];
  keysRemaining: string[];
  trackKeys: boolean;
  fingering: FingeringDisplay | null;
  sources: LearningSource[];
  glossary: Array<{ term: string; meaning: string }>;
};

const DEFAULT_GLOSSARY: Array<{ term: string; meaning: string }> = [
  {
    term: "Hands together",
    meaning: "Both hands play at the same time (not one hand alone).",
  },
  {
    term: "Hands separate",
    meaning: "One hand at a time — usually learn each hand alone first.",
  },
  {
    term: "Two octaves",
    meaning: "Play the scale across two full 8-note spans (16 notes up, then back down).",
  },
  {
    term: "Metronome BPM",
    meaning: "Beats per minute — one click = one quarter-note pulse unless noted otherwise.",
  },
  {
    term: "2–5–1",
    meaning:
      "A common jazz/gospel chord move: ii chord → V chord → I chord (in C: Dm7 → G7 → Cmaj7).",
  },
];

function expandPlainText(text: string): string {
  return text
    .replace(/\bHT\b/g, "hands together (both hands)")
    .replace(/\bHS\b/g, "hands separate (one hand at a time)")
    .replace(/\bRH\b/g, "right hand")
    .replace(/\bLH\b/g, "left hand")
    .replace(/\bii–V–I\b/g, "2–5–1 (Dm7 → G7 → Cmaj7 in the key of C)")
    .replace(/\bii-V-I\b/g, "2–5–1 (Dm7 → G7 → Cmaj7 in the key of C)");
}

function defaultTempoForSkill(skill: PianoSkill, key: string): LessonTempo {
  const fingering = getMajorScaleFingering(key);
  const start = fingering?.tempoStartBpm ?? 72;
  const target = fingering?.tempoTargetBpm ?? 104;
  const rcmNote =
    skill.id === "sk_rcm_scales"
      ? ` (${PIANO_SOURCES.rcmSyllabi.title})`
      : "";
  return {
    startBpm: start,
    targetBpm: target,
    noteValue: "quarter note (♩)",
    howToUse: `Set metronome to ${start} BPM. Each click = one quarter note. When you play 4 clean two-octave reps in a row with even tone, raise by 4 BPM until you reach ${target} BPM.${rcmNote}`,
  };
}

/** Single resolver — tempo box, steps, and pass rules must all use this. */
export function resolveLessonTempo(
  skill: PianoSkill,
  focusKey: string,
): LessonTempo | null {
  if (SCALE_FINGERING_SKILL_IDS.has(skill.id)) {
    return defaultTempoForSkill(skill, focusKey);
  }
  if (!skill.lesson.tempo) return null;
  const t = skill.lesson.tempo;
  return {
    startBpm: t.startBpm,
    targetBpm: t.targetBpm,
    noteValue: t.noteValue,
    howToUse: expandPlainText(t.howToUse),
  };
}

function enrichStepsForKeySkill(
  skill: PianoSkill,
  key: string,
  base: PianoSkillLesson,
): string[] {
  const f = getMajorScaleFingering(key);

  if (
    (skill.id === "sk_major_scale_lab" || skill.id === "sk_rcm_scales") &&
    f
  ) {
    const rhPattern = buildFingeringDisplay(key)?.rightHand.pattern ?? "";
    const lhPattern = buildFingeringDisplay(key)?.leftHand.pattern ?? "";
    return [
      `Today's key: ${key} major. Use the fingering chart below — right hand groups: ${rhPattern}; left hand groups: ${lhPattern}.`,
      `Hands separate first: one octave each hand at ${f.tempoStartBpm} BPM until even. Then hands together for two octaves.`,
      `Do not speed up until 4 consecutive clean reps — then add 4 BPM. Target: ${f.tempoTargetBpm} BPM hands together, two octaves.`,
      skill.id === "sk_major_scale_lab"
        ? `Sing scale degrees while you play: 1–2–3–4–5–6–7–8, then back down.`
        : `Add relative harmonic minor in ${key} after the major scale (same session, same key).`,
    ];
  }

  if (skill.id === "sk_seven_modes" && f) {
    return [
      `Parent major scale today: ${key} major. Play it once hands together (two octaves) at ${f.tempoStartBpm} BPM.`,
      `From that parent, play each mode starting on its root for one octave (Ionian on ${key}, Dorian on 2, Phrygian on 3, etc.).`,
      `Name the characteristic tone for each mode aloud (e.g. Mixolydian = lowered 7th).`,
      `End by playing the parent ${key} major scale once more to reset your ear.`,
    ];
  }

  if (skill.id === "sk_key_geography") {
    return base.steps.map((step) =>
      expandPlainText(step.replace(/\btoday'?s key\b/gi, key)),
    );
  }

  return base.steps.map(expandPlainText);
}

export function pickFocusKey(
  localDay: string,
  keysCompleted: string[],
): string {
  const completed = new Set(keysCompleted);
  const cycle = [...CIRCLE_OF_FIFTHS_KEYS] as string[];
  const dayKey = keysTodayForDay(localDay)[0] ?? cycle[0]!;
  const startIdx = Math.max(0, cycle.indexOf(dayKey));
  for (let i = 0; i < cycle.length; i++) {
    const key = cycle[(startIdx + i) % cycle.length]!;
    if (!completed.has(key)) return key;
  }
  return dayKey;
}

function collectSources(
  skill: PianoSkill,
  fingering: FingeringDisplay | null,
): LearningSource[] {
  const fromLesson = skill.lesson.sources ?? [];
  const fromFingering = fingering ? [fingering.source] : [];
  const seen = new Set<string>();
  return [...fromLesson, ...fromFingering].filter((s) => {
    if (seen.has(s.url)) return false;
    seen.add(s.url);
    return true;
  });
}

export function buildBlockLessonDetail(
  skill: PianoSkill,
  focusKey: string,
  keysCompleted: string[],
): BlockLessonDetail {
  const trackKeys = KEY_TRACKING_SKILL_IDS.has(skill.id);
  const completed = trackKeys
    ? [...new Set(keysCompleted.filter((k) => ALL_MAJOR_KEYS.includes(k)))]
    : [];
  const remaining = trackKeys
    ? ALL_MAJOR_KEYS.filter((k) => !completed.includes(k))
    : [];

  const f = getMajorScaleFingering(focusKey);
  const useScaleOverlay = SCALE_FINGERING_SKILL_IDS.has(skill.id) && f;

  const steps = KEY_TRACKING_SKILL_IDS.has(skill.id)
    ? enrichStepsForKeySkill(skill, focusKey, skill.lesson)
    : skill.lesson.steps.map(expandPlainText);

  const tempo = resolveLessonTempo(skill, focusKey);
  const showFingering = SCALE_FINGERING_SKILL_IDS.has(skill.id);
  const fingering = showFingering ? buildFingeringDisplay(focusKey) : null;

  return {
    why: expandPlainText(skill.lesson.why),
    steps,
    exercise: expandPlainText(
      useScaleOverlay
        ? `${focusKey} major: two octaves hands together at ${f!.tempoStartBpm} BPM, then ${skill.lesson.exercise}`
        : skill.lesson.exercise,
    ),
    passRule: expandPlainText(
      useScaleOverlay
        ? `${focusKey} major: 4 clean two-octave hands-together reps at ${f!.tempoStartBpm} BPM without stopping or rushing thumb crossings. Then ${skill.lesson.passRule}`
        : skill.lesson.passRule,
    ),
    tip: skill.lesson.tip ? expandPlainText(skill.lesson.tip) : undefined,
    tempo,
    focusKey,
    keysCompleted: completed,
    keysRemaining: remaining,
    trackKeys,
    fingering,
    sources: collectSources(skill, fingering),
    glossary: DEFAULT_GLOSSARY,
  };
}
