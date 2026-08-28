import { LEARNING_LOCALE } from "@/features/learning/types";
import { learningProfileSchema } from "@/features/path/schemas/profile";
import { placementResultSchema } from "@/features/path/schemas/placement";
import type { LearningProfile } from "@/features/path/types";
import { LocalVocabularyRepository } from "@/features/vocabulary/repository/local";
import { AppError } from "@/lib/errors";
import { createId, nowIso } from "@/lib/utils";
import type { PathRepository, ProfilePatch } from "./types";
import type { CefrLevel, PlacementResult } from "@/features/path/types";

function defaultProfile(userId: string): LearningProfile {
  const now = nowIso();
  return {
    id: createId("profile"),
    userId,
    locale: LEARNING_LOCALE,
    cefrLevel: null,
    pathMode: "standard",
    activeTrackId: "grammar",
    placementStatus: "not_started",
    lastPlacementAt: null,
    lastPlacement: null,
    continueHint: null,
    dateCreated: now,
    dateUpdated: now,
  };
}

/** Legacy Path treated GRE vocab as a track; coerce to grammar and persist. */
function coerceLegacyVocabularyTrack(
  profile: LearningProfile,
): LearningProfile {
  if (profile.activeTrackId !== "vocabulary") return profile;
  return {
    ...profile,
    activeTrackId: "grammar",
    dateUpdated: nowIso(),
  };
}

function assertValidProfile(profile: LearningProfile): LearningProfile {
  const parsed = learningProfileSchema.safeParse(profile);
  if (!parsed.success) {
    throw new AppError(
      "Invalid learning profile",
      "VALIDATION_ERROR",
      400,
      parsed.error.flatten(),
    );
  }
  return parsed.data;
}

export type LocalPathRepositoryOptions = {
  /** Override store directory. Tests must pass an isolated temp dir. */
  dataDir?: string;
  /** Share an existing local vocab repo (same lock + store.json). */
  vocabRepo?: LocalVocabularyRepository;
};

export class LocalPathRepository implements PathRepository {
  private readonly vocabRepo: LocalVocabularyRepository;

  constructor(options?: LocalPathRepositoryOptions) {
    this.vocabRepo =
      options?.vocabRepo ??
      new LocalVocabularyRepository({ dataDir: options?.dataDir });
  }

  async getOrCreateProfile(userId: string): Promise<LearningProfile> {
    const existing = await this.vocabRepo.getLearningProfile(userId);
    if (existing) {
      const parsed = learningProfileSchema.safeParse(existing);
      if (parsed.success) {
        const coerced = coerceLegacyVocabularyTrack(parsed.data);
        if (coerced.activeTrackId !== parsed.data.activeTrackId) {
          return this.vocabRepo.upsertLearningProfile(assertValidProfile(coerced));
        }
        return parsed.data;
      }
      // Corrupt row: replace with defaults rather than wiping other store keys
      const fresh = defaultProfile(userId);
      return this.vocabRepo.upsertLearningProfile(assertValidProfile(fresh));
    }
    const created = defaultProfile(userId);
    return this.vocabRepo.upsertLearningProfile(assertValidProfile(created));
  }

  async updateProfile(
    userId: string,
    patch: ProfilePatch,
  ): Promise<LearningProfile> {
    const current = await this.getOrCreateProfile(userId);
    const next = coerceLegacyVocabularyTrack({
      ...current,
      ...patch,
      id: current.id,
      userId: current.userId,
      locale: LEARNING_LOCALE,
      dateUpdated: nowIso(),
    });
    return this.vocabRepo.upsertLearningProfile(assertValidProfile(next));
  }

  async savePlacement(
    userId: string,
    result: PlacementResult,
  ): Promise<LearningProfile> {
    const parsed = placementResultSchema.safeParse(result);
    if (!parsed.success) {
      throw new AppError(
        "Invalid placement result",
        "VALIDATION_ERROR",
        400,
        parsed.error.flatten(),
      );
    }
    const now = nowIso();
    return this.updateProfile(userId, {
      cefrLevel: parsed.data.recommendedLevel,
      placementStatus: "completed",
      lastPlacementAt: now,
      lastPlacement: parsed.data,
    });
  }

  async skipPlacement(
    userId: string,
    defaultLevel: CefrLevel,
  ): Promise<LearningProfile> {
    const now = nowIso();
    return this.updateProfile(userId, {
      cefrLevel: defaultLevel,
      placementStatus: "skipped",
      lastPlacementAt: now,
      lastPlacement: null,
    });
  }
}
