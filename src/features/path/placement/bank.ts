import type { CefrLevel, PlacementItem } from "@/features/path/types";

/**
 * Fixed American English placement bank (~15 items, A1→C1).
 * Correct keys stay server-side; GET strips correctChoiceId.
 */
export const PLACEMENT_BANK: readonly PlacementItem[] = [
  {
    id: "p_a1_1",
    band: "A1",
    kind: "mcq",
    prompt: "Choose the correct sentence.",
    choices: [
      { id: "a", text: "She go to school every day." },
      { id: "b", text: "She goes to school every day." },
      { id: "c", text: "She going to school every day." },
      { id: "d", text: "She gone to school every day." },
    ],
    correctChoiceId: "b",
  },
  {
    id: "p_a1_2",
    band: "A1",
    kind: "cloze",
    prompt: "I ___ a cup of coffee every morning.",
    choices: [
      { id: "a", text: "drink" },
      { id: "b", text: "drinks" },
      { id: "c", text: "drinking" },
      { id: "d", text: "drank" },
    ],
    correctChoiceId: "a",
  },
  {
    id: "p_a1_3",
    band: "A1",
    kind: "mcq",
    prompt: "Where ___ you live?",
    choices: [
      { id: "a", text: "do" },
      { id: "b", text: "does" },
      { id: "c", text: "are" },
      { id: "d", text: "is" },
    ],
    correctChoiceId: "a",
  },
  {
    id: "p_a2_1",
    band: "A2",
    kind: "mcq",
    prompt: "I have lived here ___ 2019.",
    choices: [
      { id: "a", text: "for" },
      { id: "b", text: "since" },
      { id: "c", text: "during" },
      { id: "d", text: "while" },
    ],
    correctChoiceId: "b",
  },
  {
    id: "p_a2_2",
    band: "A2",
    kind: "cloze",
    prompt: "If it rains tomorrow, we ___ cancel the picnic.",
    choices: [
      { id: "a", text: "will" },
      { id: "b", text: "would" },
      { id: "c", text: "would have" },
      { id: "d", text: "are" },
    ],
    correctChoiceId: "a",
  },
  {
    id: "p_a2_3",
    band: "A2",
    kind: "mcq",
    prompt: "Which word means almost the same as \"happy\"?",
    choices: [
      { id: "a", text: "angry" },
      { id: "b", text: "glad" },
      { id: "c", text: "tired" },
      { id: "d", text: "loud" },
    ],
    correctChoiceId: "b",
  },
  {
    id: "p_b1_1",
    band: "B1",
    kind: "mcq",
    prompt: "She suggested that he ___ earlier next time.",
    choices: [
      { id: "a", text: "arrives" },
      { id: "b", text: "arrive" },
      { id: "c", text: "arrived" },
      { id: "d", text: "arriving" },
    ],
    correctChoiceId: "b",
  },
  {
    id: "p_b1_2",
    band: "B1",
    kind: "cloze",
    prompt: "Despite ___ late, they finished the project on time.",
    choices: [
      { id: "a", text: "start" },
      { id: "b", text: "started" },
      { id: "c", text: "starting" },
      { id: "d", text: "to start" },
    ],
    correctChoiceId: "c",
  },
  {
    id: "p_b1_3",
    band: "B1",
    kind: "mcq",
    prompt: "Choose the most natural American English wording.",
    choices: [
      { id: "a", text: "I need to get gas for the car." },
      { id: "b", text: "I need to get petrol for the car." },
      { id: "c", text: "I need to get petroleum for the car." },
      { id: "d", text: "I need to get benzine for the car." },
    ],
    correctChoiceId: "a",
  },
  {
    id: "p_b2_1",
    band: "B2",
    kind: "mcq",
    prompt: "Had she known about the delay, she ___ earlier.",
    choices: [
      { id: "a", text: "would leave" },
      { id: "b", text: "would have left" },
      { id: "c", text: "will leave" },
      { id: "d", text: "left" },
    ],
    correctChoiceId: "b",
  },
  {
    id: "p_b2_2",
    band: "B2",
    kind: "cloze",
    prompt: "The committee insisted that the report ___ rewritten.",
    choices: [
      { id: "a", text: "is" },
      { id: "b", text: "be" },
      { id: "c", text: "was" },
      { id: "d", text: "been" },
    ],
    correctChoiceId: "b",
  },
  {
    id: "p_b2_3",
    band: "B2",
    kind: "mcq",
    prompt: "Which sentence uses \"affect\" correctly?",
    choices: [
      { id: "a", text: "The weather will affect our plans." },
      { id: "b", text: "The weather will effect our plans." },
      { id: "c", text: "The affect of the weather was clear." },
      { id: "d", text: "Weather effects people differently." },
    ],
    correctChoiceId: "a",
  },
  {
    id: "p_c1_1",
    band: "C1",
    kind: "mcq",
    prompt: "Choose the sentence with the most precise wording.",
    choices: [
      {
        id: "a",
        text: "Her argument was predicated on a flawed assumption.",
      },
      {
        id: "b",
        text: "Her argument was predicated of a flawed assumption.",
      },
      {
        id: "c",
        text: "Her argument was predicated with a flawed assumption.",
      },
      {
        id: "d",
        text: "Her argument was predicated for a flawed assumption.",
      },
    ],
    correctChoiceId: "a",
  },
  {
    id: "p_c1_2",
    band: "C1",
    kind: "cloze",
    prompt:
      "Not until the final chapter ___ the novel's true theme become clear.",
    choices: [
      { id: "a", text: "do" },
      { id: "b", text: "does" },
      { id: "c", text: "did" },
      { id: "d", text: "has" },
    ],
    correctChoiceId: "b",
  },
  {
    id: "p_c1_3",
    band: "C1",
    kind: "mcq",
    prompt: "Which word best fits: \"The critic's review was ___ but fair.\"",
    choices: [
      { id: "a", text: "scathing" },
      { id: "b", text: "scared" },
      { id: "c", text: "scattering" },
      { id: "d", text: "scalding-hot" },
    ],
    correctChoiceId: "a",
  },
] as const;

export function getPlacementBank(): readonly PlacementItem[] {
  return PLACEMENT_BANK;
}

export function getPlacementItemById(id: string): PlacementItem | undefined {
  return PLACEMENT_BANK.find((item) => item.id === id);
}

export function emptyScoresByBand(): Record<
  CefrLevel,
  { correct: number; total: number }
> {
  return {
    A1: { correct: 0, total: 0 },
    A2: { correct: 0, total: 0 },
    B1: { correct: 0, total: 0 },
    B2: { correct: 0, total: 0 },
    C1: { correct: 0, total: 0 },
    C2: { correct: 0, total: 0 },
  };
}
