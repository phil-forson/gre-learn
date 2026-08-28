import { LEARNING_LOCALE } from "@/features/learning/types";
import { learningProfileSchema } from "@/features/path/schemas/profile";
import { placementResultSchema } from "@/features/path/schemas/placement";
import type {
  CefrLevel,
  LearningProfile,
  PlacementResult,
} from "@/features/path/types";
import { getDb } from "@/lib/db/firebase-admin";
import { AppError } from "@/lib/errors";
import { createId, nowIso } from "@/lib/utils";
import type { PathRepository, ProfilePatch } from "./types";

const COL = {
  learningProfiles: "learningProfiles",
} as const;

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

export class FirebasePathRepository implements PathRepository {
  private db = getDb();

  private async findProfileByUserId(
    userId: string,
  ): Promise<LearningProfile | null> {
    const snap = await this.db
      .collection(COL.learningProfiles)
      .where("userId", "==", userId)
      .limit(1)
      .get();
    if (snap.empty) return null;
    const doc = snap.docs[0]!;
    const data = doc.data() as LearningProfile;
    if (data.userId !== userId) return null;
    return { ...data, id: data.id || doc.id };
  }

  private async writeProfile(
    profile: LearningProfile,
  ): Promise<LearningProfile> {
    const valid = assertValidProfile(profile);
    await this.db.collection(COL.learningProfiles).doc(valid.id).set(valid);
    return valid;
  }

  /** Load by document id; reject mismatched userId (IDOR guard). */
  async getProfileById(
    userId: string,
    id: string,
  ): Promise<LearningProfile | null> {
    const doc = await this.db.collection(COL.learningProfiles).doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data() as LearningProfile;
    if (data.userId !== userId) return null;
    return data;
  }

  async getOrCreateProfile(userId: string): Promise<LearningProfile> {
    const existing = await this.findProfileByUserId(userId);
    if (existing) {
      const parsed = learningProfileSchema.safeParse(existing);
      if (parsed.success) {
        const coerced = coerceLegacyVocabularyTrack(parsed.data);
        if (coerced.activeTrackId !== parsed.data.activeTrackId) {
          return this.writeProfile(coerced);
        }
        return parsed.data;
      }
      const fresh = {
        ...defaultProfile(userId),
        id: existing.id,
      };
      return this.writeProfile(fresh);
    }
    return this.writeProfile(defaultProfile(userId));
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
    return this.writeProfile(next);
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

export function createFirebasePathRepository(): PathRepository {
  return new FirebasePathRepository();
}
