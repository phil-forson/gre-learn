import { LEARNING_LOCALE } from "@/features/learning/types";
import type { GrammarUnit } from "@/features/grammar/types";
import {
  loadGrammarUnitSeed,
  requireCachedGrammarUnit,
  type GrammarUnitSeedRaw,
} from "./load-seed";

const MODAL_DEDUCTIONS_PRESENT_RAW: GrammarUnitSeedRaw = {
  id: "modal-deductions-present",
  slug: "modal-deductions-present",
  title: "Present & Future Deductions",
  cefrBand: "B1",
  locale: LEARNING_LOCALE,
  strandTags: ["language-focused learning", "meaning-focused input"],
  contentVersion: 1,
  form: {
    focus:
      "Guessing what is true now or may be true with must, might/may/could, and can't",
    ruleSummary:
      "Use modal + base verb (no to) to make deductions about the present or future. Must = almost certain. Might, may, or could = possible but uncertain (may is slightly more formal). Can't = almost certainly impossible. These are guesses based on evidence, not facts you know for sure.",
    patterns: [
      "Subject + must + base verb (almost certain)",
      "Subject + might/may/could + base verb (possible)",
      "Subject + can't + base verb (almost impossible)",
      "That can't be…",
    ],
    examples: [
      {
        id: "ex1",
        sentence: "She must be tired.",
        note: "must — almost certain",
      },
      {
        id: "ex2",
        sentence: "He might be at work.",
        note: "might — possible but uncertain",
      },
      {
        id: "ex3",
        sentence: "That can't be her—she is abroad.",
        note: "can't — almost certainly impossible",
      },
      {
        id: "ex4",
        sentence: "They could arrive late tonight.",
        note: "could — possible future deduction",
      },
    ],
    contrastNote:
      "Must = sure. Might/may/could = possible. Can't = impossible. Structure: modal + base verb — no to.",
  },
  microTask: {
    id: "mt_modal_deductions_present",
    prompt: "Choose the best American English option for each item.",
    items: [
      {
        id: "mt1",
        kind: "mcq",
        prompt: "The lights are on. Someone ___ be home.",
        choices: [
          { id: "a", text: "can't" },
          { id: "b", text: "must" },
          { id: "c", text: "mustn't" },
          { id: "d", text: "don't" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt2",
        kind: "cloze",
        prompt: "I'm not sure. She ___ be stuck in traffic.",
        choices: [
          { id: "a", text: "must to" },
          { id: "b", text: "might" },
          { id: "c", text: "can't to" },
          { id: "d", text: "is must" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt3",
        kind: "mcq",
        prompt: "That ___ be his car—he sold it last month.",
        choices: [
          { id: "a", text: "must" },
          { id: "b", text: "can't" },
          { id: "c", text: "might" },
          { id: "d", text: "may" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt4",
        kind: "cloze",
        prompt: "Correct structure: She must ___ tired.",
        choices: [
          { id: "a", text: "to be" },
          { id: "b", text: "be" },
          { id: "c", text: "being" },
          { id: "d", text: "is" },
        ],
        correctChoiceId: "b",
      },
    ],
  },
};

const cache: { current: GrammarUnit | null } = { current: null };

export async function getModalDeductionsPresentUnit(): Promise<GrammarUnit> {
  return loadGrammarUnitSeed(MODAL_DEDUCTIONS_PRESENT_RAW, cache);
}

export function getModalDeductionsPresentUnitSync(): GrammarUnit {
  return requireCachedGrammarUnit(cache, "Grammar seed");
}
