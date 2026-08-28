import { describe, expect, it } from "vitest";
import { assignBlockLessons } from "@/features/piano/assign-block-lessons";
import { BOILERPLATE_PASS_RULE } from "@/features/piano/curriculum/lesson-overrides";
import { PIANO_SKILLS } from "@/features/piano/curriculum";
import { SCALE_MODE_BLOCK_SKILL_IDS } from "@/features/piano/curriculum/skill-groups";
import {
  getDailyTemplate,
  getSkillsForPhase,
} from "@/features/piano/catalog";
import { isLearningSource } from "@/lib/learning-source";
import { SPEAKING_CURRICULUM } from "@/features/path/curriculum/speaking";
import { SENTENCE_CURRICULUM } from "@/features/path/curriculum/sentence";

const BLOCK_IDS = getDailyTemplate().blocks.map((b) => b.id);

describe("piano curriculum compliance", () => {
  it("every skill has verifiable lesson sources and no boilerplate pass rule", () => {
    for (const skill of PIANO_SKILLS) {
      expect(skill.lesson.passRule, skill.id).not.toBe(BOILERPLATE_PASS_RULE);
      expect(skill.lesson.sources?.length, skill.id).toBeGreaterThan(0);
      for (const source of skill.lesson.sources ?? []) {
        expect(isLearningSource(source), skill.id).toBe(true);
      }
    }
  });

  it("no phase assigns two scale-mode skills on the same day", () => {
    for (let phase = 0; phase < 6; phase++) {
      const assigned = assignBlockLessons(
        getSkillsForPhase(phase),
        BLOCK_IDS,
        "2026-08-28",
      );
      const scaleModeCount = assigned.filter((a) =>
        SCALE_MODE_BLOCK_SKILL_IDS.has(a.skill.id),
      ).length;
      expect(scaleModeCount).toBeLessThanOrEqual(1);
    }
  });
});

describe("english path curriculum sources", () => {
  it("speaking units cite CEFR", () => {
    for (const unit of SPEAKING_CURRICULUM) {
      expect(unit.sources?.length).toBeGreaterThan(0);
      expect(unit.sources?.some((s) => s.url.includes("coe.int"))).toBe(true);
    }
  });

  it("sentence units cite CEFR", () => {
    for (const unit of SENTENCE_CURRICULUM) {
      expect(unit.sources?.length).toBeGreaterThan(0);
      expect(unit.sources?.some((s) => s.url.includes("coe.int"))).toBe(true);
    }
  });
});
