import { getEnv } from "@/lib/env";
import { SKIP_DEFAULT_CEFR, SKILL_TRACKS } from "@/features/path/catalog";
import { getPlacementBank } from "@/features/path/placement/bank";
import { scorePlacement } from "@/features/path/placement/score";
import { getPathRepository } from "@/features/path/repository";
import {
  skipPlacementSchema,
  submitPlacementSchema,
} from "@/features/path/schemas/placement";
import type {
  LearningProfile,
  PlacementResult,
  PublicPlacementItem,
} from "@/features/path/types";
import { AppError } from "@/lib/errors";

function getUserId(): string {
  return getEnv().DEFAULT_USER_ID;
}

export function listPublicPlacementItems(): PublicPlacementItem[] {
  return getPlacementBank().map(({ correctChoiceId: _hidden, ...item }) => item);
}

export async function submitPlacementAnswers(
  raw: unknown,
): Promise<{
  profile: LearningProfile;
  result: PlacementResult | null;
  skipped: boolean;
}> {
  const skip = skipPlacementSchema.safeParse(raw);
  if (skip.success) {
    const profile = await getPathRepository().skipPlacement(
      getUserId(),
      SKIP_DEFAULT_CEFR,
    );
    return { profile, result: null, skipped: true };
  }

  const parsed = submitPlacementSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError(
      "Invalid placement submission",
      "VALIDATION_ERROR",
      400,
      parsed.error.flatten(),
    );
  }

  const result = scorePlacement(parsed.data.answers);
  const profile = await getPathRepository().savePlacement(getUserId(), result);
  return { profile, result, skipped: false };
}

export async function listTracksWithProfile() {
  const profile = await getPathRepository().getOrCreateProfile(getUserId());
  return {
    profile,
    tracks: SKILL_TRACKS.map((track) => ({
      ...track,
      isActive: track.id === profile.activeTrackId,
    })),
  };
}
