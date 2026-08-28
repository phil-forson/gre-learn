import { LEARNING_LOCALE } from "@/features/learning/types";
import type { GrammarUnit } from "@/features/grammar/types";
import {
  loadGrammarUnitSeed,
  requireCachedGrammarUnit,
  type GrammarUnitSeedRaw,
} from "./load-seed";

const CONDITIONALS_ZERO_FIRST_SECOND_RAW: GrammarUnitSeedRaw = {
  id: "conditionals-zero-first-second",
  slug: "conditionals-zero-first-second",
  title: "Conditionals: Zero, First, Second",
  cefrBand: "B1",
  locale: LEARNING_LOCALE,
  strandTags: ["language-focused learning", "meaning-focused input"],
  contentVersion: 1,
  form: {
    focus:
      "Zero, first, and second conditionals for facts, real futures, and imaginary situations",
    ruleSummary:
      "Zero conditional (If + present, present) states facts and habits. First conditional (If + present, will + verb) talks about a real or likely future—do not normally put will after if. Second conditional (If + past, would + verb) imagines an unlikely present or future; advice often uses If I were you…",
    patterns: [
      "If + present, present (zero — always true)",
      "If + present, will + base verb (first — likely future)",
      "If + past, would + base verb (second — imaginary)",
      "If I were you, I would…",
    ],
    examples: [
      {
        id: "ex1",
        sentence: "If you heat ice, it melts.",
        note: "Zero — fact / habit",
      },
      {
        id: "ex2",
        sentence: "If it rains, I'll stay home.",
        note: "First — real future possibility",
      },
      {
        id: "ex3",
        sentence: "If I had more money, I would travel.",
        note: "Second — imaginary situation",
      },
      {
        id: "ex4",
        sentence: "If I were you, I'd take the job.",
        note: "Second — advice with were",
      },
    ],
    contrastNote:
      "Zero = always true. First = may happen. Second = imaginary. Don't normally use will after if.",
  },
  microTask: {
    id: "mt_conditionals_zero_first_second",
    prompt: "Choose the best American English option for each item.",
    items: [
      {
        id: "mt1",
        kind: "mcq",
        prompt: "If you mix red and blue, you ___ purple.",
        choices: [
          { id: "a", text: "will get" },
          { id: "b", text: "get" },
          { id: "c", text: "would get" },
          { id: "d", text: "got" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt2",
        kind: "cloze",
        prompt: "If she studies, she ___ pass.",
        choices: [
          { id: "a", text: "would" },
          { id: "b", text: "will" },
          { id: "c", text: "gets" },
          { id: "d", text: "would to" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt3",
        kind: "mcq",
        prompt: "If I ___ more time, I would learn Spanish.",
        choices: [
          { id: "a", text: "have" },
          { id: "b", text: "had" },
          { id: "c", text: "will have" },
          { id: "d", text: "am having" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt4",
        kind: "cloze",
        prompt: "If it rains tomorrow, we ___ cancel the picnic. (likely)",
        choices: [
          { id: "a", text: "would" },
          { id: "b", text: "'ll" },
          { id: "c", text: "cancel" },
          { id: "d", text: "canceled" },
        ],
        correctChoiceId: "b",
      },
    ],
  },
};

const cache: { current: GrammarUnit | null } = { current: null };

export async function getConditionalsZeroFirstSecondUnit(): Promise<GrammarUnit> {
  return loadGrammarUnitSeed(CONDITIONALS_ZERO_FIRST_SECOND_RAW, cache);
}

export function getConditionalsZeroFirstSecondUnitSync(): GrammarUnit {
  return requireCachedGrammarUnit(cache, "Grammar seed");
}
