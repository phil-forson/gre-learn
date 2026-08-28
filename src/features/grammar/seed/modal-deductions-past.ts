import { LEARNING_LOCALE } from "@/features/learning/types";
import type { GrammarUnit } from "@/features/grammar/types";
import {
  loadGrammarUnitSeed,
  requireCachedGrammarUnit,
  type GrammarUnitSeedRaw,
} from "./load-seed";

const MODAL_DEDUCTIONS_PAST_RAW: GrammarUnitSeedRaw = {
  id: "modal-deductions-past",
  slug: "modal-deductions-past",
  title: "Past Deductions with Modals",
  cefrBand: "B2",
  locale: LEARNING_LOCALE,
  strandTags: ["language-focused learning", "meaning-focused input"],
  contentVersion: 1,
  form: {
    focus:
      "Guessing what happened in the past with must/might/may/can't have + past participle",
    ruleSummary:
      "Use modal + have + past participle to deduce past events. Must have = almost certain it happened. Might/may have = possibly happened. Can't/couldn't have = almost certain it did not happen. Same certainty scale as present deductions, but about the past.",
    patterns: [
      "Subject + must have + past participle (almost certain)",
      "Subject + might/may have + past participle (possible)",
      "Subject + can't/couldn't have + past participle (almost impossible)",
      "She must have forgotten.",
    ],
    examples: [
      {
        id: "ex1",
        sentence: "She must have forgotten.",
        note: "must have — almost certain it happened",
      },
      {
        id: "ex2",
        sentence: "He might have missed the bus.",
        note: "might have — possibly happened",
      },
      {
        id: "ex3",
        sentence: "She can't have driven—her keys are here.",
        note: "can't have — almost certain it did not happen",
      },
      {
        id: "ex4",
        sentence: "They couldn't have known about the change.",
        note: "couldn't have — past impossibility",
      },
    ],
    contrastNote:
      "Must = sure. Might/may = possible. Can't/couldn't = impossible. Form: modal + have + past participle.",
  },
  microTask: {
    id: "mt_modal_deductions_past",
    prompt: "Choose the best American English option for each item.",
    items: [
      {
        id: "mt1",
        kind: "mcq",
        prompt: "The streets are wet. It ___ rained.",
        choices: [
          { id: "a", text: "must have" },
          { id: "b", text: "must" },
          { id: "c", text: "can't" },
          { id: "d", text: "might to have" },
        ],
        correctChoiceId: "a",
      },
      {
        id: "mt2",
        kind: "cloze",
        prompt: "I'm not sure. He ___ left early.",
        choices: [
          { id: "a", text: "must" },
          { id: "b", text: "might have" },
          { id: "c", text: "can't" },
          { id: "d", text: "have might" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt3",
        kind: "mcq",
        prompt: "She ___ stolen it—she was with me all day.",
        choices: [
          { id: "a", text: "must have" },
          { id: "b", text: "can't have" },
          { id: "c", text: "might" },
          { id: "d", text: "must" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt4",
        kind: "cloze",
        prompt: "They ___ the message. (almost sure they did)",
        choices: [
          { id: "a", text: "might see" },
          { id: "b", text: "must have seen" },
          { id: "c", text: "can't see" },
          { id: "d", text: "must seeing" },
        ],
        correctChoiceId: "b",
      },
    ],
  },
};

const cache: { current: GrammarUnit | null } = { current: null };

export async function getModalDeductionsPastUnit(): Promise<GrammarUnit> {
  return loadGrammarUnitSeed(MODAL_DEDUCTIONS_PAST_RAW, cache);
}

export function getModalDeductionsPastUnitSync(): GrammarUnit {
  return requireCachedGrammarUnit(cache, "Grammar seed");
}
