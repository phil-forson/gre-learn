import { describe, expect, it } from "vitest";
import { buildAudioLessonScript } from "@/features/audio/services/lesson-script";
import {
  buildManualLearningContent,
  parseManualVocabularyCards,
} from "@/features/vocabulary/services/parse-manual-card";

const AUSTERE = `Austere
Meaning: Very plain, strict, or severe in appearance or manner.
Common Link: Stern
Breakdown: From Greek austeros, meaning "harsh" or "severe."
Memory Trick: Austere = severe and stripped of comfort.
Sentence: The office had an austere design with little decoration.`;

describe("parseManualVocabularyCards", () => {
  it("parses a single card with all required fields", () => {
    const cards = parseManualVocabularyCards(AUSTERE);
    expect(cards).toHaveLength(1);
    expect(cards[0]).toEqual({
      word: "Austere",
      meaning: "Very plain, strict, or severe in appearance or manner.",
      commonLink: "Stern",
      breakdown: 'From Greek austeros, meaning "harsh" or "severe."',
      memoryTrick: "Austere = severe and stripped of comfort.",
      sentence: "The office had an austere design with little decoration.",
    });
  });

  it("parses multiple cards separated by blank lines", () => {
    const cards = parseManualVocabularyCards(`${AUSTERE}

Obdurate
Meaning: Stubbornly refusing to change.
Common Link: Stubborn
Breakdown: From Latin obdurare.
Memory Trick: Ob-durate — hardened against change.
Sentence: The obdurate judge refused to reconsider.`);

    expect(cards).toHaveLength(2);
    expect(cards[1]!.word).toBe("Obdurate");
  });

  it("rejects cards missing required fields", () => {
    expect(() =>
      parseManualVocabularyCards(`Austere
Meaning: Plain and strict.`),
    ).toThrow(/missing required fields/i);
  });
});

describe("buildManualLearningContent", () => {
  it("maps manual fields into validated learning content", () => {
    const card = parseManualVocabularyCards(AUSTERE)[0]!;
    const content = buildManualLearningContent(card);

    expect(content.word).toBe("Austere");
    expect(content.normalizedWord).toBe("austere");
    expect(content.definitions[0]?.text).toContain("plain, strict");
    expect(content.etymology.summary).toContain("Greek austeros");
    expect(content.memoryHook.text).toContain("stripped of comfort");
    expect(content.synonyms[0]).toEqual({
      word: "Stern",
      note: "Common link",
    });
    expect(content.exampleSentences[0]?.text).toContain("austere design");
  });

  it("feeds audio review with common link narration", () => {
    const card = parseManualVocabularyCards(AUSTERE)[0]!;
    const content = buildManualLearningContent(card);
    const script = buildAudioLessonScript(content);

    expect(script.find((s) => s.text.startsWith("Common link:"))?.text).toBe(
      "Common link: Stern.",
    );
    expect(script.find((s) => s.type === "memory_hook")?.text).toContain(
      "stripped of comfort",
    );
    expect(script.find((s) => s.type === "example")?.text).toContain(
      "austere design",
    );
  });
});
