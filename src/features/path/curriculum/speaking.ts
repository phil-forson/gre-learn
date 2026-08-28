import type { CefrLevel } from "@/features/path/types";
import type { LearningSource } from "@/lib/learning-source";
import { CEFR_FRAMEWORK, ENGLISH_PATH_SOURCES } from "./sources";

const SPEAKING_UNIT_SOURCES: LearningSource[] = [
  CEFR_FRAMEWORK,
  ENGLISH_PATH_SOURCES.britishCouncilSpeaking,
];

export type CurriculumUnitMapEntry = {
  order: number;
  id: string;
  title: string;
  /** Primary band used for catalog ordering / continue (ranges use entry band). */
  cefrBand: CefrLevel;
  /** Human-readable band range from the syllabus. */
  cefrRange: string;
  /** MVP ships units 1–5 only. */
  seeded: boolean;
  /** Required when unit copy teaches facts — see verifiable-learning-sources.mdc */
  sources?: LearningSource[];
};

/**
 * Full Speaking syllabus map. Seeded MVP: orders 1–5.
 * Oral A2–B1 basics stay in the path even for B2/C1 profiles.
 */
export const SPEAKING_CURRICULUM: readonly CurriculumUnitMapEntry[] = [
  {
    order: 1,
    id: "spoken-short-turns",
    title: "Spoken Short Turns",
    cefrBand: "A2",
    cefrRange: "A2",
    seeded: true,
    sources: SPEAKING_UNIT_SOURCES,
  },
  {
    order: 2,
    id: "spoken-narrative-frames",
    title: "Spoken Narrative Frames",
    cefrBand: "A2",
    cefrRange: "A2–B1",
    seeded: true,
    sources: SPEAKING_UNIT_SOURCES,
  },
  {
    order: 3,
    id: "spoken-opinion-frames",
    title: "Spoken Opinion Frames",
    cefrBand: "B1",
    cefrRange: "B1",
    seeded: true,
    sources: SPEAKING_UNIT_SOURCES,
  },
  {
    order: 4,
    id: "spoken-sequencing-connectors",
    title: "Spoken Sequencing Connectors",
    cefrBand: "B1",
    cefrRange: "B1",
    seeded: true,
    sources: SPEAKING_UNIT_SOURCES,
  },
  {
    order: 5,
    id: "spoken-phrasal-clusters",
    title: "Spoken Phrasal Clusters",
    cefrBand: "B1",
    cefrRange: "B1–B2",
    seeded: true,
    sources: SPEAKING_UNIT_SOURCES,
  },
  {
    order: 6,
    id: "spoken-hedging",
    title: "Spoken Hedging",
    cefrBand: "B2",
    cefrRange: "B2",
    seeded: false,
    sources: SPEAKING_UNIT_SOURCES,
  },
  {
    order: 7,
    id: "spoken-extended-turn",
    title: "Spoken Extended Turn",
    cefrBand: "B2",
    cefrRange: "B2",
    seeded: false,
    sources: SPEAKING_UNIT_SOURCES,
  },
  {
    order: 8,
    id: "spoken-discourse-markers",
    title: "Spoken Discourse Markers",
    cefrBand: "B2",
    cefrRange: "B2–C1",
    seeded: false,
    sources: SPEAKING_UNIT_SOURCES,
  },
  {
    order: 9,
    id: "spoken-speculate-hypothesize",
    title: "Spoken Speculate & Hypothesize",
    cefrBand: "B2",
    cefrRange: "B2–C1",
    seeded: false,
    sources: SPEAKING_UNIT_SOURCES,
  },
  {
    order: 10,
    id: "spoken-summarize-paraphrase",
    title: "Spoken Summarize & Paraphrase",
    cefrBand: "C1",
    cefrRange: "C1",
    seeded: false,
    sources: SPEAKING_UNIT_SOURCES,
  },
] as const;

export const SPEAKING_SEEDED_UNIT_IDS = SPEAKING_CURRICULUM.filter(
  (u) => u.seeded,
).map((u) => u.id);
