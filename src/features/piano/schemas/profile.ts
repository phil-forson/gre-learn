import { z } from "zod";

export const pianoContinueHintSchema = z.object({
  href: z.string().min(1).max(200),
  label: z.string().min(1).max(120),
});

export const pianoProfileSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  activePhaseIndex: z.number().int().min(0).max(5),
  templateId: z.string().min(1).max(80),
  remindersEnabled: z.boolean(),
  timezone: z.string().min(1).max(80),
  continueHint: pianoContinueHintSchema.optional(),
  dateCreated: z.string().min(1),
  dateUpdated: z.string().min(1),
});

export const patchPianoProfileSchema = z
  .object({
    activePhaseIndex: z.number().int().min(0).max(5).optional(),
    remindersEnabled: z.boolean().optional(),
    timezone: z.string().min(1).max(80).optional(),
  })
  .strict();

export type ValidatedPianoProfile = z.infer<typeof pianoProfileSchema>;
export type PatchPianoProfileInput = z.infer<typeof patchPianoProfileSchema>;

export function validatePianoProfile(data: unknown) {
  return pianoProfileSchema.safeParse(data);
}
