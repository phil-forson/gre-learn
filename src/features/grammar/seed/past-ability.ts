import { LEARNING_LOCALE } from "@/features/learning/types";
import type { GrammarUnit } from "@/features/grammar/types";
import {
  loadGrammarUnitSeed,
  requireCachedGrammarUnit,
  type GrammarUnitSeedRaw,
} from "./load-seed";

const PAST_ABILITY_RAW: GrammarUnitSeedRaw = {
  id: "past-ability",
  slug: "past-ability",
  title: "Past Ability: Could, Was Able To, Managed To",
  cefrBand: "B1",
  locale: LEARNING_LOCALE,
  strandTags: ["language-focused learning", "meaning-focused input"],
  contentVersion: 1,
  form: {
    focus:
      "General past ability versus success on a specific occasion",
    ruleSummary:
      "Could / couldn't express general ability in the past. For one successful occasion, prefer was/were able to or managed to (especially for something difficult). Do not normally use positive could for one specific successful event. For one unsuccessful occasion, couldn't, wasn't able to, or didn't manage to all work, with slight differences in formality and effort.",
    patterns: [
      "Subject + could / couldn't + base verb (general ability)",
      "Subject + was/were able to + base verb (specific success)",
      "Subject + managed to + base verb (difficult success)",
      "Subject + didn't manage to + base verb (tried but failed)",
    ],
    examples: [
      {
        id: "ex1",
        sentence: "She could read at four.",
        note: "General ability in the past",
      },
      {
        id: "ex2",
        sentence: "He was able to finish the race.",
        note: "Success on a specific occasion",
      },
      {
        id: "ex3",
        sentence: "She managed to open the locked door.",
        note: "Succeeded in something difficult",
      },
      {
        id: "ex4",
        sentence: "They didn't manage to solve the problem.",
        note: "Tried but failed",
      },
    ],
    contrastNote:
      "Could = general ability. Was able to = specific success. Managed to = difficult success. Avoid positive could for one specific success.",
  },
  microTask: {
    id: "mt_past_ability",
    prompt: "Choose the best American English option for each item.",
    items: [
      {
        id: "mt1",
        kind: "mcq",
        prompt: "As a child, I ___ swim well. (general ability)",
        choices: [
          { id: "a", text: "managed to" },
          { id: "b", text: "could" },
          { id: "c", text: "was manage" },
          { id: "d", text: "can" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt2",
        kind: "cloze",
        prompt: "After three tries, she ___ open the jar.",
        choices: [
          { id: "a", text: "could" },
          { id: "b", text: "managed to" },
          { id: "c", text: "can" },
          { id: "d", text: "manage" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt3",
        kind: "mcq",
        prompt: "We ___ travel because the airport closed.",
        choices: [
          { id: "a", text: "weren't able to" },
          { id: "b", text: "could" },
          { id: "c", text: "managed to" },
          { id: "d", text: "was able to" },
        ],
        correctChoiceId: "a",
      },
      {
        id: "mt4",
        kind: "cloze",
        prompt: "Positive ___ is unusual for one specific past success.",
        choices: [
          { id: "a", text: "managed to" },
          { id: "b", text: "was able to" },
          { id: "c", text: "could" },
          { id: "d", text: "didn't manage to" },
        ],
        correctChoiceId: "c",
      },
    ],
  },
};

const cache: { current: GrammarUnit | null } = { current: null };

export async function getPastAbilityUnit(): Promise<GrammarUnit> {
  return loadGrammarUnitSeed(PAST_ABILITY_RAW, cache);
}

export function getPastAbilityUnitSync(): GrammarUnit {
  return requireCachedGrammarUnit(cache, "Grammar seed");
}
