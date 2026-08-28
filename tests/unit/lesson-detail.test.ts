import { describe, expect, it } from "vitest";
import { getSkill } from "@/features/piano/catalog";
import {
  buildBlockLessonDetail,
  resolveLessonTempo,
} from "@/features/piano/services/lesson-detail";

describe("lesson-detail tempo consistency", () => {
  it("uses per-key target in tempo box and steps (B major = 96)", () => {
    const skill = getSkill("sk_rcm_scales")!;
    const detail = buildBlockLessonDetail(skill, "B", []);
    const body = [
      String(detail.tempo?.targetBpm),
      ...detail.steps,
      detail.exercise,
      detail.passRule,
      detail.tempo?.howToUse ?? "",
    ].join(" ");

    expect(detail.tempo?.targetBpm).toBe(96);
    expect(detail.tempo?.startBpm).toBe(66);
    expect(body).toContain("96 BPM");
    expect(body).not.toContain("104 BPM");
  });

  it("key geography keeps its own exercise without scale overlay", () => {
    const skill = getSkill("sk_key_geography")!;
    const detail = buildBlockLessonDetail(skill, "B", []);
    expect(detail.exercise).not.toContain("two octaves hands together");
    expect(detail.passRule).toContain("relative minor");
    expect(detail.sources.length).toBeGreaterThan(0);
  });

  it("resolveLessonTempo matches buildBlockLessonDetail tempo", () => {
    const skill = getSkill("sk_major_scale_lab")!;
    const tempo = resolveLessonTempo(skill, "C");
    const detail = buildBlockLessonDetail(skill, "C", []);
    expect(detail.tempo).toEqual(tempo);
    expect(tempo?.targetBpm).toBe(104);
  });
});
