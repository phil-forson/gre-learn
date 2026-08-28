import { getEnv } from "@/lib/env";
import {
  getDailyTemplate,
  getPhase,
  getSkillsForPhase,
} from "@/features/piano/catalog";
import { getPianoRepository } from "@/features/piano/repository";
import { localDayKey } from "@/features/notifications/services/digest-builder";
import type {
  DailyTemplate,
  PianoPhase,
  PianoProfile,
  PianoSkill,
  PracticeSession,
  YoutubeNote,
} from "@/features/piano/types";
import { getOrCreatePianoProfile } from "./profile-service";

function getUserId(): string {
  return getEnv().DEFAULT_USER_ID;
}

export type TodayPlanBlock = {
  id: string;
  label: string;
  minutes: number;
  description: string;
  completed: boolean;
  completedAt?: string;
};

export type TodayPlan = {
  profile: PianoProfile;
  localDay: string;
  template: DailyTemplate;
  blocks: TodayPlanBlock[];
  suggestedSkills: PianoSkill[];
  notePrompts: Array<{
    noteId: string;
    summary: string;
    prompts: string[];
  }>;
  session: PracticeSession | null;
  completedMinutes: number;
  totalMinutes: number;
  phase: PianoPhase | null;
};

export async function getTodayPlan(
  now: Date = new Date(),
): Promise<TodayPlan> {
  const profile = await getOrCreatePianoProfile();
  const tz = profile.timezone || "UTC";
  const localDay = localDayKey(now, tz);
  const repo = getPianoRepository();
  const [session, notes] = await Promise.all([
    repo.getSessionByDay(getUserId(), localDay),
    repo.listNotes(getUserId()),
  ]);

  const template = getDailyTemplate();
  const completedIds = new Set(
    (session?.blocksCompleted ?? []).map((b) => b.blockId),
  );
  const blocks: TodayPlanBlock[] = template.blocks.map((b) => {
    const done = session?.blocksCompleted.find((c) => c.blockId === b.id);
    return {
      id: b.id,
      label: b.label,
      minutes: b.minutes,
      description: b.description,
      completed: completedIds.has(b.id),
      completedAt: done?.completedAt,
    };
  });

  const suggestedSkills = getSkillsForPhase(profile.activePhaseIndex).slice(
    0,
    6,
  );

  const mappedNotes = notes.filter(
    (n) =>
      n.status === "mapped" &&
      (n.mappedPhaseIndex === undefined ||
        n.mappedPhaseIndex === profile.activePhaseIndex),
  );
  const notePrompts = mappedNotes.map((n: YoutubeNote) => ({
    noteId: n.id,
    summary: n.summary,
    prompts: n.practicePrompts,
  }));

  const completedMinutes = blocks
    .filter((b) => b.completed)
    .reduce((sum, b) => sum + b.minutes, 0);

  return {
    profile,
    localDay,
    template,
    blocks,
    suggestedSkills,
    notePrompts,
    session,
    completedMinutes,
    totalMinutes: template.totalMinutes,
    phase: getPhase(profile.activePhaseIndex) ?? null,
  };
}
