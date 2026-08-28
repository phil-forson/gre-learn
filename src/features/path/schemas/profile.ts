import { z } from "zod";
import { LEARNING_LOCALE } from "@/features/learning/types";
import { CEFR_LEVELS, SKILL_TRACK_IDS } from "@/features/path/types";
import { placementResultSchema } from "./placement";

export const cefrLevelSchema = z.enum(CEFR_LEVELS);
export const skillTrackIdSchema = z.enum(SKILL_TRACK_IDS);
export const pathModeSchema = z.enum(["standard", "fast"]);
export const placementStatusSchema = z.enum([
  "not_started",
  "completed",
  "skipped",
]);

export const continueHintSchema = z.object({
  trackId: skillTrackIdSchema,
  href: z.string().min(1).max(200),
  label: z.string().min(1).max(120),
  updatedAt: z.string().min(1),
});

export const learningProfileSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  locale: z.literal(LEARNING_LOCALE),
  cefrLevel: cefrLevelSchema.nullable(),
  pathMode: pathModeSchema,
  activeTrackId: skillTrackIdSchema,
  placementStatus: placementStatusSchema,
  lastPlacementAt: z.string().nullable(),
  lastPlacement: placementResultSchema.nullable(),
  continueHint: continueHintSchema.nullable(),
  dateCreated: z.string().min(1),
  dateUpdated: z.string().min(1),
});

/** PATCH allowlist — only these fields may be updated by the client. */
export const patchLearningProfileSchema = z
  .object({
    cefrLevel: cefrLevelSchema.nullable().optional(),
    pathMode: pathModeSchema.optional(),
    activeTrackId: skillTrackIdSchema.optional(),
  })
  .strict();

export type ValidatedLearningProfile = z.infer<typeof learningProfileSchema>;
export type PatchLearningProfileInput = z.infer<
  typeof patchLearningProfileSchema
>;

export function validateLearningProfile(data: unknown) {
  return learningProfileSchema.safeParse(data);
}
