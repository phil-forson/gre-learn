import { LEARNING_LOCALE } from "@/features/learning/types";
import type { GrammarUnit } from "@/features/grammar/types";
import {
  loadGrammarUnitSeed,
  requireCachedGrammarUnit,
  type GrammarUnitSeedRaw,
} from "./load-seed";

const PRESENT_PERFECT_RESULT_RAW: GrammarUnitSeedRaw = {
  id: "present-perfect-result",
  slug: "present-perfect-result",
  title: "Present Perfect: Result & Time Adverbs",
  cefrBand: "A2",
  locale: LEARNING_LOCALE,
  strandTags: ["language-focused learning", "meaning-focused input"],
  contentVersion: 1,
  form: {
    focus:
      "Present perfect for present results and the adverbs just, already, and yet",
    ruleSummary:
      "Use the present perfect when a past action has an important result now. Place just and already between have/has and the past participle. Use yet mainly in questions and negatives, usually at the end. Use the simple past with a finished past time (last year, yesterday)—not the present perfect.",
    patterns: [
      "Subject + have/has + past participle (present result)",
      "Subject + have/has + just + past participle",
      "Subject + have/has + already + past participle",
      "Have/Has + subject + past participle + yet?",
      "Subject + have/has + not + past participle + yet",
    ],
    examples: [
      {
        id: "ex1",
        sentence: "He has broken his leg, so he can't walk.",
        note: "Past action with a clear result now",
      },
      {
        id: "ex2",
        sentence: "My phone has run out of battery.",
        note: "Result that matters in the present",
      },
      {
        id: "ex3",
        sentence: "She has just arrived.",
        note: "just = very recently",
      },
      {
        id: "ex4",
        sentence: "I've already finished.",
        note: "already = sooner than expected",
      },
      {
        id: "ex5",
        sentence: "Have you called yet?",
        note: "yet = until now, in questions/negatives",
      },
    ],
    contrastNote:
      "Simple past with finished time: I visited Rome last year. Not: I have visited Rome last year.",
  },
  microTask: {
    id: "mt_present_perfect_result",
    prompt: "Choose the best American English option for each item.",
    items: [
      {
        id: "mt1",
        kind: "mcq",
        prompt: "She ___ just arrived.",
        choices: [
          { id: "a", text: "has" },
          { id: "b", text: "have" },
          { id: "c", text: "did" },
          { id: "d", text: "was" },
        ],
        correctChoiceId: "a",
      },
      {
        id: "mt2",
        kind: "cloze",
        prompt: "I've ___ finished my homework.",
        choices: [
          { id: "a", text: "yet" },
          { id: "b", text: "already" },
          { id: "c", text: "ago" },
          { id: "d", text: "yesterday" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt3",
        kind: "mcq",
        prompt: "Have you called ___?",
        choices: [
          { id: "a", text: "already" },
          { id: "b", text: "just" },
          { id: "c", text: "yet" },
          { id: "d", text: "since" },
        ],
        correctChoiceId: "c",
      },
      {
        id: "mt4",
        kind: "cloze",
        prompt: "I ___ Rome last year.",
        choices: [
          { id: "a", text: "have visited" },
          { id: "b", text: "visited" },
          { id: "c", text: "have visit" },
          { id: "d", text: "am visiting" },
        ],
        correctChoiceId: "b",
      },
    ],
  },
};

const cache: { current: GrammarUnit | null } = { current: null };

export async function getPresentPerfectResultUnit(): Promise<GrammarUnit> {
  return loadGrammarUnitSeed(PRESENT_PERFECT_RESULT_RAW, cache);
}

export function getPresentPerfectResultUnitSync(): GrammarUnit {
  return requireCachedGrammarUnit(cache, "Grammar seed");
}
