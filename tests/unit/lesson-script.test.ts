import { describe, expect, it } from "vitest";
import {
  buildAudioLessonScript,
  spellWordForNarration,
} from "@/features/audio/services/lesson-script";
import { SEED_CONTENT } from "@/features/generation/seed-content";

describe("audio lesson script", () => {
  it("orders segments correctly", () => {
    const script = buildAudioLessonScript(SEED_CONTENT.obdurate);
    expect(script.map((s) => s.type)).toEqual([
      "word",
      "spelling",
      "pronunciation",
      "definition",
      "etymology",
      "memory_hook",
      "synonyms",
      "example",
    ]);
  });

  it("spells letter by letter", () => {
    expect(spellWordForNarration("Obdurate")).toBe("O. B. D. U. R. A. T. E");
    const script = buildAudioLessonScript(SEED_CONTENT.obdurate);
    expect(script.find((s) => s.type === "spelling")?.text).toContain("O. B. D");
  });

  it("derives definition and example from stored content", () => {
    const content = SEED_CONTENT.obdurate;
    const script = buildAudioLessonScript(content);
    expect(script.find((s) => s.type === "definition")?.text).toContain(
      "means stubbornly",
    );
    expect(script.find((s) => s.type === "example")?.text).toContain(
      content.exampleSentences[0]!.text,
    );
    expect(script.find((s) => s.type === "memory_hook")?.text).toContain(
      "Memory hook:",
    );
  });
});
