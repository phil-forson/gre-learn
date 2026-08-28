import type { CefrLevel, SkillTrack, SkillTrackId } from "./types";
import { CEFR_LEVELS, SKILL_TRACK_IDS } from "./types";

/** Live + placeholder Path tracks. GRE vocab is not a Path track. */
export const SKILL_TRACKS: readonly SkillTrack[] = [
  {
    id: "grammar",
    label: "Grammar",
    description:
      "Structures and accuracy practice across A2–B2 lessons — play, listen, and check.",
    status: "live",
    href: "/path/tracks/grammar",
    strandTags: ["language-focused learning"],
  },
  {
    id: "sentence",
    label: "Sentences",
    description:
      "Written discourse construction — combine, connect, and pack sentences clearly.",
    status: "live",
    href: "/path/tracks/sentence",
    strandTags: ["meaning-focused output"],
  },
  {
    id: "speaking",
    label: "Speaking",
    description:
      "Oral fluency frames with listen-along practice — short turns through phrasal clusters.",
    status: "live",
    href: "/path/tracks/speaking",
    strandTags: ["fluency"],
  },
] as const;

export function getSkillTrack(id: SkillTrackId): SkillTrack | undefined {
  return SKILL_TRACKS.find((t) => t.id === id);
}

/** Includes legacy `"vocabulary"` for Zod/profile parse; not listed in SKILL_TRACKS. */
export function isSkillTrackId(value: string): value is SkillTrackId {
  return (SKILL_TRACK_IDS as readonly string[]).includes(value);
}

export function isCefrLevel(value: string): value is CefrLevel {
  return (CEFR_LEVELS as readonly string[]).includes(value);
}

/** Default CEFR when the learner skips placement. */
export const SKIP_DEFAULT_CEFR: CefrLevel = "B1";

export const CEFR_LABELS: Record<CefrLevel, string> = {
  A1: "A1 — Beginner",
  A2: "A2 — Elementary",
  B1: "B1 — Intermediate",
  B2: "B2 — Upper intermediate",
  C1: "C1 — Advanced",
  C2: "C2 — Proficient",
};
