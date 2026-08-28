import { getEnv } from "@/lib/env";
import { getPathRepository } from "@/features/path/repository";
import {
  patchLearningProfileSchema,
  type PatchLearningProfileInput,
} from "@/features/path/schemas/profile";
import type { LearningProfile } from "@/features/path/types";
import { AppError } from "@/lib/errors";

function getUserId(): string {
  return getEnv().DEFAULT_USER_ID;
}

export async function getOrCreateLearningProfile(): Promise<LearningProfile> {
  return getPathRepository().getOrCreateProfile(getUserId());
}

export async function patchLearningProfile(
  raw: unknown,
): Promise<LearningProfile> {
  const parsed = patchLearningProfileSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError(
      "Invalid profile update",
      "VALIDATION_ERROR",
      400,
      parsed.error.flatten(),
    );
  }
  const patch: PatchLearningProfileInput = parsed.data;
  if (
    patch.cefrLevel === undefined &&
    patch.pathMode === undefined &&
    patch.activeTrackId === undefined
  ) {
    throw new AppError(
      "No updatable fields provided",
      "VALIDATION_ERROR",
      400,
    );
  }
  return getPathRepository().updateProfile(getUserId(), patch);
}
