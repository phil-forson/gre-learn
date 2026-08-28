import type { CefrLevel } from "@/features/path/types";
import type { CurriculumUnitMapEntry } from "./speaking";

/**
 * Full Sentence syllabus map. Seeded MVP: orders 1–5.
 * Continue may skip units more than one CEFR band below the learner profile.
 */
export const SENTENCE_CURRICULUM: readonly CurriculumUnitMapEntry[] = [
  {
    order: 1,
    id: "sentence-combining-clarity",
    title: "Sentence Combining for Clarity",
    cefrBand: "B1",
    cefrRange: "B1–B2",
    seeded: true,
  },
  {
    order: 2,
    id: "connectors-additive-contrast",
    title: "Connectors: Additive & Contrast",
    cefrBand: "B2",
    cefrRange: "B2",
    seeded: true,
  },
  {
    order: 3,
    id: "connectors-cause-result-purpose",
    title: "Connectors: Cause, Result & Purpose",
    cefrBand: "B2",
    cefrRange: "B2",
    seeded: true,
  },
  {
    order: 4,
    id: "concession-counterflow",
    title: "Concession & Counterflow",
    cefrBand: "B2",
    cefrRange: "B2–C1",
    seeded: true,
  },
  {
    order: 5,
    id: "sentence-phrasal-packing",
    title: "Sentence Phrasal Packing",
    cefrBand: "B2",
    cefrRange: "B2",
    seeded: true,
  },
  {
    order: 6,
    id: "relative-clause-density",
    title: "Relative Clause Density",
    cefrBand: "B2",
    cefrRange: "B2–C1",
    seeded: false,
  },
  {
    order: 7,
    id: "nominalization-flow",
    title: "Nominalization Flow",
    cefrBand: "C1",
    cefrRange: "C1",
    seeded: false,
  },
  {
    order: 8,
    id: "information-structure",
    title: "Information Structure",
    cefrBand: "C1",
    cefrRange: "C1",
    seeded: false,
  },
  {
    order: 9,
    id: "paraphrase-register",
    title: "Paraphrase & Register",
    cefrBand: "C1",
    cefrRange: "C1",
    seeded: false,
  },
  {
    order: 10,
    id: "multi-clause-professional",
    title: "Multi-Clause Professional Writing",
    cefrBand: "C1",
    cefrRange: "C1",
    seeded: false,
  },
] as const;

export const SENTENCE_SEEDED_UNIT_IDS = SENTENCE_CURRICULUM.filter(
  (u) => u.seeded,
).map((u) => u.id);
