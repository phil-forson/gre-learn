import { getEnv } from "@/lib/env";
import { ALL_MAJOR_KEYS } from "@/features/piano/curriculum/scale-fingerings";
import {
  getSkill,
  listDomains,
  listPhases,
  listSkills,
  resolveUnlockedSkills,
} from "@/features/piano/catalog";
import { getPianoRepository } from "@/features/piano/repository";
import {
  KEY_TRACKING_SKILL_IDS,
} from "@/features/piano/services/lesson-detail";
import {
  markKeyCompleteSchema,
  markSkillPracticedSchema,
} from "@/features/piano/schemas/session";
import type { PianoSkillProgress } from "@/features/piano/types";
import { AppError } from "@/lib/errors";
import { createId, nowIso } from "@/lib/utils";
import { getOrCreatePianoProfile } from "./profile-service";

function getUserId(): string {
  return getEnv().DEFAULT_USER_ID;
}

function assertTrackableKey(key: string): void {
  if (!ALL_MAJOR_KEYS.includes(key)) {
    throw new AppError(
      `Key must be one of: ${ALL_MAJOR_KEYS.join(", ")}`,
      "VALIDATION_ERROR",
      400,
    );
  }
}

async function upsertProgress(
  skillId: string,
  patch: (existing: PianoSkillProgress | undefined, now: string) => PianoSkillProgress,
): Promise<PianoSkillProgress> {
  const repo = getPianoRepository();
  const userId = getUserId();
  const all = await repo.listSkillProgress(userId);
  const existing = all.find((p) => p.skillId === skillId);
  const now = nowIso();
  return repo.upsertSkillProgress(patch(existing, now));
}

export async function getRoadmap() {
  const [profile, progress] = await Promise.all([
    getOrCreatePianoProfile(),
    getPianoRepository().listSkillProgress(getUserId()),
  ]);
  const unlocked = resolveUnlockedSkills(progress);
  return {
    profile,
    domains: listDomains(),
    skills: unlocked,
    phases: listPhases(),
    progress,
    catalogSkillCount: listSkills().length,
  };
}

export async function markSkillPracticed(
  skillId: string,
  raw: unknown = {},
): Promise<PianoSkillProgress> {
  const body = markSkillPracticedSchema.safeParse(raw ?? {});
  if (!body.success) {
    throw new AppError(
      "Invalid skill practice payload",
      "VALIDATION_ERROR",
      400,
      body.error.flatten(),
    );
  }
  const skill = getSkill(skillId);
  if (!skill) {
    throw new AppError("Skill not found", "NOT_FOUND", 404);
  }

  void body.data.notes;
  return upsertProgress(skillId, (existing, now) =>
    existing
      ? {
          ...existing,
          status:
            existing.status === "mastered" ? "mastered" : "practiced",
          timesPracticed: existing.timesPracticed + 1,
          lastPracticedAt: now,
          dateUpdated: now,
        }
      : {
          id: createId("pianoskill"),
          userId: getUserId(),
          skillId,
          status: "practiced",
          timesPracticed: 1,
          lastPracticedAt: now,
          keysCompleted: [],
          dateCreated: now,
          dateUpdated: now,
        },
  );
}

export async function markKeyComplete(
  skillId: string,
  raw: unknown,
): Promise<PianoSkillProgress> {
  const body = markKeyCompleteSchema.safeParse(raw);
  if (!body.success) {
    throw new AppError(
      "Invalid key completion payload",
      "VALIDATION_ERROR",
      400,
      body.error.flatten(),
    );
  }
  const skill = getSkill(skillId);
  if (!skill) {
    throw new AppError("Skill not found", "NOT_FOUND", 404);
  }
  if (!KEY_TRACKING_SKILL_IDS.has(skillId)) {
    throw new AppError(
      "This skill does not track keys",
      "VALIDATION_ERROR",
      400,
    );
  }

  assertTrackableKey(body.data.key);

  return upsertProgress(skillId, (existing, now) => {
    const keysCompleted = existing
      ? [...new Set([...existing.keysCompleted, body.data.key])]
      : [body.data.key];
    const allDone = ALL_MAJOR_KEYS.every((k) => keysCompleted.includes(k));
    return existing
      ? {
          ...existing,
          keysCompleted,
          status: allDone ? "mastered" : "practiced",
          timesPracticed: existing.timesPracticed + 1,
          lastPracticedAt: now,
          dateUpdated: now,
        }
      : {
          id: createId("pianoskill"),
          userId: getUserId(),
          skillId,
          status: allDone ? "mastered" : "practiced",
          timesPracticed: 1,
          lastPracticedAt: now,
          keysCompleted,
          dateCreated: now,
          dateUpdated: now,
        };
  });
}

export async function getSkillProgressMap(): Promise<
  Map<string, PianoSkillProgress>
> {
  const list = await getPianoRepository().listSkillProgress(getUserId());
  return new Map(list.map((p) => [p.skillId, p]));
}
