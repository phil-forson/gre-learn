import { LEARNING_LOCALE } from "@/features/learning/types";
import type { GrammarUnit } from "@/features/grammar/types";
import {
  loadGrammarUnitSeed,
  requireCachedGrammarUnit,
  type GrammarUnitSeedRaw,
} from "./load-seed";

const MODALS_PERMISSION_OBLIGATION_RAW: GrammarUnitSeedRaw = {
  id: "modals-permission-obligation",
  slug: "modals-permission-obligation",
  title: "Permission & Obligation",
  cefrBand: "A2",
  locale: LEARNING_LOCALE,
  strandTags: ["language-focused learning", "meaning-focused input"],
  contentVersion: 1,
  form: {
    focus:
      "Asking for permission and talking about obligation, prohibition, and no obligation",
    ruleSummary:
      "Use can to ask or give permission; could for a polite request; may for formal permission. Can't often means not allowed by rules; must not is a strong prohibition. Have to shows an external rule; must shows strong or personal necessity. Don't have to means something is optional—not the same as must not (forbidden).",
    patterns: [
      "Can/Could/May + subject + base verb…? (permission)",
      "Subject + have to / must + base verb (obligation)",
      "Subject + can't / must not + base verb (prohibition)",
      "Subject + don't/doesn't have to + base verb (no obligation)",
    ],
    examples: [
      {
        id: "ex1",
        sentence: "Can I sit here? You can use my car.",
        note: "can — ask or give permission",
      },
      {
        id: "ex2",
        sentence: "Could I borrow your pen?",
        note: "could — polite request (not usually for giving permission)",
      },
      {
        id: "ex3",
        sentence: "You must not cheat.",
        note: "must not — strong prohibition",
      },
      {
        id: "ex4",
        sentence: "I have to wear a uniform.",
        note: "have to — external rule or requirement",
      },
      {
        id: "ex5",
        sentence: "You don't have to come.",
        note: "don't have to — optional, not necessary",
      },
    ],
    contrastNote:
      "Must not = forbidden. Don't have to = optional. Past obligation uses had to: I had to work yesterday.",
  },
  microTask: {
    id: "mt_modals_permission_obligation",
    prompt: "Choose the best American English option for each item.",
    items: [
      {
        id: "mt1",
        kind: "mcq",
        prompt: "You ___ park here—it's against the rules.",
        choices: [
          { id: "a", text: "must" },
          { id: "b", text: "can't" },
          { id: "c", text: "don't have to" },
          { id: "d", text: "can" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt2",
        kind: "cloze",
        prompt: "The meeting is optional. You ___ attend.",
        choices: [
          { id: "a", text: "must not" },
          { id: "b", text: "don't have to" },
          { id: "c", text: "have to" },
          { id: "d", text: "must" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt3",
        kind: "mcq",
        prompt: "___ I borrow your charger? (polite)",
        choices: [
          { id: "a", text: "Must" },
          { id: "b", text: "Could" },
          { id: "c", text: "Have to" },
          { id: "d", text: "Don't" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt4",
        kind: "cloze",
        prompt: "Yesterday I ___ work late.",
        choices: [
          { id: "a", text: "must" },
          { id: "b", text: "had to" },
          { id: "c", text: "have to" },
          { id: "d", text: "must to" },
        ],
        correctChoiceId: "b",
      },
    ],
  },
};

const cache: { current: GrammarUnit | null } = { current: null };

export async function getModalsPermissionObligationUnit(): Promise<GrammarUnit> {
  return loadGrammarUnitSeed(MODALS_PERMISSION_OBLIGATION_RAW, cache);
}

export function getModalsPermissionObligationUnitSync(): GrammarUnit {
  return requireCachedGrammarUnit(cache, "Grammar seed");
}
