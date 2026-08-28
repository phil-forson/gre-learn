import type { PianoSkill } from "@/features/piano/types";
import {
  BLOCK_FORBIDDEN_SKILLS,
  D2_SKILL_IDS,
  EAR_READING_SKILL_IDS,
  SCALE_MODE_BLOCK_SKILL_IDS,
} from "@/features/piano/curriculum/skill-groups";

/** Circle-of-fifths day cycle for keysToday. */
export const CIRCLE_OF_FIFTHS_KEYS = [
  "C",
  "G",
  "D",
  "A",
  "E",
  "B",
  "F#",
  "Db",
  "Ab",
  "Eb",
  "Bb",
  "F",
] as const;

export type BlockLessonAssignment = {
  blockId: string;
  skill: PianoSkill;
};

/** Stable non-crypto hash for deterministic daily rotation. */
export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Today's focus key from the circle-of-fifths cycle keyed by local YYYY-MM-DD.
 */
export function keysTodayForDay(localDay: string): string[] {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(localDay);
  if (!match) {
    return [CIRCLE_OF_FIFTHS_KEYS[0]];
  }
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  const utcDays = Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
  const idx =
    ((utcDays % CIRCLE_OF_FIFTHS_KEYS.length) +
      CIRCLE_OF_FIFTHS_KEYS.length) %
    CIRCLE_OF_FIFTHS_KEYS.length;
  return [CIRCLE_OF_FIFTHS_KEYS[idx]!];
}

const KEY_CHORD_DOMAINS = new Set(["d0", "d3", "d4", "d5"]);

function isForbidden(blockId: string, skill: PianoSkill): boolean {
  return BLOCK_FORBIDDEN_SKILLS[blockId]?.has(skill.id) ?? false;
}

function matchesAffinity(blockId: string, skill: PianoSkill): boolean {
  if (isForbidden(blockId, skill)) return false;

  switch (blockId) {
    case "scale_mode_lab":
      return (
        D2_SKILL_IDS.has(skill.id) ||
        skill.id === "sk_rcm_scales" ||
        skill.id === "sk_arpeggios"
      );
    case "key_chord_lab":
      return KEY_CHORD_DOMAINS.has(skill.domainId);
    case "gospel_core":
      return (
        skill.strand === "gospel" ||
        skill.domainId === "d6" ||
        skill.domainId === "d9"
      );
    case "jazz_application":
      return (
        skill.strand === "jazz" &&
        !SCALE_MODE_BLOCK_SKILL_IDS.has(skill.id)
      );
    case "ear_or_reading":
      return (
        EAR_READING_SKILL_IDS.has(skill.id) ||
        skill.domainId === "d11"
      );
    default:
      return true;
  }
}

/** Widened affinity when the primary pool is empty. */
function matchesWidenedAffinity(blockId: string, skill: PianoSkill): boolean {
  if (isForbidden(blockId, skill)) return false;

  switch (blockId) {
    case "scale_mode_lab":
      return skill.domainId === "d1" || skill.domainId === "d2";
    case "key_chord_lab":
      return (
        KEY_CHORD_DOMAINS.has(skill.domainId) ||
        (skill.strand === "shared" && skill.domainId === "d3")
      );
    case "gospel_core":
      return (
        skill.strand === "gospel" ||
        (skill.strand === "shared" && skill.domainId === "d4")
      );
    case "jazz_application":
      return (
        (skill.strand === "jazz" &&
          !SCALE_MODE_BLOCK_SKILL_IDS.has(skill.id)) ||
        skill.domainId === "d8" ||
        skill.domainId === "d5" ||
        skill.id === "sk_seventh_chords" ||
        skill.id === "sk_251_basic"
      );
    case "ear_or_reading":
      return (
        EAR_READING_SKILL_IDS.has(skill.id) ||
        skill.domainId === "d10" ||
        skill.domainId === "d11"
      );
    default:
      return true;
  }
}

function pickFromPool(
  pool: PianoSkill[],
  localDay: string,
  blockId: string,
): PianoSkill | undefined {
  if (pool.length === 0) return undefined;
  const idx = hashString(`${localDay}:${blockId}`) % pool.length;
  return pool[idx];
}

/**
 * Assign exactly one primary skill per template block from phase skills,
 * using affinity pools + stable hash(localDay:blockId).
 * Never leaves a block empty when the phase has any skills.
 */
export function assignBlockLessons(
  phaseSkills: PianoSkill[],
  blockIds: string[],
  localDay: string,
): BlockLessonAssignment[] {
  if (phaseSkills.length === 0) {
    return [];
  }

  const used = new Set<string>();
  const assignments: BlockLessonAssignment[] = [];

  for (const blockId of blockIds) {
    const unused = phaseSkills.filter((s) => !used.has(s.id));
    const source = unused.length > 0 ? unused : phaseSkills;

    let pool = source.filter((s) => matchesAffinity(blockId, s));
    if (pool.length === 0) {
      pool = source.filter((s) => matchesWidenedAffinity(blockId, s));
    }
    if (pool.length === 0) {
      pool = source.filter((s) => !isForbidden(blockId, s));
    }
    if (pool.length === 0) {
      pool = source;
    }

    const skill = pickFromPool(pool, localDay, blockId) ?? phaseSkills[0]!;
    used.add(skill.id);
    assignments.push({ blockId, skill });
  }

  return assignments;
}
