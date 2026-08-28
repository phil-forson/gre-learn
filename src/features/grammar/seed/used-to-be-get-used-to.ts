import { LEARNING_LOCALE } from "@/features/learning/types";
import type { GrammarUnit } from "@/features/grammar/types";
import {
  loadGrammarUnitSeed,
  requireCachedGrammarUnit,
  type GrammarUnitSeedRaw,
} from "./load-seed";

const USED_TO_BE_GET_USED_TO_RAW: GrammarUnitSeedRaw = {
  id: "used-to-be-get-used-to",
  slug: "used-to-be-get-used-to",
  title: "Used To / Be Used To / Get Used To",
  cefrBand: "B1",
  locale: LEARNING_LOCALE,
  strandTags: ["language-focused learning", "meaning-focused input"],
  contentVersion: 1,
  form: {
    focus:
      "Contrasting used to + verb with be used to and get used to + noun/-ing",
    ruleSummary:
      "Used to + base verb means a past habit that is no longer true. Be used to + noun or -ing means something is familiar or normal now. Get used to + noun or -ing means becoming familiar with something. Do not confuse the past-habit form with the familiarity forms—they take different complements.",
    patterns: [
      "Subject + used to + base verb (past habit)",
      "Subject + am/is/are + used to + noun/-ing (familiar)",
      "Subject + get/getting + used to + noun/-ing (becoming familiar)",
      "Subject + was/were + used to + noun/-ing",
    ],
    examples: [
      {
        id: "ex1",
        sentence: "I used to play football.",
        note: "Past habit — no longer true",
      },
      {
        id: "ex2",
        sentence: "I'm used to waking up early.",
        note: "be used to + -ing — familiar/normal",
      },
      {
        id: "ex3",
        sentence: "I'm getting used to my new job.",
        note: "get used to — becoming familiar",
      },
      {
        id: "ex4",
        sentence: "She's used to the cold weather.",
        note: "be used to + noun",
      },
    ],
    contrastNote:
      "Used to + verb = past habit. Be/get used to + noun/-ing = familiarity (not a past-habit structure).",
  },
  microTask: {
    id: "mt_used_to_be_get_used_to",
    prompt: "Choose the best American English option for each item.",
    items: [
      {
        id: "mt1",
        kind: "mcq",
        prompt: "I ___ smoke, but I quit years ago.",
        choices: [
          { id: "a", text: "am used to" },
          { id: "b", text: "used to" },
          { id: "c", text: "get used to" },
          { id: "d", text: "use to" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt2",
        kind: "cloze",
        prompt: "Don't worry—you'll ___ the noise.",
        choices: [
          { id: "a", text: "used to" },
          { id: "b", text: "get used to" },
          { id: "c", text: "be use to" },
          { id: "d", text: "using to" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt3",
        kind: "mcq",
        prompt: "He is used to ___ long hours.",
        choices: [
          { id: "a", text: "work" },
          { id: "b", text: "working" },
          { id: "c", text: "worked" },
          { id: "d", text: "works" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt4",
        kind: "cloze",
        prompt: "She ___ living alone now. It feels normal.",
        choices: [
          { id: "a", text: "used to" },
          { id: "b", text: "is used to" },
          { id: "c", text: "use to" },
          { id: "d", text: "gets use to" },
        ],
        correctChoiceId: "b",
      },
    ],
  },
};

const cache: { current: GrammarUnit | null } = { current: null };

export async function getUsedToBeGetUsedToUnit(): Promise<GrammarUnit> {
  return loadGrammarUnitSeed(USED_TO_BE_GET_USED_TO_RAW, cache);
}

export function getUsedToBeGetUsedToUnitSync(): GrammarUnit {
  return requireCachedGrammarUnit(cache, "Grammar seed");
}
