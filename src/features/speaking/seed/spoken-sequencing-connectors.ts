import { LEARNING_LOCALE } from "@/features/learning/types";
import type { SpeakingUnit } from "@/features/speaking/types";
import {
  loadSpeakingUnitSeed,
  requireCachedSpeakingUnit,
  type SpeakingUnitSeedRaw,
} from "./load-seed";

const SPOKEN_SEQUENCING_CONNECTORS_RAW: SpeakingUnitSeedRaw = {
  id: "spoken-sequencing-connectors",
  slug: "spoken-sequencing-connectors",
  title: "Spoken Sequencing Connectors",
  cefrBand: "B1",
  locale: LEARNING_LOCALE,
  strandTags: ["fluency","meaning-focused output"],
  contentVersion: 1,
  form: {
    focus: "Guide listeners through steps with spoken sequencing language",
    ruleSummary: "Sequencing connectors help people follow instructions and plans aloud: first, next, after that, finally; also before that / at the same time when timing overlaps. Say the connector, pause lightly, then the step.",
    patterns: [
      "First… Next… Finally…",
      "Before that… / After that…",
      "At the same time…",
      "Once you…, then…",
    ],
    examples: [
      {
        id: "ex1",
        sentence: "First open the settings. Next choose Privacy.",
        note: "Ordered steps",
      },
      {
        id: "ex2",
        sentence: "Before that, save your draft.",
        note: "Prior step",
      },
      {
        id: "ex3",
        sentence: "At the same time, watch the memory meter.",
        note: "Parallel action",
      },
      {
        id: "ex4",
        sentence: "Once you finish, then restart the app.",
        note: "Conditioned sequence",
      }
    ],
    contrastNote: "Jumping steps without connectors forces listeners to guess order.",
  },
  microTask: {
    id: "mt_spoken_sequencing_connectors",
    prompt: "Choose the sequencing language that fits.",
    items: [
      {
        id: "mt1",
        kind: "mcq",
        prompt: "Clear three-step frame?",
        choices: [
          { id: "a", text: "First save. Next export. Finally share." },
          { id: "b", text: "Finally save. First share. Next maybe." },
          { id: "c", text: "Save export share happening somehow." },
          { id: "d", text: "Whereas save, despite export, unless share." },
        ],
        correctChoiceId: "a",
      },
      {
        id: "mt2",
        kind: "cloze",
        prompt: "___ that, plug in the charger.",
        choices: [
          { id: "a", text: "Before" },
          { id: "b", text: "Because" },
          { id: "c", text: "Although" },
          { id: "d", text: "Whom" },
        ],
        correctChoiceId: "a",
      },
      {
        id: "mt3",
        kind: "mcq",
        prompt: "Best parallel timing?",
        choices: [
          { id: "a", text: "At the same time, keep an eye on the logs." },
          { id: "b", text: "At same the time logs eye keep." },
          { id: "c", text: "Despite the same time logs." },
          { id: "d", text: "Same time which being logs." },
        ],
        correctChoiceId: "a",
      },
      {
        id: "mt4",
        kind: "cloze",
        prompt: "Once you confirm, ___ send the invite.",
        choices: [
          { id: "a", text: "then" },
          { id: "b", text: "despite" },
          { id: "c", text: "unless" },
          { id: "d", text: "whose" },
        ],
        correctChoiceId: "a",
      }
    ],
  },
};

const cache: { current: SpeakingUnit | null } = { current: null };

export async function getSpokenSequencingConnectorsUnit(): Promise<SpeakingUnit> {
  return loadSpeakingUnitSeed(SPOKEN_SEQUENCING_CONNECTORS_RAW, cache);
}

export function getSpokenSequencingConnectorsUnitSync(): SpeakingUnit {
  return requireCachedSpeakingUnit(cache, "Speaking seed");
}

export { speakingUnitHashParts } from "./hash";
