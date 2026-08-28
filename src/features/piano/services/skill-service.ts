import { getEnv } from "@/lib/env";
import {
  getSkill,
  listDomains,
  listPhases,
  listSkills,
  resolveUnlockedSkills,
} from "@/features/piano/catalog";
import { getPianoRepository } from "@/features/piano/repository";
import { markSkillPracticedSchema } from "@/features/piano/schemas/session";
import type { PianoSkillProgress } from "@/features/piano/types";
import { AppError } from "@/lib/errors";
import { createId, nowIso } from "@/lib/utils";
import { getOrCreatePianoProfile } from "./profile-service";

function getUserId(): string {
  return getEnv().DEFAULT_USER_ID;
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

  const repo = getPianoRepository();
  const userId = getUserId();
  const all = await repo.listSkillProgress(userId);
  const existing = all.find((p) => p.skillId === skillId);
  const now = nowIso();

  // Soft-unlock: if locked by prereqs, still allow practice (intermediate revision)
  // but only mark available→practiced path; locked skills become practiced when touched.
  const next: PianoSkillProgress = existing
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
        userId,
        skillId,
        status: "practiced",
        timesPracticed: 1,
        lastPracticedAt: now,
        dateCreated: now,
        dateUpdated: now,
      };

  void body.data.notes;
  return repo.upsertSkillProgress(next);
}
