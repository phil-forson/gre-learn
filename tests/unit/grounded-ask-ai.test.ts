import { describe, expect, it } from "vitest";
import {
  askGroundedAi,
  assembleGroundedContext,
  type GroundedAskContext,
} from "@/features/learning/services/grounded-ask-ai";
import { buildPianoLessonAskContext } from "@/features/piano/services/lesson-ask-context";
import { buildPathUnitAskContext } from "@/features/learning/services/path-ask-context";
import { CEFR_FRAMEWORK } from "@/features/path/curriculum/sources";

const sampleCtx: GroundedAskContext = {
  title: "Major scale lab",
  exercise: "Two octaves hands together in today's key.",
  referencePack: "## Steps\n1. Use fingering chart.\n2. Start at 72 BPM.",
  sources: [
    {
      title: "pianoscales.org",
      url: "https://pianoscales.org/major.html",
      note: "Fingerings",
    },
  ],
  glossary: [{ term: "Hands together", meaning: "Both hands at once." }],
};

describe("grounded ask AI", () => {
  it("mock answers glossary terms from reference only", async () => {
    const res = await askGroundedAi(sampleCtx, "What is hands together?");
    expect(res.provider).toBe("mock");
    expect(res.answer).toContain("Both hands at once");
    expect(res.cannotAnswer).toBe(false);
  });

  it("reference pack includes sources block", () => {
    const pack = assembleGroundedContext(sampleCtx);
    expect(pack).toContain("pianoscales.org");
    expect(pack).toContain("https://pianoscales.org/major.html");
  });

  it("builds piano context from skill id", async () => {
    const ctx = await buildPianoLessonAskContext(
      "sk_major_scale_lab",
      "2026-08-28",
    );
    expect(ctx.title).toBeTruthy();
    expect(ctx.sources.length).toBeGreaterThan(0);
    expect(ctx.exercise.length).toBeGreaterThan(0);
  });

  it("builds path context with CEFR sources", () => {
    const ctx = buildPathUnitAskContext({
      title: "Short turns",
      form: {
        focus: "Keep turns short",
        ruleSummary: "One idea per turn.",
        patterns: ["I think…"],
        examples: [{ sentence: "I'm ready.", note: "Invite" }],
      },
      microTask: {
        prompt: "Pick the best short turn.",
        items: [{ prompt: "Which is shorter?" }],
      },
      sources: [CEFR_FRAMEWORK],
      cefrBand: "A2",
    });
    expect(ctx.referencePack).toContain("Keep turns short");
    expect(ctx.sources[0]!.url).toContain("coe.int");
  });
});
