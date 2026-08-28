import type { PianoSkill, PianoSkillLesson } from "@/features/piano/types";
import { DOMAIN_DEFAULT_SOURCES } from "./sources";
import {
  BOILERPLATE_PASS_RULE,
  LESSON_OVERRIDES,
  LESSON_SOURCE_PATCHES,
} from "./lesson-overrides";

function withSources(
  skill: PianoSkill,
  lesson: PianoSkillLesson,
): PianoSkillLesson {
  const patched = LESSON_SOURCE_PATCHES[skill.id];
  if (patched?.length) {
    return { ...lesson, sources: patched };
  }
  if (lesson.sources?.length) {
    return lesson;
  }
  const defaults = DOMAIN_DEFAULT_SOURCES[skill.domainId];
  return defaults?.length ? { ...lesson, sources: [...defaults] } : lesson;
}

/**
 * Apply rebuilt lessons, source patches, and domain-default sources to raw seed skills.
 */
export function finalizePianoSkills(
  skills: readonly PianoSkill[],
): readonly PianoSkill[] {
  return skills.map((skill) => {
    const override = LESSON_OVERRIDES[skill.id];
    const lesson = withSources(
      skill,
      override ?? skill.lesson,
    );
    if (
      !override &&
      skill.lesson.passRule === BOILERPLATE_PASS_RULE
    ) {
      throw new Error(
        `Piano skill ${skill.id} still uses boilerplate lesson — add to lesson-overrides.ts`,
      );
    }
    return { ...skill, lesson };
  });
}
