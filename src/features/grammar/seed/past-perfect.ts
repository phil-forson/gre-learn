import { LEARNING_LOCALE } from "@/features/learning/types";
import type { GrammarUnit } from "@/features/grammar/types";
import {
  loadGrammarUnitSeed,
  requireCachedGrammarUnit,
  type GrammarUnitSeedRaw,
} from "./load-seed";

const PAST_PERFECT_RAW: GrammarUnitSeedRaw = {
  id: "past-perfect",
  slug: "past-perfect",
  title: "Past Perfect",
  cefrBand: "B1",
  locale: LEARNING_LOCALE,
  strandTags: ["language-focused learning", "meaning-focused input"],
  contentVersion: 1,
  form: {
    focus:
      "Using had + past participle for an earlier past before another past action",
    ruleSummary:
      "The past perfect (had + past participle) shows an action completed before another past action or time. Earlier action = past perfect; later action = past simple. Common adverbs: already, just, never, ever. Do not use the past perfect for a single past event with no second past reference. When order is clear with first, then, before, or after, both clauses can use the past simple.",
    patterns: [
      "Subject + had + past participle",
      "When + past simple, subject + had + past participle",
      "Subject + had + already/just + past participle",
      "… before + subject + had + past participle",
    ],
    examples: [
      {
        id: "ex1",
        sentence: "When the police arrived, the thief had escaped.",
        note: "Earlier action (escaped) before later past (arrived)",
      },
      {
        id: "ex2",
        sentence: "She had finished the project by March.",
        note: "Completed before a past time",
      },
      {
        id: "ex3",
        sentence: "He had already left.",
        note: "already = before that time",
      },
      {
        id: "ex4",
        sentence: "I had never seen snow before.",
        note: "never/ever = at any time before then",
      },
      {
        id: "ex5",
        sentence: "The author died before he had finished the book.",
        note: "before + past perfect can show something unfinished",
      },
    ],
    contrastNote:
      "One past event with no second reference: The Romans spoke Latin — not had spoken. Clear sequence words (first, then) often allow past simple for both actions.",
  },
  microTask: {
    id: "mt_past_perfect",
    prompt: "Choose the best American English option for each item.",
    items: [
      {
        id: "mt1",
        kind: "mcq",
        prompt: "When I got home, they ___ already eaten.",
        choices: [
          { id: "a", text: "have" },
          { id: "b", text: "had" },
          { id: "c", text: "has" },
          { id: "d", text: "were" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt2",
        kind: "cloze",
        prompt: "She ___ left before the meeting started.",
        choices: [
          { id: "a", text: "has just" },
          { id: "b", text: "had just" },
          { id: "c", text: "just had" },
          { id: "d", text: "have just" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt3",
        kind: "mcq",
        prompt: "The Romans ___ Latin. (one past fact)",
        choices: [
          { id: "a", text: "had spoken" },
          { id: "b", text: "spoke" },
          { id: "c", text: "have spoken" },
          { id: "d", text: "were speaking" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt4",
        kind: "cloze",
        prompt: "First I made the salad, then I ___ the bread.",
        choices: [
          { id: "a", text: "had toasted" },
          { id: "b", text: "toasted" },
          { id: "c", text: "have toasted" },
          { id: "d", text: "toast" },
        ],
        correctChoiceId: "b",
      },
    ],
  },
};

const cache: { current: GrammarUnit | null } = { current: null };

export async function getPastPerfectUnit(): Promise<GrammarUnit> {
  return loadGrammarUnitSeed(PAST_PERFECT_RAW, cache);
}

export function getPastPerfectUnitSync(): GrammarUnit {
  return requireCachedGrammarUnit(cache, "Grammar seed");
}
