import { getEnv } from "@/lib/env";
import {
  getDailyTemplate,
  getPhase,
  getSkillsForPhase,
  listSkills,
} from "@/features/piano/catalog";
import { assignBlockLessons } from "@/features/piano/assign-block-lessons";
import { getPianoRepository } from "@/features/piano/repository";
import {
  buildBlockLessonDetail,
  pickFocusKey,
} from "@/features/piano/services/lesson-detail";
import { getSkillProgressMap } from "@/features/piano/services/skill-service";
import { localDayKey } from "@/features/notifications/services/digest-builder";
import type {
  DailyTemplate,
  PianoPhase,
  PianoProfile,
  PianoSkill,
  PracticeSession,
  YoutubeNote,
} from "@/features/piano/types";
import type { BlockLessonDetail } from "@/features/piano/services/lesson-detail";
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
  skill: PianoSkill;
  detail: BlockLessonDetail;
};

export type TodayPlan = {
  profile: PianoProfile;
  localDay: string;
  template: DailyTemplate;
  blocks: TodayPlanBlock[];
  notePrompts: Array<{
    noteId: string;
    summary: string;
    prompts: string[];
  }>;
  session: PracticeSession | null;
  completedMinutes: number;
  totalMinutes: number;
  phase: PianoPhase | null;
  /** Aggregate major-key completion across key-tracking skills on today's blocks. */
  keysOverview: {
    completed: string[];
    remaining: string[];
    total: number;
  };
};

export async function getTodayPlan(
  now: Date = new Date(),
): Promise<TodayPlan> {
  const profile = await getOrCreatePianoProfile();
  const tz = profile.timezone || "UTC";
  const localDay = localDayKey(now, tz);
  const repo = getPianoRepository();
  const [session, notes, progressMap] = await Promise.all([
    repo.getSessionByDay(getUserId(), localDay),
    repo.listNotes(getUserId()),
    getSkillProgressMap(),
  ]);

  const template = getDailyTemplate();
  const phaseSkills = getSkillsForPhase(profile.activePhaseIndex);
  const skillPool =
    phaseSkills.length > 0 ? phaseSkills : listSkills();
  const assignments = assignBlockLessons(
    skillPool,
    template.blocks.map((b) => b.id),
    localDay,
  );
  const byBlock = new Map(assignments.map((a) => [a.blockId, a.skill]));

  const completedIds = new Set(
    (session?.blocksCompleted ?? []).map((b) => b.blockId),
  );

  const allKeysCompleted = new Set<string>();
  const blocks: TodayPlanBlock[] = template.blocks.map((b) => {
    const done = session?.blocksCompleted.find((c) => c.blockId === b.id);
    const skill = byBlock.get(b.id);
    if (!skill) {
      throw new Error(`No primary skill assigned for block ${b.id}`);
    }
    const progress = progressMap.get(skill.id);
    const keysCompleted = progress?.keysCompleted ?? [];
    const focusKey = pickFocusKey(localDay, keysCompleted);
    const detail = buildBlockLessonDetail(skill, focusKey, keysCompleted);
    for (const k of detail.keysCompleted) allKeysCompleted.add(k);

    return {
      id: b.id,
      label: b.label,
      minutes: b.minutes,
      description: b.description,
      completed: completedIds.has(b.id),
      completedAt: done?.completedAt,
      skill,
      detail,
    };
  });

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

  const ALL = detailKeysRemaining(blocks);
  return {
    profile,
    localDay,
    template,
    blocks,
    notePrompts,
    session,
    completedMinutes,
    totalMinutes: template.totalMinutes,
    phase: getPhase(profile.activePhaseIndex) ?? null,
    keysOverview: ALL,
  };
}

function detailKeysRemaining(blocks: TodayPlanBlock[]) {
  const tracking = blocks.filter((b) => b.detail.trackKeys);
  if (tracking.length === 0) {
    return { completed: [], remaining: [], total: 0 };
  }
  const completed = [
    ...new Set(tracking.flatMap((b) => b.detail.keysCompleted)),
  ];
  const remaining = tracking[0]!.detail.keysRemaining;
  return { completed, remaining, total: 12 };
}

// Re-export BlockLessonDetail for page typing
export type { BlockLessonDetail };
