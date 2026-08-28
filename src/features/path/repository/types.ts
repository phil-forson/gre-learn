import type {
  LearningProfile,
  PlacementResult,
  SkillTrackId,
  PathMode,
  CefrLevel,
} from "@/features/path/types";

export type ProfilePatch = {
  cefrLevel?: CefrLevel | null;
  pathMode?: PathMode;
  activeTrackId?: SkillTrackId;
  placementStatus?: LearningProfile["placementStatus"];
  lastPlacementAt?: string | null;
  lastPlacement?: PlacementResult | null;
  continueHint?: LearningProfile["continueHint"];
};

export interface PathRepository {
  getOrCreateProfile(userId: string): Promise<LearningProfile>;
  updateProfile(
    userId: string,
    patch: ProfilePatch,
  ): Promise<LearningProfile>;
  savePlacement(
    userId: string,
    result: PlacementResult,
  ): Promise<LearningProfile>;
  skipPlacement(
    userId: string,
    defaultLevel: CefrLevel,
  ): Promise<LearningProfile>;
}
