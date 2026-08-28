import { getEnv } from "@/lib/env";
import { getPianoRepository } from "@/features/piano/repository";
import {
  patchPianoProfileSchema,
  type PatchPianoProfileInput,
} from "@/features/piano/schemas/profile";
import type { PianoProfile } from "@/features/piano/types";
import { AppError } from "@/lib/errors";
import { nowIso } from "@/lib/utils";

function getUserId(): string {
  return getEnv().DEFAULT_USER_ID;
}

export async function getOrCreatePianoProfile(): Promise<PianoProfile> {
  return getPianoRepository().getOrCreateProfile(getUserId());
}

export async function patchPianoProfile(raw: unknown): Promise<PianoProfile> {
  const parsed = patchPianoProfileSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError(
      "Invalid piano profile update",
      "VALIDATION_ERROR",
      400,
      parsed.error.flatten(),
    );
  }
  const patch: PatchPianoProfileInput = parsed.data;
  if (
    patch.activePhaseIndex === undefined &&
    patch.remindersEnabled === undefined &&
    patch.timezone === undefined
  ) {
    throw new AppError(
      "No updatable fields provided",
      "VALIDATION_ERROR",
      400,
    );
  }
  const repo = getPianoRepository();
  const current = await repo.getOrCreateProfile(getUserId());
  const next: PianoProfile = {
    ...current,
    ...patch,
    id: current.id,
    userId: current.userId,
    dateUpdated: nowIso(),
  };
  return repo.upsertProfile(next);
}
