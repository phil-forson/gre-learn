import { LEARNING_LOCALE } from "@/features/learning/types";
import type { GrammarUnit } from "@/features/grammar/types";
import {
  loadGrammarUnitSeed,
  requireCachedGrammarUnit,
  type GrammarUnitSeedRaw,
} from "./load-seed";

const FUTURE_FORMS_RAW: GrammarUnitSeedRaw = {
  id: "future-forms",
  slug: "future-forms",
  title: "Future Forms: Will, Going To, Present Continuous",
  cefrBand: "A2",
  locale: LEARNING_LOCALE,
  strandTags: ["language-focused learning", "meaning-focused input"],
  contentVersion: 1,
  form: {
    focus:
      "Choosing will, be going to, or present continuous for future meaning",
    ruleSummary:
      "Use will for a decision made at the moment of speaking. Use be going to for an intention or plan decided earlier. Use the present continuous for a confirmed arrangement with a set time. All three talk about the future, but the reason for choosing each form is different.",
    patterns: [
      "Subject + will + base verb (decision now)",
      "Subject + am/is/are + going to + base verb (intention)",
      "Subject + am/is/are + verb-ing (arranged plan)",
      "Will + subject + base verb…?",
    ],
    examples: [
      {
        id: "ex1",
        sentence: "I'll call Mom.",
        note: "will — decision made now",
      },
      {
        id: "ex2",
        sentence: "I'm going to call Mom.",
        note: "going to — intention decided earlier",
      },
      {
        id: "ex3",
        sentence: "I'm meeting Mom at 8 o'clock.",
        note: "present continuous — confirmed arrangement",
      },
      {
        id: "ex4",
        sentence: "Look at those clouds—it's going to rain.",
        note: "going to — prediction from present evidence",
      },
    ],
    contrastNote:
      "Will = decision now. Going to = intention or earlier plan. Present continuous = confirmed arrangement.",
  },
  microTask: {
    id: "mt_future_forms",
    prompt: "Choose the best American English option for each item.",
    items: [
      {
        id: "mt1",
        kind: "mcq",
        prompt:
          "The phone is ringing. Okay, I ___ get it.",
        choices: [
          { id: "a", text: "am going to" },
          { id: "b", text: "'ll" },
          { id: "c", text: "am meeting" },
          { id: "d", text: "going to" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt2",
        kind: "cloze",
        prompt: "We ___ visit Grandma this weekend. We planned it last week.",
        choices: [
          { id: "a", text: "will" },
          { id: "b", text: "are going to" },
          { id: "c", text: "going" },
          { id: "d", text: "would" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt3",
        kind: "mcq",
        prompt: "I ___ dinner with Sam at 7. The reservation is booked.",
        choices: [
          { id: "a", text: "will have" },
          { id: "b", text: "am having" },
          { id: "c", text: "have" },
          { id: "d", text: "had" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt4",
        kind: "cloze",
        prompt: "Decision now → ___. Earlier intention → going to.",
        choices: [
          { id: "a", text: "present continuous" },
          { id: "b", text: "will" },
          { id: "c", text: "past simple" },
          { id: "d", text: "must" },
        ],
        correctChoiceId: "b",
      },
    ],
  },
};

const cache: { current: GrammarUnit | null } = { current: null };

export async function getFutureFormsUnit(): Promise<GrammarUnit> {
  return loadGrammarUnitSeed(FUTURE_FORMS_RAW, cache);
}

export function getFutureFormsUnitSync(): GrammarUnit {
  return requireCachedGrammarUnit(cache, "Grammar seed");
}
