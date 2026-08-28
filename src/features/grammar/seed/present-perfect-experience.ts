import { LEARNING_LOCALE } from "@/features/learning/types";
import type { GrammarUnit } from "@/features/grammar/types";
import {
  loadGrammarUnitSeed,
  requireCachedGrammarUnit,
  type GrammarUnitSeedRaw,
} from "./load-seed";

/**
 * Curated AmE A2 Present Perfect (experience / unfinished time).
 * OpenAI is out of scope for Phase 2 — hand-authored seed only.
 */
const PRESENT_PERFECT_EXPERIENCE_RAW: GrammarUnitSeedRaw = {
  id: "present-perfect-experience",
  slug: "present-perfect-experience",
  title: "Present Perfect: Experience & Unfinished Time",
  cefrBand: "A2",
  locale: LEARNING_LOCALE,
  strandTags: ["language-focused learning", "meaning-focused input"],
  contentVersion: 1,
  form: {
    focus: "Talking about life experience and unfinished time with have/has + past participle",
    ruleSummary:
      "Use the present perfect (have/has + past participle) for experience up to now and for situations that started in the past and are still true. Do not use a finished past time word like yesterday with this meaning.",
    patterns: [
      "Have/Has + subject + past participle…?",
      "Subject + have/has + past participle…",
      "… for + period of time",
      "… since + starting point",
    ],
    examples: [
      {
        id: "ex1",
        sentence: "Have you ever visited New York?",
        note: "Life experience — no finished time mentioned",
      },
      {
        id: "ex2",
        sentence: "I've already eaten lunch.",
        note: "Result that matters now",
      },
      {
        id: "ex3",
        sentence: "She has lived here since 2019.",
        note: "Unfinished time — she still lives here",
      },
      {
        id: "ex4",
        sentence: "We have known each other for ten years.",
        note: "Unfinished time — for + duration",
      },
    ],
    contrastNote:
      "Simple past needs a finished time: I visited New York last year. Present perfect does not: I have visited New York.",
  },
  microTask: {
    id: "mt_present_perfect_experience",
    prompt: "Choose the best American English option for each item.",
    items: [
      {
        id: "mt1",
        kind: "mcq",
        prompt: "___ you ever tried sushi?",
        choices: [
          { id: "a", text: "Did" },
          { id: "b", text: "Have" },
          { id: "c", text: "Has" },
          { id: "d", text: "Are" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt2",
        kind: "cloze",
        prompt: "She ___ lived in Chicago for five years.",
        choices: [
          { id: "a", text: "have" },
          { id: "b", text: "has" },
          { id: "c", text: "had" },
          { id: "d", text: "is" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt3",
        kind: "mcq",
        prompt: "I've worked here ___ 2020.",
        choices: [
          { id: "a", text: "for" },
          { id: "b", text: "since" },
          { id: "c", text: "during" },
          { id: "d", text: "ago" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt4",
        kind: "cloze",
        prompt: "They have known each other ___ a long time.",
        choices: [
          { id: "a", text: "since" },
          { id: "b", text: "for" },
          { id: "c", text: "from" },
          { id: "d", text: "at" },
        ],
        correctChoiceId: "b",
      },
    ],
  },
  knowledgeTest: {
    id: "kt_present_perfect_experience",
    title: "Knowledge check",
    prompt: "Choose the best American English option for each item.",
    items: [
      {
        id: "kt1",
        kind: "mcq",
        prompt: "___ you ever been to California?",
        choices: [
          { id: "a", text: "Did" },
          { id: "b", text: "Have" },
          { id: "c", text: "Has" },
          { id: "d", text: "Were" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "kt2",
        kind: "cloze",
        prompt: "He ___ finished his homework yet.",
        choices: [
          { id: "a", text: "didn't" },
          { id: "b", text: "hasn't" },
          { id: "c", text: "isn't" },
          { id: "d", text: "wasn't" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "kt3",
        kind: "mcq",
        prompt: "We've lived in this apartment ___ three years.",
        choices: [
          { id: "a", text: "since" },
          { id: "b", text: "for" },
          { id: "c", text: "from" },
          { id: "d", text: "during" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "kt4",
        kind: "cloze",
        prompt: "I have known Maria ___ we were kids.",
        choices: [
          { id: "a", text: "for" },
          { id: "b", text: "since" },
          { id: "c", text: "ago" },
          { id: "d", text: "until" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "kt5",
        kind: "error_correction",
        prompt: "Fix the error: I have seen that movie yesterday.",
        choices: [
          { id: "a", text: "I have seen that movie yesterday." },
          { id: "b", text: "I saw that movie yesterday." },
          { id: "c", text: "I am seeing that movie yesterday." },
          { id: "d", text: "I see that movie yesterday." },
        ],
        correctChoiceId: "b",
      },
      {
        id: "kt6",
        kind: "mcq",
        prompt: "___ she ever tried rock climbing?",
        choices: [
          { id: "a", text: "Have" },
          { id: "b", text: "Has" },
          { id: "c", text: "Did" },
          { id: "d", text: "Does" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "kt7",
        kind: "cloze",
        prompt: "They ___ already left for the airport.",
        choices: [
          { id: "a", text: "have" },
          { id: "b", text: "has" },
          { id: "c", text: "had" },
          { id: "d", text: "are" },
        ],
        correctChoiceId: "a",
      },
      {
        id: "kt8",
        kind: "error_correction",
        prompt: "Fix the error: She lives here since 2018.",
        choices: [
          { id: "a", text: "She lives here since 2018." },
          { id: "b", text: "She has lived here since 2018." },
          { id: "c", text: "She lived here since 2018." },
          { id: "d", text: "She is living here since 2018." },
        ],
        correctChoiceId: "b",
      },
      {
        id: "kt9",
        kind: "mcq",
        prompt: "Have you ___ finished the report?",
        choices: [
          { id: "a", text: "yet" },
          { id: "b", text: "already" },
          { id: "c", text: "still" },
          { id: "d", text: "ago" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "kt10",
        kind: "error_correction",
        prompt: "Fix the error: Did you ever visit Boston?",
        choices: [
          { id: "a", text: "Did you ever visit Boston?" },
          { id: "b", text: "Have you ever visited Boston?" },
          { id: "c", text: "Do you ever visit Boston?" },
          { id: "d", text: "Are you ever visiting Boston?" },
        ],
        correctChoiceId: "b",
      },
    ],
  },
};

const cache: { current: GrammarUnit | null } = { current: null };

export async function getPresentPerfectExperienceUnit(): Promise<GrammarUnit> {
  return loadGrammarUnitSeed(PRESENT_PERFECT_EXPERIENCE_RAW, cache);
}

/** Sync accessor after first async load — throws if not yet warmed. */
export function getPresentPerfectExperienceUnitSync(): GrammarUnit {
  return requireCachedGrammarUnit(cache, "Grammar seed");
}

/** Re-export for tests that previously imported hash parts from this module. */
export { grammarUnitHashParts } from "./hash";
