import { describe, expect, it } from "vitest";
import {
  RCM_GRADE5_MAJOR_SCALE_TEMPO,
  getScalePracticeTempo,
} from "@/features/piano/curriculum/scale-tempos";
import { isLearningSource } from "@/lib/learning-source";

describe("scale-tempos", () => {
  it("cites verifiable RCM Grade 5 scale tempo source", () => {
    expect(isLearningSource(RCM_GRADE5_MAJOR_SCALE_TEMPO.source)).toBe(true);
    expect(RCM_GRADE5_MAJOR_SCALE_TEMPO.source.url).toMatch(/^https:\/\//);
  });

  it("uses one tempo band for all keys (no sharp-key penalty)", () => {
    const tempo = getScalePracticeTempo();
    expect(tempo.startBpm).toBe(88);
    expect(tempo.targetBpm).toBe(104);
    expect(tempo.noteValue).toContain("eighth");
  });
});
