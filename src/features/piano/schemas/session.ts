import { z } from "zod";
import { PIANO_SKILL_STATUSES } from "@/features/piano/types";

export const sessionBlockCompletionSchema = z.object({
  blockId: z.string().min(1).max(80),
  completedAt: z.string().min(1),
  notes: z.string().max(2000).optional(),
});

export const practiceSessionSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  localDay: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  templateId: z.string().min(1).max(80),
  blocksCompleted: z.array(sessionBlockCompletionSchema).max(20),
  skillIdsTouched: z.array(z.string().min(1)).max(50),
  sourceNoteIds: z.array(z.string().min(1)).max(50),
  durationMin: z.number().int().min(0).max(180),
  notes: z.string().max(4000).optional(),
  dateCreated: z.string().min(1),
  dateUpdated: z.string().min(1),
});

export const completeSessionBlockSchema = z
  .object({
    blockId: z.string().min(1).max(80),
    notes: z.string().max(2000).optional(),
    skillIds: z.array(z.string().min(1)).max(20).optional(),
    localDay: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  })
  .strict();

export const pianoSkillProgressSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  skillId: z.string().min(1),
  status: z.enum(PIANO_SKILL_STATUSES),
  timesPracticed: z.number().int().min(0).max(10_000),
  lastPracticedAt: z.string().min(1).nullable(),
  dateCreated: z.string().min(1),
  dateUpdated: z.string().min(1),
});

export const markSkillPracticedSchema = z
  .object({
    notes: z.string().max(2000).optional(),
  })
  .strict();

export type ValidatedPracticeSession = z.infer<typeof practiceSessionSchema>;
export type CompleteSessionBlockInput = z.infer<
  typeof completeSessionBlockSchema
>;
export type ValidatedPianoSkillProgress = z.infer<
  typeof pianoSkillProgressSchema
>;

export function validatePracticeSession(data: unknown) {
  return practiceSessionSchema.safeParse(data);
}

export function validatePianoSkillProgress(data: unknown) {
  return pianoSkillProgressSchema.safeParse(data);
}
