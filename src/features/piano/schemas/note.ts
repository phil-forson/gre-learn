import { z } from "zod";
import { YOUTUBE_NOTE_STATUSES } from "@/features/piano/types";

const optionalHttpUrl = z
  .string()
  .url()
  .refine(
    (u) => u.startsWith("http://") || u.startsWith("https://"),
    "URL must be http or https",
  )
  .optional();

export const youtubeNoteSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  url: optionalHttpUrl,
  channelHint: z.string().max(120).optional(),
  rawText: z.string().min(1).max(20_000),
  summary: z.string().min(1).max(2000),
  skillTagIds: z.array(z.string().min(1)).max(40),
  practicePrompts: z.array(z.string().min(1).max(500)).max(20),
  mappedPhaseIndex: z.number().int().min(0).max(5).optional(),
  status: z.enum(YOUTUBE_NOTE_STATUSES),
  contentHash: z.string().min(8).max(128),
  dateCreated: z.string().min(1),
  dateUpdated: z.string().min(1),
});

export const createYoutubeNoteSchema = z
  .object({
    rawText: z.string().min(1).max(20_000),
    url: optionalHttpUrl,
    channelHint: z.string().max(120).optional(),
  })
  .strict();

export const patchYoutubeNoteSchema = z
  .object({
    action: z.enum(["map", "archive", "update_tags"]).optional(),
    skillTagIds: z.array(z.string().min(1)).max(40).optional(),
    practicePrompts: z.array(z.string().min(1).max(500)).max(20).optional(),
    status: z.enum(YOUTUBE_NOTE_STATUSES).optional(),
  })
  .strict();

export type ValidatedYoutubeNote = z.infer<typeof youtubeNoteSchema>;
export type CreateYoutubeNoteInput = z.infer<typeof createYoutubeNoteSchema>;
export type PatchYoutubeNoteInput = z.infer<typeof patchYoutubeNoteSchema>;

export function validateYoutubeNote(data: unknown) {
  return youtubeNoteSchema.safeParse(data);
}
