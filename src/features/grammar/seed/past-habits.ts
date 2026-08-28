import { LEARNING_LOCALE } from "@/features/learning/types";
import type { GrammarUnit } from "@/features/grammar/types";
import {
  loadGrammarUnitSeed,
  requireCachedGrammarUnit,
  type GrammarUnitSeedRaw,
} from "./load-seed";

const PAST_HABITS_RAW: GrammarUnitSeedRaw = {
  id: "past-habits",
  slug: "past-habits",
  title: "Past Habits: Used To, Would, Past Simple",
  cefrBand: "B1",
  locale: LEARNING_LOCALE,
  strandTags: ["language-focused learning", "meaning-focused input"],
  contentVersion: 1,
  form: {
    focus:
      "Talking about past habits and states with used to, would, and the past simple",
    ruleSummary:
      "Used to + base verb describes past habits or states that are no longer true (didn't use to / Did you use to…?). Would + base verb describes repeated past actions, often in stories—not past states. The past simple covers habits, states, or finished actions, and is required for something that happened only once.",
    patterns: [
      "Subject + used to + base verb",
      "Subject + didn't use to + base verb",
      "Did + subject + use to + base verb…?",
      "Subject + would + base verb (repeated past actions)",
      "Subject + past simple (any past event)",
    ],
    examples: [
      {
        id: "ex1",
        sentence: "I used to play tennis.",
        note: "Past habit that is no longer true",
      },
      {
        id: "ex2",
        sentence: "She used to live in London.",
        note: "Past state — used to works; would does not",
      },
      {
        id: "ex3",
        sentence: "Every summer, we would visit the seaside.",
        note: "would — repeated past actions in a story",
      },
      {
        id: "ex4",
        sentence: "I went to Egypt in 2014.",
        note: "One-time past event — past simple only",
      },
    ],
    contrastNote:
      "Used to = past habits or states. Would = repeated actions only. Past simple = any past event, including one-time events.",
  },
  microTask: {
    id: "mt_past_habits",
    prompt: "Choose the best American English option for each item.",
    items: [
      {
        id: "mt1",
        kind: "mcq",
        prompt: "I ___ know him when we were kids. (past state)",
        choices: [
          { id: "a", text: "would" },
          { id: "b", text: "used to" },
          { id: "c", text: "use to" },
          { id: "d", text: "will" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt2",
        kind: "cloze",
        prompt: "Did you ___ have a bike?",
        choices: [
          { id: "a", text: "used to" },
          { id: "b", text: "use to" },
          { id: "c", text: "would" },
          { id: "d", text: "using to" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt3",
        kind: "mcq",
        prompt: "Every Friday we ___ go to the movies. (story habit)",
        choices: [
          { id: "a", text: "would" },
          { id: "b", text: "will" },
          { id: "c", text: "are used to" },
          { id: "d", text: "use" },
        ],
        correctChoiceId: "a",
      },
      {
        id: "mt4",
        kind: "cloze",
        prompt: "I ___ to Paris only once, in 2019.",
        choices: [
          { id: "a", text: "used to go" },
          { id: "b", text: "would go" },
          { id: "c", text: "went" },
          { id: "d", text: "go" },
        ],
        correctChoiceId: "c",
      },
    ],
  },
};

const cache: { current: GrammarUnit | null } = { current: null };

export async function getPastHabitsUnit(): Promise<GrammarUnit> {
  return loadGrammarUnitSeed(PAST_HABITS_RAW, cache);
}

export function getPastHabitsUnitSync(): GrammarUnit {
  return requireCachedGrammarUnit(cache, "Grammar seed");
}
