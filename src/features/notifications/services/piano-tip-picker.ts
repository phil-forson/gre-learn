import type { NotificationPreferences } from "@/features/notifications/types";
import {
  isInQuietHours,
  localDayKey,
  localHour,
} from "@/features/notifications/services/digest-builder";
import {
  PIANO_TIP_CATALOG,
  formatPianoTipBody,
  type PianoTipEntry,
} from "@/features/notifications/data/piano-tip-catalog";

export const PIANO_TIP_BRAND = "Piano tip" as const;

/** Local hours [start, end) when random tips may fire — e.g. 9:00–21:00. */
export const PIANO_TIP_WINDOW = { start: 9, end: 21 } as const;

/** Per hourly cron tick, probability of sending (if other gates pass). */
export const PIANO_TIP_CHANCE_PER_HOUR_PERCENT = 20;

export const PIANO_TIP_MAX_PER_DAY = 3;

export const PIANO_TIP_MIN_GAP_HOURS = 2;

export type PianoTipPayload = {
  title: typeof PIANO_TIP_BRAND;
  body: string;
  url: string;
  kind: "piano-tip";
  localDay: string;
  tipId: string;
};

function stableHash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function hoursSince(iso: string, now: Date): number {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return Number.POSITIVE_INFINITY;
  return (now.getTime() - then) / 3_600_000;
}

export function isWithinPianoTipWindow(hour: number): boolean {
  return hour >= PIANO_TIP_WINDOW.start && hour < PIANO_TIP_WINDOW.end;
}

export function pickPianoTip(
  userId: string,
  localDay: string,
  hour: number,
): PianoTipEntry {
  const idx =
    stableHash(`${userId}:${localDay}:${hour}:piano-tip-pick`) %
    PIANO_TIP_CATALOG.length;
  return PIANO_TIP_CATALOG[idx]!;
}

export function shouldSendPianoTipNow(
  prefs: NotificationPreferences,
  now: Date,
): boolean {
  if (!prefs.enabled) return false;
  if (prefs.includePiano === false || prefs.includePianoTips === false) {
    return false;
  }

  const tz = prefs.timezone || "UTC";
  const hour = localHour(now, tz);
  const localDay = localDayKey(now, tz);

  if (!isWithinPianoTipWindow(hour)) return false;
  if (isInQuietHours(hour, prefs.quietHoursStart, prefs.quietHoursEnd)) {
    return false;
  }

  const sentOn = prefs.pianoTipsSentOn;
  const sentCount =
    sentOn === localDay ? (prefs.pianoTipsSentCount ?? 0) : 0;
  if (sentCount >= PIANO_TIP_MAX_PER_DAY) return false;

  if (prefs.lastPianoTipSentAt) {
    const gap = hoursSince(prefs.lastPianoTipSentAt, now);
    if (gap < PIANO_TIP_MIN_GAP_HOURS) return false;
  }

  if (PIANO_TIP_CHANCE_PER_HOUR_PERCENT <= 0) return false;
  if (PIANO_TIP_CHANCE_PER_HOUR_PERCENT >= 100) return true;

  return (
    stableHash(`${prefs.userId}:${localDay}:${hour}:piano-tip-roll`) % 100 <
    PIANO_TIP_CHANCE_PER_HOUR_PERCENT
  );
}

export function buildPianoTipPayload(
  entry: PianoTipEntry,
  localDay: string,
): PianoTipPayload {
  return {
    title: PIANO_TIP_BRAND,
    body: formatPianoTipBody(entry),
    url: entry.href,
    kind: "piano-tip",
    localDay,
    tipId: entry.id,
  };
}
