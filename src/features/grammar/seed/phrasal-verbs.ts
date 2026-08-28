import { LEARNING_LOCALE } from "@/features/learning/types";
import type { GrammarUnit } from "@/features/grammar/types";
import {
  loadGrammarUnitSeed,
  requireCachedGrammarUnit,
  type GrammarUnitSeedRaw,
} from "./load-seed";

const PHRASAL_VERBS_RAW: GrammarUnitSeedRaw = {
  id: "phrasal-verbs",
  slug: "phrasal-verbs",
  title: "Phrasal Verbs: Separable & Inseparable",
  cefrBand: "B1",
  locale: LEARNING_LOCALE,
  strandTags: ["language-focused learning", "meaning-focused input"],
  contentVersion: 1,
  form: {
    focus:
      "Separable, inseparable, and two-particle phrasal verbs and object placement",
    ruleSummary:
      "A phrasal verb is a verb plus a particle that changes the meaning (call vs call off = cancel). Separable verbs allow the object before or after the particle; with a pronoun, you must separate (call it off, not call off it). Inseparable verbs keep verb and particle together. Two-particle verbs are always inseparable—the object follows both particles.",
    patterns: [
      "Separable: verb + object + particle / verb + particle + object",
      "Separable + pronoun: verb + pronoun + particle",
      "Inseparable: verb + particle + object",
      "Two particles: verb + particle + particle + object",
    ],
    examples: [
      {
        id: "ex1",
        sentence: "They called off the meeting. / They called the meeting off.",
        note: "Separable — object can move",
      },
      {
        id: "ex2",
        sentence: "They called it off.",
        note: "Pronoun must come before the particle",
      },
      {
        id: "ex3",
        sentence: "She looks after the baby.",
        note: "Inseparable — keep together",
      },
      {
        id: "ex4",
        sentence: "She came up with a new idea.",
        note: "Two particles — never split",
      },
      {
        id: "ex5",
        sentence: "I look forward to the weekend.",
        note: "Two-particle: look forward to",
      },
    ],
    contrastNote:
      "Separable + pronoun = split it. Inseparable = keep together. Two particles = never split.",
  },
  microTask: {
    id: "mt_phrasal_verbs",
    prompt: "Choose the best American English option for each item.",
    items: [
      {
        id: "mt1",
        kind: "mcq",
        prompt: "They canceled the party. They ___.",
        choices: [
          { id: "a", text: "called off it" },
          { id: "b", text: "called it off" },
          { id: "c", text: "called off them" },
          { id: "d", text: "call it of" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt2",
        kind: "cloze",
        prompt: "She looks ___ her younger brother.",
        choices: [
          { id: "a", text: "after" },
          { id: "b", text: "off" },
          { id: "c", text: "up" },
          { id: "d", text: "down" },
        ],
        correctChoiceId: "a",
      },
      {
        id: "mt3",
        kind: "mcq",
        prompt: "We need to ___ a solution. (think of)",
        choices: [
          { id: "a", text: "come up with" },
          { id: "b", text: "come with up" },
          { id: "c", text: "up come with" },
          { id: "d", text: "come up it with" },
        ],
        correctChoiceId: "a",
      },
      {
        id: "mt4",
        kind: "cloze",
        prompt: "Please fill ___ this form.",
        choices: [
          { id: "a", text: "up" },
          { id: "b", text: "in" },
          { id: "c", text: "on" },
          { id: "d", text: "off" },
        ],
        correctChoiceId: "b",
      },
    ],
  },
};

const cache: { current: GrammarUnit | null } = { current: null };

export async function getPhrasalVerbsUnit(): Promise<GrammarUnit> {
  return loadGrammarUnitSeed(PHRASAL_VERBS_RAW, cache);
}

export function getPhrasalVerbsUnitSync(): GrammarUnit {
  return requireCachedGrammarUnit(cache, "Grammar seed");
}
