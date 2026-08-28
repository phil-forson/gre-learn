import { LEARNING_LOCALE } from "@/features/learning/types";
import type { SpeakingUnit } from "@/features/speaking/types";
import {
  loadSpeakingUnitSeed,
  requireCachedSpeakingUnit,
  type SpeakingUnitSeedRaw,
} from "./load-seed";

const SPOKEN_PHRASAL_CLUSTERS_RAW: SpeakingUnitSeedRaw = {
  id: "spoken-phrasal-clusters",
  slug: "spoken-phrasal-clusters",
  title: "Spoken Phrasal Clusters",
  cefrBand: "B1",
  locale: LEARNING_LOCALE,
  strandTags: ["fluency","meaning-focused output"],
  contentVersion: 1,
  form: {
    focus: "Use common spoken phrasal verb clusters that travel together in American English",
    ruleSummary: "Spoken fluency often comes from clusters: figure out, follow up, bring up, run into, wrap up. Learn them as units with a typical object and a natural follow-on. Keep particle placement idiomatic (figure it out, not figure out it).",
    patterns: [
      "figure out + problem",
      "follow up on + topic",
      "bring up + issue",
      "wrap up + meeting/task",
    ],
    examples: [
      {
        id: "ex1",
        sentence: "Let's figure out the root cause.",
        note: "Problem-solving cluster",
      },
      {
        id: "ex2",
        sentence: "I'll follow up on the ticket tomorrow.",
        note: "Continuity",
      },
      {
        id: "ex3",
        sentence: "She brought up a fair concern.",
        note: "Raise topic",
      },
      {
        id: "ex4",
        sentence: "Let's wrap up and send notes.",
        note: "Close + next action",
      }
    ],
    contrastNote: "Literal: find the figure. Phrasal: figure out the answer.",
  },
  microTask: {
    id: "mt_spoken_phrasal_clusters",
    prompt: "Choose the natural phrasal cluster.",
    items: [
      {
        id: "mt1",
        kind: "mcq",
        prompt: "Best particle placement?",
        choices: [
          { id: "a", text: "We'll figure out it later." },
          { id: "b", text: "We'll figure it out later." },
          { id: "c", text: "We'll figure later it out." },
          { id: "d", text: "We'll out figure it." },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt2",
        kind: "cloze",
        prompt: "I'll ___ up on your email this afternoon.",
        choices: [
          { id: "a", text: "follow" },
          { id: "b", text: "fall" },
          { id: "c", text: "fill" },
          { id: "d", text: "feel" },
        ],
        correctChoiceId: "a",
      },
      {
        id: "mt3",
        kind: "mcq",
        prompt: "Natural raise-topic line?",
        choices: [
          { id: "a", text: "He brought up the budget risk." },
          { id: "b", text: "He brought the up budget risk." },
          { id: "c", text: "He up brought budget the risk." },
          { id: "d", text: "He broughted up budget." },
        ],
        correctChoiceId: "a",
      },
      {
        id: "mt4",
        kind: "cloze",
        prompt: "Let's ___ up so people can leave.",
        choices: [
          { id: "a", text: "wrap" },
          { id: "b", text: "warp" },
          { id: "c", text: "wipe" },
          { id: "d", text: "write" },
        ],
        correctChoiceId: "a",
      }
    ],
  },
};

const cache: { current: SpeakingUnit | null } = { current: null };

export async function getSpokenPhrasalClustersUnit(): Promise<SpeakingUnit> {
  return loadSpeakingUnitSeed(SPOKEN_PHRASAL_CLUSTERS_RAW, cache);
}

export function getSpokenPhrasalClustersUnitSync(): SpeakingUnit {
  return requireCachedSpeakingUnit(cache, "Speaking seed");
}

export { speakingUnitHashParts } from "./hash";
