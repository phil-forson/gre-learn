import { describe, expect, it } from "vitest";
import {
  assignBlockLessons,
  hashString,
  keysTodayForDay,
  CIRCLE_OF_FIFTHS_KEYS,
} from "@/features/piano/assign-block-lessons";
import { SCALE_MODE_BLOCK_SKILL_IDS } from "@/features/piano/curriculum/skill-groups";
import {
  getDailyTemplate,
  getSkillsForPhase,
  listSkills,
} from "@/features/piano/catalog";

const BLOCK_IDS = getDailyTemplate().blocks.map((b) => b.id);

describe("assignBlockLessons", () => {
  it("assigns exactly one skill with a lesson to every block", () => {
    const phaseSkills = getSkillsForPhase(0);
    const assigned = assignBlockLessons(
      phaseSkills,
      BLOCK_IDS,
      "2026-08-28",
    );
    expect(assigned).toHaveLength(5);
    for (const row of assigned) {
      expect(BLOCK_IDS).toContain(row.blockId);
      expect(row.skill.lesson.why.length).toBeGreaterThan(0);
      expect(row.skill.lesson.steps.length).toBeGreaterThan(0);
      expect(row.skill.lesson.exercise.length).toBeGreaterThan(0);
      expect(row.skill.lesson.passRule.length).toBeGreaterThan(0);
    }
    expect(new Set(assigned.map((a) => a.blockId)).size).toBe(5);
  });

  it("is stable for the same localDay + blockId", () => {
    const phaseSkills = getSkillsForPhase(1);
    const a = assignBlockLessons(phaseSkills, BLOCK_IDS, "2026-03-15");
    const b = assignBlockLessons(phaseSkills, BLOCK_IDS, "2026-03-15");
    expect(a.map((x) => x.skill.id)).toEqual(b.map((x) => x.skill.id));
  });

  it("rotates when localDay changes", () => {
    const phaseSkills = getSkillsForPhase(0);
    const a = assignBlockLessons(phaseSkills, BLOCK_IDS, "2026-01-01");
    const b = assignBlockLessons(phaseSkills, BLOCK_IDS, "2026-01-02");
    expect(hashString("2026-01-01:scale_mode_lab")).not.toBe(
      hashString("2026-01-02:scale_mode_lab"),
    );
    const differs = a.some((row, i) => row.skill.id !== b[i]?.skill.id);
    expect(differs).toBe(true);
  });

  it("respects affinity pools when phase has matches", () => {
    const phaseSkills = getSkillsForPhase(1);
    const assigned = assignBlockLessons(
      phaseSkills,
      BLOCK_IDS,
      "2026-06-01",
    );
    const byId = Object.fromEntries(
      assigned.map((a) => [a.blockId, a.skill]),
    );

    const scale = byId.scale_mode_lab!;
    expect(scale.domainId === "d1" || scale.domainId === "d2").toBe(true);

    const keyChord = byId.key_chord_lab!;
    expect(["d0", "d3", "d4", "d5"]).toContain(keyChord.domainId);

    const gospel = byId.gospel_core!;
    expect(
      gospel.strand === "gospel" ||
        gospel.domainId === "d6" ||
        gospel.domainId === "d9",
    ).toBe(true);

    const jazz = byId.jazz_application!;
    expect(SCALE_MODE_BLOCK_SKILL_IDS.has(jazz.id)).toBe(false);

    const ear = byId.ear_or_reading!;
    expect(
      ear.domainId === "d10" ||
        ear.domainId === "d11" ||
        ear.id === "sk_intervals_ear" ||
        ear.id === "sk_ear_classical" ||
        ear.id === "sk_sight_reading" ||
        ear.id === "sk_lead_sheets" ||
        ear.id === "sk_hymn_reading",
    ).toBe(true);
  });

  it("phase 0 scale block holds scale work; jazz is not a scale lab", () => {
    const phaseSkills = getSkillsForPhase(0);
    const assigned = assignBlockLessons(
      phaseSkills,
      BLOCK_IDS,
      "2026-08-28",
    );
    const byId = Object.fromEntries(
      assigned.map((a) => [a.blockId, a.skill]),
    );
    const scale = byId.scale_mode_lab!;
    const jazz = byId.jazz_application!;
    expect(SCALE_MODE_BLOCK_SKILL_IDS.has(scale.id)).toBe(true);
    expect(SCALE_MODE_BLOCK_SKILL_IDS.has(jazz.id)).toBe(false);
    expect(scale.id).not.toBe(jazz.id);
  });

  it("never leaves a block empty even with a tiny skill pool", () => {
    const one = listSkills().slice(0, 1);
    const assigned = assignBlockLessons(one, BLOCK_IDS, "2026-08-28");
    expect(assigned).toHaveLength(5);
    for (const row of assigned) {
      expect(row.skill.id).toBe(one[0]!.id);
    }
  });
});

describe("keysTodayForDay", () => {
  it("cycles the circle of fifths by local day", () => {
    expect(CIRCLE_OF_FIFTHS_KEYS).toHaveLength(12);
    const a = keysTodayForDay("2026-01-01");
    const b = keysTodayForDay("2026-01-02");
    expect(a).toHaveLength(1);
    expect(CIRCLE_OF_FIFTHS_KEYS).toContain(a[0] as (typeof CIRCLE_OF_FIFTHS_KEYS)[number]);
    expect(a[0]).not.toBe(b[0]);
    // Full cycle returns to same key 12 days later
    expect(keysTodayForDay("2026-01-01")).toEqual(
      keysTodayForDay("2026-01-13"),
    );
  });
});
