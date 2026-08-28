import { LEARNING_LOCALE } from "@/features/learning/types";
import type { SpeakingUnit } from "@/features/speaking/types";
import {
  loadSpeakingUnitSeed,
  requireCachedSpeakingUnit,
  type SpeakingUnitSeedRaw,
} from "./load-seed";

const SPOKEN_SHORT_TURNS_RAW: SpeakingUnitSeedRaw = {
  id: "spoken-short-turns",
  slug: "spoken-short-turns",
  title: "Spoken Short Turns",
  cefrBand: "A2",
  locale: LEARNING_LOCALE,
  strandTags: ["fluency","meaning-focused output"],
  contentVersion: 1,
  form: {
    focus: "Keep spoken turns short, clear, and easy for a partner to answer",
    ruleSummary: "In conversation, a short turn often has one idea plus a soft landing (a question, a check, or a simple closer). Speak in chunks: subject + verb + detail. Pause after the idea so your partner can take the floor.",
    patterns: [
      "I think… / I need… + reason",
      "Short answer + follow-up question",
      "Can you…? / Could we…?",
      "Okay — so next…",
    ],
    examples: [
      {
        id: "ex1",
        sentence: "I'm ready. Should we start?",
        note: "Claim + invite",
      },
      {
        id: "ex2",
        sentence: "That works for me. What about you?",
        note: "Agree + handoff",
      },
      {
        id: "ex3",
        sentence: "I need five minutes. Is that okay?",
        note: "Need + check",
      },
      {
        id: "ex4",
        sentence: "Got it. Let's move on.",
        note: "Confirm + closer",
      }
    ],
    contrastNote: "Long monologue blocks the partner. Short turn: idea, then space.",
  },
  microTask: {
    id: "mt_spoken_short_turns",
    prompt: "Choose the most natural short spoken turn.",
    items: [
      {
        id: "mt1",
        kind: "mcq",
        prompt: "Best short turn after a yes/no question?",
        choices: [
          { id: "a", text: "Yes, and then I also wanted to explain my entire history with the project starting from last year when…" },
          { id: "b", text: "Yes. Want the short version or the details?" },
          { id: "c", text: "Yes yes yes because because because." },
          { id: "d", text: "Affirmative regarding the aforementioned query." },
        ],
        correctChoiceId: "b",
      },
      {
        id: "mt2",
        kind: "cloze",
        prompt: "I'm free after lunch. ___ we talk then?",
        choices: [
          { id: "a", text: "Could" },
          { id: "b", text: "Despite" },
          { id: "c", text: "Whereas" },
          { id: "d", text: "Due" },
        ],
        correctChoiceId: "a",
      },
      {
        id: "mt3",
        kind: "mcq",
        prompt: "Clearest handoff?",
        choices: [
          { id: "a", text: "That's my view. What's yours?" },
          { id: "b", text: "That's my view continuing forever without pause." },
          { id: "c", text: "View mine is. Yours?" },
          { id: "d", text: "I have spoken." },
        ],
        correctChoiceId: "a",
      },
      {
        id: "mt4",
        kind: "cloze",
        prompt: "Okay — ___ next.",
        choices: [
          { id: "a", text: "let's move" },
          { id: "b", text: "moving we" },
          { id: "c", text: "despite move" },
          { id: "d", text: "so that move" },
        ],
        correctChoiceId: "a",
      }
    ],
  },
};

const cache: { current: SpeakingUnit | null } = { current: null };

export async function getSpokenShortTurnsUnit(): Promise<SpeakingUnit> {
  return loadSpeakingUnitSeed(SPOKEN_SHORT_TURNS_RAW, cache);
}

export function getSpokenShortTurnsUnitSync(): SpeakingUnit {
  return requireCachedSpeakingUnit(cache, "Speaking seed");
}

export { speakingUnitHashParts } from "./hash";
