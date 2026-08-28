import type { NotificationPreferences } from "@/features/notifications/types";
import { createId, nowIso } from "@/lib/utils";

export const DEFAULT_NOTIFICATION_TIMEZONE = "UTC";
export const DEFAULT_DIGEST_SEND_HOUR = 20;

export function defaultNotificationPreferences(
  userId: string,
): NotificationPreferences {
  const now = nowIso();
  return {
    id: createId("notifprefs"),
    userId,
    enabled: false,
    timezone: DEFAULT_NOTIFICATION_TIMEZONE,
    sendHourLocal: DEFAULT_DIGEST_SEND_HOUR,
    quietHoursStart: null,
    quietHoursEnd: null,
    includeGrammar: true,
    includeVocab: true,
    includePiano: true,
    skipEmptyDays: false,
    lastDigestSentOn: null,
    dateCreated: now,
    dateUpdated: now,
  };
}
