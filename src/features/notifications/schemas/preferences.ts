import { z } from "zod";

export const notificationPreferencesSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  enabled: z.boolean(),
  timezone: z.string().min(1).max(80),
  sendHourLocal: z.number().int().min(0).max(23),
  quietHoursStart: z.number().int().min(0).max(23).nullable(),
  quietHoursEnd: z.number().int().min(0).max(23).nullable(),
  includeGrammar: z.boolean(),
  includeVocab: z.boolean(),
  includePiano: z.boolean().default(true),
  skipEmptyDays: z.boolean(),
  lastDigestSentOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  dateCreated: z.string().min(1),
  dateUpdated: z.string().min(1),
});

export const patchNotificationPreferencesSchema = z
  .object({
    enabled: z.boolean().optional(),
    timezone: z.string().min(1).max(80).optional(),
    sendHourLocal: z.number().int().min(0).max(23).optional(),
    quietHoursStart: z.number().int().min(0).max(23).nullable().optional(),
    quietHoursEnd: z.number().int().min(0).max(23).nullable().optional(),
    includeGrammar: z.boolean().optional(),
    includeVocab: z.boolean().optional(),
    includePiano: z.boolean().optional(),
    skipEmptyDays: z.boolean().optional(),
  })
  .strict();

export const pushDeviceTokenSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  token: z.string().min(10).max(4096),
  platform: z.literal("web"),
  userAgent: z.string().max(500).nullable(),
  dateCreated: z.string().min(1),
  dateUpdated: z.string().min(1),
});

export const upsertPushTokenSchema = z
  .object({
    token: z.string().min(10).max(4096),
    userAgent: z.string().max(500).nullable().optional(),
  })
  .strict();

export type ValidatedNotificationPreferences = z.infer<
  typeof notificationPreferencesSchema
>;
export type PatchNotificationPreferencesInput = z.infer<
  typeof patchNotificationPreferencesSchema
>;
export type ValidatedPushDeviceToken = z.infer<typeof pushDeviceTokenSchema>;
export type UpsertPushTokenInput = z.infer<typeof upsertPushTokenSchema>;
