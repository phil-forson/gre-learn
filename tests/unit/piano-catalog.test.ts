import { describe, expect, it } from "vitest";
import {
  getDailyTemplate,
  getSkill,
  listDomains,
  listPhases,
  listSkills,
  resolveUnlockedSkills,
} from "@/features/piano/catalog";
import { DEFAULT_FOCUS_MIX } from "@/features/piano/curriculum";

describe("piano catalog", () => {
  it("has 12 domains d0..d11", () => {
    const domains = listDomains();
    expect(domains).toHaveLength(12);
    expect(domains.map((d) => d.id)).toEqual([
      "d0",
      "d1",
      "d2",
      "d3",
      "d4",
      "d5",
      "d6",
      "d7",
      "d8",
      "d9",
      "d10",
      "d11",
    ]);
  });

  it("seeds at least 40 skills with valid prereqs", () => {
    const skills = listSkills();
    expect(skills.length).toBeGreaterThanOrEqual(40);
    const ids = new Set(skills.map((s) => s.id));
    for (const skill of skills) {
      for (const prereq of skill.prereqIds) {
        expect(ids.has(prereq)).toBe(true);
      }
      expect(getSkill(skill.id)?.slug).toBe(skill.slug);
    }
  });

  it("daily template totals 60 minutes with five blocks", () => {
    const template = getDailyTemplate();
    expect(template.blocks).toHaveLength(5);
    const sum = template.blocks.reduce((acc, b) => acc + b.minutes, 0);
    expect(sum).toBe(60);
    expect(template.totalMinutes).toBe(60);
    expect(template.blocks.map((b) => b.id)).toEqual([
      "scale_mode_lab",
      "key_chord_lab",
      "gospel_core",
      "jazz_application",
      "ear_or_reading",
    ]);
  });

  it("has six phases with gospel-weighted focus mix", () => {
    const phases = listPhases();
    expect(phases).toHaveLength(6);
    for (const phase of phases) {
      expect(phase.focusMix).toEqual(DEFAULT_FOCUS_MIX);
      expect(phase.skillIds.length).toBeGreaterThan(0);
      for (const id of phase.skillIds) {
        expect(getSkill(id)).toBeDefined();
      }
    }
  });

  it("unlocks prereq-free skills as available", () => {
    const unlocked = resolveUnlockedSkills([]);
    const numberSystem = unlocked.find((s) => s.id === "sk_number_system");
    expect(numberSystem?.status).toBe("available");
    const sevenModes = unlocked.find((s) => s.id === "sk_seven_modes");
    expect(sevenModes?.status).toBe("locked");
  });
});
