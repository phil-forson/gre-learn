import { LEARNING_LOCALE } from "@/features/learning/types";
import type { SentenceUnit } from "@/features/sentence/types";
import {
  loadSentenceUnitSeed,
  requireCachedSentenceUnit,
  type SentenceUnitSeedRaw,
} from "./load-seed";

const SENTENCE_COMBINING_CLARITY_RAW: SentenceUnitSeedRaw = {
  id: "sentence-combining-clarity",
  slug: "sentence-combining-clarity",
  title: "Sentence Combining for Clarity",
  cefrBand: "B1",
  locale: LEARNING_LOCALE,
  strandTags: ["meaning-focused output","language-focused learning"],
  contentVersion: 1,
  form: {
    focus: "Combine short clauses into one clear sentence without losing meaning",
    ruleSummary: "When two short sentences share a subject or idea, combine them with a coordinator (and, but, so) or a relative clause so the reader gets one complete thought. Keep the main idea first; put supporting detail after it.",
    patterns: [
      "Clause + and/but/so + clause",
      "Noun + relative clause (who/that/which…)",
      "Because / when + clause, main clause",
    ],
    examples: [
      {
        id: "ex1",
        sentence: "The report was late, so the team revised the timeline.",
        note: "Cause → result in one sentence",
      },
      {
        id: "ex2",
        sentence: "Maya, who leads design, presented the mockups.",
        note: "Relative clause adds identity",
      },
      {
        id: "ex3",
        sentence: "When the data arrived, we updated the chart.",
        note: "Time clause before main action",
      },
      {
        id: "ex4",
        sentence: "The draft is short but clear.",
        note: "Contrast without a second sentence",
      }
    ],
    contrastNote: "Choppy: The draft is short. The draft is clear. Combined: The draft is short but clear.",
  },
  microTask: {
    id: "mt_sentence_combining_clarity",
    prompt: "Choose the clearest American English combination.",
    items: [
      {
        id: "mt1",
        kind: "mcq",
        prompt: "Best combine: \"The meeting ended. Nobody asked questions.\"",
        choices: [
          { id: "a", text: "The meeting ended, and nobody asked questions." },
          { id: "b", text: "The meeting ended nobody asked questions." },
          { id: "c", text: "Ended the meeting, nobody asked." },
          { id: "d", text: "The meeting ending nobody asked questions." },
        ],
        correctChoiceId: "a",
      },
      {
        id: "mt2",
        kind: "cloze",
        prompt: "She finished early ___ she started at dawn.",
        choices: [
          { id: "a", text: "because" },
          { id: "b", text: "despite" },
          { id: "c", text: "unless" },
          { id: "d", text: "although so" },
        ],
        correctChoiceId: "a",
      },
      {
        id: "mt3",
        kind: "mcq",
        prompt: "Clearest version?",
        choices: [
          { id: "a", text: "The app crashed. Users complained. Support replied." },
          { id: "b", text: "After the app crashed and users complained, support replied." },
          { id: "c", text: "The app crashed users complained support replied." },
          { id: "d", text: "Crashing, complaining, support replied the app." },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt4",
        kind: "cloze",
        prompt: "The engineer ___ fixed the bug works remotely.",
        choices: [
          { id: "a", text: "who" },
          { id: "b", text: "which" },
          { id: "c", text: "whose" },
          { id: "d", text: "whom that" },
        ],
        correctChoiceId: "a",
      }
    ],
  },
};

const cache: { current: SentenceUnit | null } = { current: null };

export async function getSentenceCombiningClarityUnit(): Promise<SentenceUnit> {
  return loadSentenceUnitSeed(SENTENCE_COMBINING_CLARITY_RAW, cache);
}

export function getSentenceCombiningClarityUnitSync(): SentenceUnit {
  return requireCachedSentenceUnit(cache, "Sentence seed");
}

export { sentenceUnitHashParts } from "./hash";
