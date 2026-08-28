import { LEARNING_LOCALE } from "@/features/learning/types";
import type { SentenceUnit } from "@/features/sentence/types";
import {
  loadSentenceUnitSeed,
  requireCachedSentenceUnit,
  type SentenceUnitSeedRaw,
} from "./load-seed";

const CONNECTORS_ADDITIVE_CONTRAST_RAW: SentenceUnitSeedRaw = {
  id: "connectors-additive-contrast",
  slug: "connectors-additive-contrast",
  title: "Connectors: Additive & Contrast",
  cefrBand: "B2",
  locale: LEARNING_LOCALE,
  strandTags: ["meaning-focused output","language-focused learning"],
  contentVersion: 1,
  form: {
    focus: "Use additive and contrast connectors to control how ideas relate on the page",
    ruleSummary: "Additive connectors (also, in addition, furthermore) stack related points. Contrast connectors (however, on the other hand, whereas) signal a turn. Place the connector where the relationship becomes clear—often at the start of the second clause or sentence.",
    patterns: [
      "Idea. In addition, idea.",
      "Clause; however, clause.",
      "Whereas A…, B…",
      "Not only… but also…",
    ],
    examples: [
      {
        id: "ex1",
        sentence: "The plan cuts costs. In addition, it shortens delivery time.",
        note: "Additive stack",
      },
      {
        id: "ex2",
        sentence: "The prototype works; however, it still needs polish.",
        note: "Soft contrast mid-flow",
      },
      {
        id: "ex3",
        sentence: "Whereas marketing wants speed, engineering wants stability.",
        note: "Side-by-side contrast",
      },
      {
        id: "ex4",
        sentence: "The update is not only faster but also easier to install.",
        note: "Paired additive emphasis",
      }
    ],
    contrastNote: "Also adds; however turns. Do not use however when you mean and.",
  },
  microTask: {
    id: "mt_connectors_additive_contrast",
    prompt: "Pick the connector that matches the relationship.",
    items: [
      {
        id: "mt1",
        kind: "mcq",
        prompt: "\"Sales rose in May. ___, churn fell.\" (same direction)",
        choices: [
          { id: "a", text: "However" },
          { id: "b", text: "In addition" },
          { id: "c", text: "Whereas" },
          { id: "d", text: "Instead" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt2",
        kind: "cloze",
        prompt: "The UI looks clean; ___, load time is still high.",
        choices: [
          { id: "a", text: "however" },
          { id: "b", text: "furthermore" },
          { id: "c", text: "also" },
          { id: "d", text: "likewise" },
        ],
        correctChoiceId: "a",
      },
      {
        id: "mt3",
        kind: "mcq",
        prompt: "Best contrast pair?",
        choices: [
          { id: "a", text: "Also the battery lasts longer, also it weighs less." },
          { id: "b", text: "Whereas the battery lasts longer, the device weighs more." },
          { id: "c", text: "In addition the battery lasts longer, however also weighs." },
          { id: "d", text: "Furthermore whereas battery lasts." },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt4",
        kind: "cloze",
        prompt: "The tool is ___ fast ___ accurate.",
        choices: [
          { id: "a", text: "not only / but also" },
          { id: "b", text: "either / nor" },
          { id: "c", text: "both / or" },
          { id: "d", text: "neither / and" },
        ],
        correctChoiceId: "a",
      }
    ],
  },
};

const cache: { current: SentenceUnit | null } = { current: null };

export async function getConnectorsAdditiveContrastUnit(): Promise<SentenceUnit> {
  return loadSentenceUnitSeed(CONNECTORS_ADDITIVE_CONTRAST_RAW, cache);
}

export function getConnectorsAdditiveContrastUnitSync(): SentenceUnit {
  return requireCachedSentenceUnit(cache, "Sentence seed");
}

export { sentenceUnitHashParts } from "./hash";
