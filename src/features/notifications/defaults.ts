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
    includePianoTips: true,
    skipEmptyDays: false,
    lastDigestSentOn: null,
    pianoTipsSentOn: null,
    pianoTipsSentCount: 0,
    lastPianoTipSentAt: null,
    dateCreated: now,
    dateUpdated: now,
  };
}

/** Backfill newer fields on rows saved before piano tips shipped. */
export function normalizeNotificationPreferences(
  existing: Partial<NotificationPreferences> & {
    id: string;
    userId: string;
  },
): NotificationPreferences {
  const base = defaultNotificationPreferences(existing.userId);
  const includePiano = existing.includePiano !== false;
  return {
    ...base,
    ...existing,
    id: existing.id,
    userId: existing.userId,
    includePiano,
    includePianoTips:
      existing.includePianoTips !== false && includePiano,
    pianoTipsSentOn: existing.pianoTipsSentOn ?? null,
    pianoTipsSentCount: existing.pianoTipsSentCount ?? 0,
    lastPianoTipSentAt: existing.lastPianoTipSentAt ?? null,
  };
}
