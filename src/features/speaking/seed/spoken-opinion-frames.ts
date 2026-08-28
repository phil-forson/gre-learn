import { LEARNING_LOCALE } from "@/features/learning/types";
import type { SpeakingUnit } from "@/features/speaking/types";
import {
  loadSpeakingUnitSeed,
  requireCachedSpeakingUnit,
  type SpeakingUnitSeedRaw,
} from "./load-seed";

const SPOKEN_OPINION_FRAMES_RAW: SpeakingUnitSeedRaw = {
  id: "spoken-opinion-frames",
  slug: "spoken-opinion-frames",
  title: "Spoken Opinion Frames",
  cefrBand: "B1",
  locale: LEARNING_LOCALE,
  strandTags: ["fluency","meaning-focused output"],
  contentVersion: 1,
  form: {
    focus: "State an opinion, give one reason, and leave room for disagreement",
    ruleSummary: "Opinion frames soften claims so conversation stays collaborative: I think / From my view / It seems to me. Add because + one concrete reason, then invite a response. Avoid stacking five reasons in one turn.",
    patterns: [
      "I think… because…",
      "From my point of view…",
      "It seems to me that…",
      "I'm not sure, but… What do you think?",
    ],
    examples: [
      {
        id: "ex1",
        sentence: "I think we should wait because the data is incomplete.",
        note: "Claim + reason",
      },
      {
        id: "ex2",
        sentence: "From my point of view, the demo is ready.",
        note: "Soft stance",
      },
      {
        id: "ex3",
        sentence: "It seems to me that users want fewer clicks.",
        note: "Hedged observation",
      },
      {
        id: "ex4",
        sentence: "I'm not sure, but a shorter script might help. What do you think?",
        note: "Invite",
      }
    ],
    contrastNote: "Hard: You are wrong. Framed: I see it differently because… What do you think?",
  },
  microTask: {
    id: "mt_spoken_opinion_frames",
    prompt: "Pick the natural opinion frame.",
    items: [
      {
        id: "mt1",
        kind: "mcq",
        prompt: "Best collaborative opinion?",
        choices: [
          { id: "a", text: "You're wrong and that's final." },
          { id: "b", text: "I think a smaller release is safer because testing is thin. What do you think?" },
          { id: "c", text: "Opinion mine is correct forever." },
          { id: "d", text: "Because because because decide now." },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt2",
        kind: "cloze",
        prompt: "___ my point of view, we need another sample.",
        choices: [
          { id: "a", text: "From" },
          { id: "b", text: "For" },
          { id: "c", text: "At" },
          { id: "d", text: "By to" },
        ],
        correctChoiceId: "a",
      },
      {
        id: "mt3",
        kind: "mcq",
        prompt: "Best soften?",
        choices: [
          { id: "a", text: "It seems to me that the copy is unclear." },
          { id: "b", text: "It seem me the copy unclear." },
          { id: "c", text: "Seems the copy which is being unclearness." },
          { id: "d", text: "Copy unclear = fact absolute." },
        ],
        correctChoiceId: "a",
      },
      {
        id: "mt4",
        kind: "cloze",
        prompt: "I'm not sure, ___ a pause might help.",
        choices: [
          { id: "a", text: "but" },
          { id: "b", text: "despite" },
          { id: "c", text: "unless that" },
          { id: "d", text: "whereas to" },
        ],
        correctChoiceId: "a",
      }
    ],
  },
};

const cache: { current: SpeakingUnit | null } = { current: null };

export async function getSpokenOpinionFramesUnit(): Promise<SpeakingUnit> {
  return loadSpeakingUnitSeed(SPOKEN_OPINION_FRAMES_RAW, cache);
}

export function getSpokenOpinionFramesUnitSync(): SpeakingUnit {
  return requireCachedSpeakingUnit(cache, "Speaking seed");
}

export { speakingUnitHashParts } from "./hash";
