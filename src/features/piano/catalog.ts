import {
  DAILY_TEMPLATE,
  PIANO_DOMAINS,
  PIANO_PHASES,
  PIANO_SKILLS,
} from "@/features/piano/curriculum";
import type {
  DailyTemplate,
  PianoDomain,
  PianoPhase,
  PianoSkill,
  PianoSkillProgress,
  PianoSkillStatus,
} from "@/features/piano/types";

export function listDomains(): PianoDomain[] {
  return [...PIANO_DOMAINS];
}

export function listSkills(): PianoSkill[] {
  return [...PIANO_SKILLS];
}

export function getSkill(id: string): PianoSkill | undefined {
  return PIANO_SKILLS.find((s) => s.id === id);
}

export function getSkillBySlug(slug: string): PianoSkill | undefined {
  return PIANO_SKILLS.find((s) => s.slug === slug);
}

export function listPhases(): PianoPhase[] {
  return [...PIANO_PHASES];
}

export function getPhase(phaseIndex: number): PianoPhase | undefined {
  return PIANO_PHASES.find((p) => p.phaseIndex === phaseIndex);
}

export function getDailyTemplate(): DailyTemplate {
  return {
    ...DAILY_TEMPLATE,
    blocks: DAILY_TEMPLATE.blocks.map((b) => ({ ...b })),
  };
}

export function getSkillsForPhase(phaseIndex: number): PianoSkill[] {
  const phase = getPhase(phaseIndex);
  if (!phase) return [];
  return phase.skillIds
    .map((id) => getSkill(id))
    .filter((s): s is PianoSkill => Boolean(s));
}

function progressMap(
  progress: PianoSkillProgress[],
): Map<string, PianoSkillProgress> {
  return new Map(progress.map((p) => [p.skillId, p]));
}

function isSatisfied(
  skillId: string,
  byId: Map<string, PianoSkillProgress>,
): boolean {
  const row = byId.get(skillId);
  if (!row) return false;
  return row.status === "practiced" || row.status === "mastered";
}

/**
 * Resolve unlock state from prereqs + existing progress.
 * Skills with no progress row and satisfied prereqs → available.
 * Missing prereqs → locked. Existing practiced/mastered preserved.
 */
export function resolveUnlockedSkills(
  progress: PianoSkillProgress[],
): Array<PianoSkill & { status: PianoSkillStatus }> {
  const byId = progressMap(progress);
  return PIANO_SKILLS.map((skill) => {
    const existing = byId.get(skill.id);
    if (existing?.status === "practiced" || existing?.status === "mastered") {
      return { ...skill, status: existing.status };
    }
    const prereqsMet = skill.prereqIds.every((id) => isSatisfied(id, byId));
    if (!prereqsMet) {
      return { ...skill, status: "locked" };
    }
    if (existing?.status === "available") {
      return { ...skill, status: "available" };
    }
    // Domain 0 / early skills with no prereqs start available (revision, not locked).
    return { ...skill, status: "available" };
  });
}

export const PIANO_CONTINUE_HREF = "/piano/today";
