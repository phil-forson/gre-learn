import { LEARNING_LOCALE } from "@/features/learning/types";
import type { GrammarUnit } from "@/features/grammar/types";
import {
  loadGrammarUnitSeed,
  requireCachedGrammarUnit,
  type GrammarUnitSeedRaw,
} from "./load-seed";

const CONTRAST_WORDS_RAW: GrammarUnitSeedRaw = {
  id: "contrast-words",
  slug: "contrast-words",
  title: "Contrast Words",
  cefrBand: "B1",
  locale: LEARNING_LOCALE,
  strandTags: ["language-focused learning", "meaning-focused input"],
  contentVersion: 1,
  form: {
    focus:
      "Showing contrast with despite, in spite of, although, even though, and though",
    ruleSummary:
      "Despite and in spite of take a noun or -ing form—not a full clause. Although and even though take a subject + verb clause. Though is more informal and can also appear at the end of a sentence. Choose the form that matches what follows the linker.",
    patterns: [
      "Despite / In spite of + noun",
      "Despite / In spite of + -ing",
      "Although / Even though + subject + verb",
      "…, though. (end position)",
    ],
    examples: [
      {
        id: "ex1",
        sentence: "Despite the rain, we went out.",
        note: "despite + noun",
      },
      {
        id: "ex2",
        sentence: "In spite of feeling tired, she finished the report.",
        note: "in spite of + -ing",
      },
      {
        id: "ex3",
        sentence: "Although it was raining, we went out.",
        note: "although + subject + verb",
      },
      {
        id: "ex4",
        sentence: "It was difficult. I enjoyed it, though.",
        note: "though — informal; can go at the end",
      },
    ],
    contrastNote:
      "Despite/in spite of + noun/-ing. Although/even though + clause. Though can also close a sentence.",
  },
  microTask: {
    id: "mt_contrast_words",
    prompt: "Choose the best American English option for each item.",
    items: [
      {
        id: "mt1",
        kind: "mcq",
        prompt: "___ the traffic, we arrived on time.",
        choices: [
          { id: "a", text: "Although" },
          { id: "b", text: "Despite" },
          { id: "c", text: "Even though" },
          { id: "d", text: "Though that" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt2",
        kind: "cloze",
        prompt: "___ she was sick, she came to work.",
        choices: [
          { id: "a", text: "Despite" },
          { id: "b", text: "Although" },
          { id: "c", text: "In spite" },
          { id: "d", text: "Despite of" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt3",
        kind: "mcq",
        prompt: "___ of the cost, they bought the tickets.",
        choices: [
          { id: "a", text: "Despite" },
          { id: "b", text: "In spite" },
          { id: "c", text: "Although" },
          { id: "d", text: "Even though" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt4",
        kind: "cloze",
        prompt: "The test was hard. I passed, ___.",
        choices: [
          { id: "a", text: "despite" },
          { id: "b", text: "though" },
          { id: "c", text: "although" },
          { id: "d", text: "in spite" },
        ],
        correctChoiceId: "b",
      },
    ],
  },
};

const cache: { current: GrammarUnit | null } = { current: null };

export async function getContrastWordsUnit(): Promise<GrammarUnit> {
  return loadGrammarUnitSeed(CONTRAST_WORDS_RAW, cache);
}

export function getContrastWordsUnitSync(): GrammarUnit {
  return requireCachedGrammarUnit(cache, "Grammar seed");
}
