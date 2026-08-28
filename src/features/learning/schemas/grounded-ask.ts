import { z } from "zod";

export const groundedAskRequestSchema = z.object({
  question: z
    .string()
    .trim()
    .min(3, "Ask a specific question (at least 3 characters).")
    .max(500),
  localDay: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export const groundedAskResponseSchema = z.object({
  answer: z.string(),
  citedSourceTitles: z.array(z.string()),
  cannotAnswer: z.boolean(),
  provider: z.enum(["openai", "mock"]),
});

export type GroundedAskRequest = z.infer<typeof groundedAskRequestSchema>;
export type GroundedAskResponse = z.infer<typeof groundedAskResponseSchema>;
