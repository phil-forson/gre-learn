import { z } from "zod";
import { CEFR_LEVELS } from "@/features/path/types";

const cefrLevelSchema = z.enum(CEFR_LEVELS);

export const bandScoreSchema = z.object({
  correct: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});

export const placementResultSchema = z.object({
  recommendedLevel: cefrLevelSchema,
  correctCount: z.number().int().nonnegative(),
  itemCount: z.number().int().positive(),
  scoresByBand: z.object({
    A1: bandScoreSchema,
    A2: bandScoreSchema,
    B1: bandScoreSchema,
    B2: bandScoreSchema,
    C1: bandScoreSchema,
    C2: bandScoreSchema,
  }),
  method: z.literal("rules"),
  skippedUnitIds: z.array(z.string()),
  answeredAt: z.string().min(1),
});

export const placementAnswerSchema = z.object({
  itemId: z.string().min(1),
  choiceId: z.string().min(1),
});

export const submitPlacementSchema = z.object({
  answers: z.array(placementAnswerSchema).min(1).max(40),
});

export const skipPlacementSchema = z.object({
  skip: z.literal(true),
});

export type ValidatedPlacementResult = z.infer<typeof placementResultSchema>;
export type SubmitPlacementInput = z.infer<typeof submitPlacementSchema>;

export function validatePlacementResult(data: unknown) {
  return placementResultSchema.safeParse(data);
}
