import type { LearningSource } from "@/lib/learning-source";

/** Official CEFR level descriptors — required for all band claims on the English path. */
export const CEFR_FRAMEWORK: LearningSource = {
  title: "Council of Europe — CEFR level descriptions",
  url: "https://www.coe.int/en/web/common-european-framework-reference-languages/level-descriptions",
  note: "A1–C2 band definitions used for unit placement",
};

export const ENGLISH_PATH_SOURCES = {
  cefr: CEFR_FRAMEWORK,
  britishCouncilSpeaking: {
    title: "British Council — Speaking skills",
    url: "https://learnenglish.britishcouncil.org/skills/speaking",
    note: "Spoken interaction, turn-taking, and fluency practice",
  },
  britishCouncilGrammar: {
    title: "British Council — Grammar",
    url: "https://learnenglish.britishcouncil.org/grammar",
    note: "Sentence connectors, clause combining, and written accuracy",
  },
  cambridgeWriteImprove: {
    title: "Cambridge — Write & Improve",
    url: "https://writeandimprove.com/",
    note: "B1–C1 writing/sentence-level feedback benchmarks",
  },
} as const satisfies Record<string, LearningSource>;
