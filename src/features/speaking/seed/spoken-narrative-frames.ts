import { LEARNING_LOCALE } from "@/features/learning/types";
import type { SpeakingUnit } from "@/features/speaking/types";
import {
  loadSpeakingUnitSeed,
  requireCachedSpeakingUnit,
  type SpeakingUnitSeedRaw,
} from "./load-seed";

const SPOKEN_NARRATIVE_FRAMES_RAW: SpeakingUnitSeedRaw = {
  id: "spoken-narrative-frames",
  slug: "spoken-narrative-frames",
  title: "Spoken Narrative Frames",
  cefrBand: "A2",
  locale: LEARNING_LOCALE,
  strandTags: ["fluency","meaning-focused output"],
  contentVersion: 1,
  form: {
    focus: "Tell a short spoken story with a clear beginning, middle, and end",
    ruleSummary: "A spoken narrative frame guides the listener: set the scene, say what happened, then land the point. Use time markers (first, then, after that, finally) and keep verbs in a consistent past frame unless you flash back on purpose.",
    patterns: [
      "So last week… / Yesterday…",
      "First… Then… After that…",
      "Suddenly / In the end…",
      "The point is…",
    ],
    examples: [
      {
        id: "ex1",
        sentence: "So last week I missed my train.",
        note: "Scene opener",
      },
      {
        id: "ex2",
        sentence: "First I checked the board, then I ran.",
        note: "Sequence",
      },
      {
        id: "ex3",
        sentence: "In the end I took a later train.",
        note: "Landing",
      },
      {
        id: "ex4",
        sentence: "The point is, I'll leave earlier next time.",
        note: "Why it matters",
      }
    ],
    contrastNote: "Without frames, listeners lose the timeline. Anchor time, then advance.",
  },
  microTask: {
    id: "mt_spoken_narrative_frames",
    prompt: "Choose the best narrative frame language.",
    items: [
      {
        id: "mt1",
        kind: "mcq",
        prompt: "Best opener for a past story?",
        choices: [
          { id: "a", text: "So yesterday I walked into the office…" },
          { id: "b", text: "So tomorrow I walked into the office…" },
          { id: "c", text: "In order to yesterday office…" },
          { id: "d", text: "Whereas yesterday office walking…" },
        ],
        correctChoiceId: "a",
      },
      {
        id: "mt2",
        kind: "cloze",
        prompt: "First I saved the file. ___ I emailed it.",
        choices: [
          { id: "a", text: "Then" },
          { id: "b", text: "Despite" },
          { id: "c", text: "Unless" },
          { id: "d", text: "Whom" },
        ],
        correctChoiceId: "a",
      },
      {
        id: "mt3",
        kind: "mcq",
        prompt: "Best landing line?",
        choices: [
          { id: "a", text: "In the end, we shipped on Friday." },
          { id: "b", text: "In the begin, we shipped on Friday." },
          { id: "c", text: "Endly we shipped." },
          { id: "d", text: "Shipping was the end which happened Friday being." },
        ],
        correctChoiceId: "a",
      },
      {
        id: "mt4",
        kind: "cloze",
        prompt: "___ is, we need a backup plan.",
        choices: [
          { id: "a", text: "The point" },
          { id: "b", text: "The pointing" },
          { id: "c", text: "Pointing the" },
          { id: "d", text: "A pointed" },
        ],
        correctChoiceId: "a",
      }
    ],
  },
};

const cache: { current: SpeakingUnit | null } = { current: null };

export async function getSpokenNarrativeFramesUnit(): Promise<SpeakingUnit> {
  return loadSpeakingUnitSeed(SPOKEN_NARRATIVE_FRAMES_RAW, cache);
}

export function getSpokenNarrativeFramesUnitSync(): SpeakingUnit {
  return requireCachedSpeakingUnit(cache, "Speaking seed");
}

export { speakingUnitHashParts } from "./hash";
