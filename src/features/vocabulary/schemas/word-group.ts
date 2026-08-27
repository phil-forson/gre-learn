import { z } from "zod";

export const wordGroupSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  name: z.string().min(1).max(80),
  sortOrder: z.string().min(1).max(40),
  dateCreated: z.string().min(1),
  dateUpdated: z.string().min(1),
});

export const createWordGroupSchema = z.object({
  name: z.string().trim().min(1).max(80),
});

export const renameWordGroupSchema = z.object({
  name: z.string().trim().min(1).max(80),
});

export const reorderWordGroupsSchema = z.object({
  orderedIds: z
    .array(z.string().min(1))
    .min(1)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "orderedIds must be unique",
    }),
});

export const assignGroupSchema = z.object({
  groupId: z.string().min(1).nullable(),
});

export type ValidatedWordGroup = z.infer<typeof wordGroupSchema>;
