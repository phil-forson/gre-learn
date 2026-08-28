import { LEARNING_LOCALE } from "@/features/learning/types";
import type { SentenceUnit } from "@/features/sentence/types";
import {
  loadSentenceUnitSeed,
  requireCachedSentenceUnit,
  type SentenceUnitSeedRaw,
} from "./load-seed";

const SENTENCE_PHRASAL_PACKING_RAW: SentenceUnitSeedRaw = {
  id: "sentence-phrasal-packing",
  slug: "sentence-phrasal-packing",
  title: "Sentence Phrasal Packing",
  cefrBand: "B2",
  locale: LEARNING_LOCALE,
  strandTags: ["meaning-focused output","language-focused learning"],
  contentVersion: 1,
  form: {
    focus: "Pack more meaning into fewer words with precise phrases—not denser jargon",
    ruleSummary: "Phrasal packing replaces a long clause with a tight noun or verb phrase when the reader already shares context. Prefer concrete verbs and compact modifiers over empty fillers (in order to basically kind of). Keep one clear subject per sentence.",
    patterns: [
      "Strong verb + object (cut costs vs. make reductions in costs)",
      "Pre-modified noun (same-day delivery)",
      "Reduced relative: the team leading the rollout",
      "Avoid filler stacks: basically / kind of / in terms of",
    ],
    examples: [
      {
        id: "ex1",
        sentence: "We cut costs by 12% this quarter.",
        note: "Strong verb packing",
      },
      {
        id: "ex2",
        sentence: "Same-day delivery raised conversion.",
        note: "Pre-modified noun",
      },
      {
        id: "ex3",
        sentence: "The team leading the rollout meets daily.",
        note: "Reduced relative",
      },
      {
        id: "ex4",
        sentence: "She outlined three risks and one mitigation.",
        note: "Parallel packing",
      }
    ],
    contrastNote: "Loose: We made a reduction in the amount of costs. Packed: We cut costs.",
  },
  microTask: {
    id: "mt_sentence_phrasal_packing",
    prompt: "Choose the tighter, clearer wording.",
    items: [
      {
        id: "mt1",
        kind: "mcq",
        prompt: "Tightest version?",
        choices: [
          { id: "a", text: "We made improvements to the speed of the app." },
          { id: "b", text: "We sped up the app." },
          { id: "c", text: "We basically kind of improved app speed things." },
          { id: "d", text: "Improvements were made by us to speed." },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt2",
        kind: "cloze",
        prompt: "The engineer ___ the migration works nights.",
        choices: [
          { id: "a", text: "leading" },
          { id: "b", text: "who leading" },
          { id: "c", text: "leads which" },
          { id: "d", text: "is lead" },
        ],
        correctChoiceId: "a",
      },
      {
        id: "mt3",
        kind: "mcq",
        prompt: "Best packing?",
        choices: [
          { id: "a", text: "In terms of latency, there was a reduction that occurred." },
          { id: "b", text: "Latency fell." },
          { id: "c", text: "Latency, in terms of it, fell kind of." },
          { id: "d", text: "There was falling of latency that we did." },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt4",
        kind: "cloze",
        prompt: "Prefer ___ over \"make a decision about\".",
        choices: [
          { id: "a", text: "decide" },
          { id: "b", text: "do decision" },
          { id: "c", text: "decisionize" },
          { id: "d", text: "be deciding of" },
        ],
        correctChoiceId: "a",
      }
    ],
  },
};

const cache: { current: SentenceUnit | null } = { current: null };

export async function getSentencePhrasalPackingUnit(): Promise<SentenceUnit> {
  return loadSentenceUnitSeed(SENTENCE_PHRASAL_PACKING_RAW, cache);
}

export function getSentencePhrasalPackingUnitSync(): SentenceUnit {
  return requireCachedSentenceUnit(cache, "Sentence seed");
}

export { sentenceUnitHashParts } from "./hash";
