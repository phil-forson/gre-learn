export const PIANO_STRANDS = [
  "gospel",
  "jazz",
  "classical",
  "shared",
] as const;
export type PianoStrand = (typeof PIANO_STRANDS)[number];

export const PIANO_SKILL_STATUSES = [
  "locked",
  "available",
  "practiced",
  "mastered",
] as const;
export type PianoSkillStatus = (typeof PIANO_SKILL_STATUSES)[number];

export const YOUTUBE_NOTE_STATUSES = [
  "inbox",
  "mapped",
  "practiced",
  "archived",
] as const;
export type YoutubeNoteStatus = (typeof YOUTUBE_NOTE_STATUSES)[number];

export type PianoContinueHint = {
  href: string;
  label: string;
};

export type PianoProfile = {
  id: string;
  userId: string;
  activePhaseIndex: number;
  templateId: string;
  remindersEnabled: boolean;
  timezone: string;
  continueHint?: PianoContinueHint;
  dateCreated: string;
  dateUpdated: string;
};

export type SessionBlockCompletion = {
  blockId: string;
  completedAt: string;
  notes?: string;
};

export type PracticeSession = {
  id: string;
  userId: string;
  localDay: string;
  templateId: string;
  blocksCompleted: SessionBlockCompletion[];
  skillIdsTouched: string[];
  sourceNoteIds: string[];
  durationMin: number;
  notes?: string;
  dateCreated: string;
  dateUpdated: string;
};

export type PianoSkillProgress = {
  id: string;
  userId: string;
  skillId: string;
  status: PianoSkillStatus;
  timesPracticed: number;
  lastPracticedAt: string | null;
  /** Major keys marked complete for this skill (when skill tracks keys). */
  keysCompleted: string[];
  dateCreated: string;
  dateUpdated: string;
};

export type YoutubeNote = {
  id: string;
  userId: string;
  url?: string;
  channelHint?: string;
  rawText: string;
  summary: string;
  skillTagIds: string[];
  practicePrompts: string[];
  mappedPhaseIndex?: number;
  status: YoutubeNoteStatus;
  contentHash: string;
  dateCreated: string;
  dateUpdated: string;
};

export type PianoDomain = {
  id: string;
  slug: string;
  index: number;
  title: string;
  description: string;
};

import type { LearningSource } from "@/lib/learning-source";

/** Concrete lesson body shown on Piano Today blocks. */
export type PianoSkillLesson = {
  why: string;
  steps: string[];
  exercise: string;
  passRule: string;
  tip?: string;
  /** Online sources backing factual claims in this lesson. */
  sources?: LearningSource[];
  /** Optional explicit tempo when not inferred from scale/key work. */
  tempo?: {
    startBpm: number;
    targetBpm: number;
    noteValue: string;
    howToUse: string;
  };
};

export type PianoSkill = {
  id: string;
  slug: string;
  domainId: string;
  title: string;
  description: string;
  strand: PianoStrand;
  prereqIds: string[];
  weekHint?: number;
  practicePrompt: string;
  lesson: PianoSkillLesson;
  /** Optional preferred keys; Today still uses the day-cycle keysToday. */
  keysHint?: string[];
};

export type FocusMix = {
  gospel: number;
  jazz: number;
  classical: number;
};

export type PianoPhase = {
  phaseIndex: number;
  title: string;
  description: string;
  skillIds: string[];
  focusMix: FocusMix;
};

export type DailyTemplateBlock = {
  id: string;
  label: string;
  minutes: number;
  description: string;
};

export type DailyTemplate = {
  id: string;
  title: string;
  totalMinutes: number;
  blocks: DailyTemplateBlock[];
};
