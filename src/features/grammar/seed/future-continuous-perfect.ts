import { LEARNING_LOCALE } from "@/features/learning/types";
import type { GrammarUnit } from "@/features/grammar/types";
import {
  loadGrammarUnitSeed,
  requireCachedGrammarUnit,
  type GrammarUnitSeedRaw,
} from "./load-seed";

const FUTURE_CONTINUOUS_PERFECT_RAW: GrammarUnitSeedRaw = {
  id: "future-continuous-perfect",
  slug: "future-continuous-perfect",
  title: "Future Continuous & Future Perfect",
  cefrBand: "B2",
  locale: LEARNING_LOCALE,
  strandTags: ["language-focused learning", "meaning-focused input"],
  contentVersion: 1,
  form: {
    focus:
      "Actions in progress at a future time versus completed before a future time",
    ruleSummary:
      "Future continuous (will be + verb-ing) describes an action in progress at a future time—often with at. Future perfect (will have + past participle) describes an action completed before a future time—often with by. Memory tip: at a time = in progress; by a time = completed.",
    patterns: [
      "Subject + will be + verb-ing (at + future time)",
      "Subject + will have + past participle (by + future time)",
      "At + time, subject + will be + verb-ing",
      "By + time, subject + will have + past participle",
    ],
    examples: [
      {
        id: "ex1",
        sentence: "At 6 p.m., I'll be studying.",
        note: "Future continuous — in progress at a time",
      },
      {
        id: "ex2",
        sentence: "By 6 p.m., I'll have finished.",
        note: "Future perfect — completed by a time",
      },
      {
        id: "ex3",
        sentence: "This time tomorrow, we'll be flying to Denver.",
        note: "Action in progress at a future moment",
      },
      {
        id: "ex4",
        sentence: "By next June, she will have graduated.",
        note: "Completed before a future deadline",
      },
    ],
    contrastNote:
      "At a time = in progress (future continuous). By a time = completed (future perfect).",
  },
  microTask: {
    id: "mt_future_continuous_perfect",
    prompt: "Choose the best American English option for each item.",
    items: [
      {
        id: "mt1",
        kind: "mcq",
        prompt: "At 9 tonight, I ___ dinner.",
        choices: [
          { id: "a", text: "will have cook" },
          { id: "b", text: "will be cooking" },
          { id: "c", text: "will cooking" },
          { id: "d", text: "am cook" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt2",
        kind: "cloze",
        prompt: "By Friday, we ___ the report.",
        choices: [
          { id: "a", text: "will be finishing" },
          { id: "b", text: "will have finished" },
          { id: "c", text: "will finishing" },
          { id: "d", text: "have finish" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt3",
        kind: "mcq",
        prompt: "___ noon, the guests will have arrived.",
        choices: [
          { id: "a", text: "At" },
          { id: "b", text: "By" },
          { id: "c", text: "Since" },
          { id: "d", text: "For" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt4",
        kind: "cloze",
        prompt: "___ 3 p.m., she'll be driving home. (in progress)",
        choices: [
          { id: "a", text: "By" },
          { id: "b", text: "At" },
          { id: "c", text: "Until" },
          { id: "d", text: "Since" },
        ],
        correctChoiceId: "b",
      },
    ],
  },
};

const cache: { current: GrammarUnit | null } = { current: null };

export async function getFutureContinuousPerfectUnit(): Promise<GrammarUnit> {
  return loadGrammarUnitSeed(FUTURE_CONTINUOUS_PERFECT_RAW, cache);
}

export function getFutureContinuousPerfectUnitSync(): GrammarUnit {
  return requireCachedGrammarUnit(cache, "Grammar seed");
}
