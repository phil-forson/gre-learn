import { LEARNING_LOCALE } from "@/features/learning/types";
import type { SentenceUnit } from "@/features/sentence/types";
import {
  loadSentenceUnitSeed,
  requireCachedSentenceUnit,
  type SentenceUnitSeedRaw,
} from "./load-seed";

const CONCESSION_COUNTERFLOW_RAW: SentenceUnitSeedRaw = {
  id: "concession-counterflow",
  slug: "concession-counterflow",
  title: "Concession & Counterflow",
  cefrBand: "B2",
  locale: LEARNING_LOCALE,
  strandTags: ["meaning-focused output","language-focused learning"],
  contentVersion: 1,
  form: {
    focus: "Concede a point, then steer the sentence toward your main claim",
    ruleSummary: "Concession markers (although, even though, despite, while) admit a counterpoint without abandoning your thesis. Put the concession in a subordinate clause and keep the main claim in the main clause so the reader feels the counterflow.",
    patterns: [
      "Although / even though + concession, main claim",
      "Despite / in spite of + noun, main claim",
      "While X is true, Y still holds",
      "Admittedly… Still…",
    ],
    examples: [
      {
        id: "ex1",
        sentence: "Although the demo was rough, the idea landed well.",
        note: "Concede → claim",
      },
      {
        id: "ex2",
        sentence: "Despite the delay, we hit the quarterly target.",
        note: "Noun concession",
      },
      {
        id: "ex3",
        sentence: "While the UI is simple, the backend is complex.",
        note: "Balanced counterflow",
      },
      {
        id: "ex4",
        sentence: "Admittedly costs rose. Still, retention improved.",
        note: "Spoken-to-written concession pair",
      }
    ],
    contrastNote: "Although contrasts without canceling the main clause. Do not write Although X, but Y.",
  },
  microTask: {
    id: "mt_concession_counterflow",
    prompt: "Choose the natural concession pattern.",
    items: [
      {
        id: "mt1",
        kind: "mcq",
        prompt: "Correct concession?",
        choices: [
          { id: "a", text: "Although the budget is tight, but we will ship." },
          { id: "b", text: "Although the budget is tight, we will ship." },
          { id: "c", text: "Despite the budget is tight, we will ship." },
          { id: "d", text: "Even though tight budget we will shipping." },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt2",
        kind: "cloze",
        prompt: "___ the noise, she finished the draft.",
        choices: [
          { id: "a", text: "Despite" },
          { id: "b", text: "Although" },
          { id: "c", text: "Because" },
          { id: "d", text: "So that" },
        ],
        correctChoiceId: "a",
      },
      {
        id: "mt3",
        kind: "mcq",
        prompt: "Best counterflow?",
        choices: [
          { id: "a", text: "While the feature is popular, support tickets remain high." },
          { id: "b", text: "While the feature is popular and support tickets remain high." },
          { id: "c", text: "Although popular the feature, support high tickets." },
          { id: "d", text: "Despite popular, although tickets high." },
        ],
        correctChoiceId: "a",
      },
      {
        id: "mt4",
        kind: "cloze",
        prompt: "___ the risks, the board approved the pilot.",
        choices: [
          { id: "a", text: "Even though" },
          { id: "b", text: "In spite of" },
          { id: "c", text: "So that" },
          { id: "d", text: "In addition" },
        ],
        correctChoiceId: "b",
      }
    ],
  },
};

const cache: { current: SentenceUnit | null } = { current: null };

export async function getConcessionCounterflowUnit(): Promise<SentenceUnit> {
  return loadSentenceUnitSeed(CONCESSION_COUNTERFLOW_RAW, cache);
}

export function getConcessionCounterflowUnitSync(): SentenceUnit {
  return requireCachedSentenceUnit(cache, "Sentence seed");
}

export { sentenceUnitHashParts } from "./hash";
