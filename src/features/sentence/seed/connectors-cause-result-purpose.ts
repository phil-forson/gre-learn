import { LEARNING_LOCALE } from "@/features/learning/types";
import type { SentenceUnit } from "@/features/sentence/types";
import {
  loadSentenceUnitSeed,
  requireCachedSentenceUnit,
  type SentenceUnitSeedRaw,
} from "./load-seed";

const CONNECTORS_CAUSE_RESULT_PURPOSE_RAW: SentenceUnitSeedRaw = {
  id: "connectors-cause-result-purpose",
  slug: "connectors-cause-result-purpose",
  title: "Connectors: Cause, Result & Purpose",
  cefrBand: "B2",
  locale: LEARNING_LOCALE,
  strandTags: ["meaning-focused output","language-focused learning"],
  contentVersion: 1,
  form: {
    focus: "Signal why something happens, what follows, and what the goal is",
    ruleSummary: "Cause (because, since, due to) explains why. Result (so, therefore, as a result) shows what follows. Purpose (so that, in order to) states the goal. Match the connector to the logic—do not use purpose language for a pure result.",
    patterns: [
      "Because / since + cause, result",
      "Cause; therefore / as a result, result",
      "Action in order to / so that + purpose",
      "Due to + noun phrase",
    ],
    examples: [
      {
        id: "ex1",
        sentence: "Because the API timed out, the page showed an error.",
        note: "Cause → result",
      },
      {
        id: "ex2",
        sentence: "Traffic spiked; as a result, the queue filled up.",
        note: "Result connector",
      },
      {
        id: "ex3",
        sentence: "We cached the list in order to cut latency.",
        note: "Purpose",
      },
      {
        id: "ex4",
        sentence: "Due to the outage, checkout paused for an hour.",
        note: "Noun-phrase cause",
      }
    ],
    contrastNote: "So that = purpose. So / therefore = result. Mixing them confuses the reader.",
  },
  microTask: {
    id: "mt_connectors_cause_result_purpose",
    prompt: "Choose the connector that fits the logic.",
    items: [
      {
        id: "mt1",
        kind: "mcq",
        prompt: "We shipped early ___ gather feedback before launch.",
        choices: [
          { id: "a", text: "because" },
          { id: "b", text: "in order to" },
          { id: "c", text: "as a result" },
          { id: "d", text: "due to" },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt2",
        kind: "cloze",
        prompt: "The build failed; ___, the release slipped a day.",
        choices: [
          { id: "a", text: "therefore" },
          { id: "b", text: "so that" },
          { id: "c", text: "in order to" },
          { id: "d", text: "despite" },
        ],
        correctChoiceId: "a",
      },
      {
        id: "mt3",
        kind: "mcq",
        prompt: "Best cause wording?",
        choices: [
          { id: "a", text: "Due to the missing key, auth failed." },
          { id: "b", text: "Due to auth failed, the missing key." },
          { id: "c", text: "In order to the missing key, auth failed." },
          { id: "d", text: "So that missing key auth failed." },
        ],
        correctChoiceId: "a",
      },
      {
        id: "mt4",
        kind: "cloze",
        prompt: "She left early ___ she could catch the train.",
        choices: [
          { id: "a", text: "so that" },
          { id: "b", text: "as a result" },
          { id: "c", text: "furthermore" },
          { id: "d", text: "whereas" },
        ],
        correctChoiceId: "a",
      }
    ],
  },
};

const cache: { current: SentenceUnit | null } = { current: null };

export async function getConnectorsCauseResultPurposeUnit(): Promise<SentenceUnit> {
  return loadSentenceUnitSeed(CONNECTORS_CAUSE_RESULT_PURPOSE_RAW, cache);
}

export function getConnectorsCauseResultPurposeUnitSync(): SentenceUnit {
  return requireCachedSentenceUnit(cache, "Sentence seed");
}

export { sentenceUnitHashParts } from "./hash";
