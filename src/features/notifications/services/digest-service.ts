import { getEnv } from "@/lib/env";
import {
  listGrammarUnits,
} from "@/features/grammar/catalog";
import { getGrammarRepository } from "@/features/grammar/repository";
import type { GrammarProgress } from "@/features/grammar/types";
import {
  getNotificationRepository,
} from "@/features/notifications/repository";
import {
  buildDailyDigest,
  localDayKey,
} from "@/features/notifications/services/digest-builder";
import { grammarTipForDigest, pickGrammarTip } from "@/features/notifications/services/grammar-tip-picker";
import type {
  DigestGrammarSnippet,
  DigestPayload,
  DigestPianoSnippet,
  DigestVocabSnippet,
  NotificationPreferences,
} from "@/features/notifications/types";
import { getSkill } from "@/features/piano/catalog";
import { getPianoRepository } from "@/features/piano/repository";
import { resolveContinueTarget } from "@/features/path/services/continue-service";
import { getVocabularyRepository } from "@/features/vocabulary/repository";
import type { VocabularyEntry } from "@/features/vocabulary/types";

function getUserId(): string {
  return getEnv().DEFAULT_USER_ID;
}

function isoInLocalDay(
  iso: string | null | undefined,
  localDay: string,
  timeZone: string,
): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return localDayKey(d, timeZone) === localDay;
}

function vocabSnippet(entry: VocabularyEntry): DigestVocabSnippet {
  const primary =
    entry.content?.definitions?.find((d) => d.isPrimary)?.text ??
    entry.content?.definitions?.[0]?.text ??
    entry.partOfSpeech?.[0] ??
    "word";
  return { word: entry.word, definition: primary };
}

function grammarActiveToday(
  progress: GrammarProgress,
  localDay: string,
  timeZone: string,
): boolean {
  return (
    isoInLocalDay(progress.lastPlayedAt, localDay, timeZone) ||
    (progress.status === "completed" &&
      isoInLocalDay(progress.dateUpdated, localDay, timeZone))
  );
}

export async function collectDigestActivity(
  prefs: NotificationPreferences,
  now: Date = new Date(),
): Promise<{
  grammar: DigestGrammarSnippet[];
  vocabNew: DigestVocabSnippet[];
  vocabReviewed: DigestVocabSnippet[];
  piano: DigestPianoSnippet[];
}> {
  const userId = prefs.userId;
  const tz = prefs.timezone || "UTC";
  const localDay = localDayKey(now, tz);

  const grammar: DigestGrammarSnippet[] = [];
  if (prefs.includeGrammar) {
    const [progressList, units] = await Promise.all([
      getGrammarRepository().listProgress(userId),
      listGrammarUnits(),
    ]);
    const byId = new Map(units.map((u) => [u.id, u]));
    for (const p of progressList) {
      if (!grammarActiveToday(p, localDay, tz)) continue;
      const unit = byId.get(p.unitId);
      grammar.push({
        unitId: p.unitId,
        title: unit?.title ?? p.unitId,
        ruleLine: unit?.form.ruleSummary,
      });
    }
  }

  const vocabNew: DigestVocabSnippet[] = [];
  const vocabReviewed: DigestVocabSnippet[] = [];
  if (prefs.includeVocab) {
    const listed = await getVocabularyRepository().list({
      userId,
      page: 1,
      pageSize: 500,
      sort: "newest",
    });
    const seenNew = new Set<string>();
    const seenReviewed = new Set<string>();
    for (const entry of listed.items) {
      const key = entry.normalizedWord;
      if (isoInLocalDay(entry.dateAdded, localDay, tz)) {
        if (!seenNew.has(key)) {
          seenNew.add(key);
          vocabNew.push(vocabSnippet(entry));
        }
      } else if (isoInLocalDay(entry.lastReviewedAt, localDay, tz)) {
        if (!seenReviewed.has(key)) {
          seenReviewed.add(key);
          vocabReviewed.push(vocabSnippet(entry));
        }
      }
    }
  }

  const piano: DigestPianoSnippet[] = [];
  // Missing includePiano on old rows → treat as true
  if (prefs.includePiano !== false) {
    try {
      const repo = getPianoRepository();
      const [profile, session, notes] = await Promise.all([
        repo.getOrCreateProfile(userId),
        repo.getSessionByDay(userId, localDay),
        repo.listNotes(userId),
      ]);
      // Logged activity only (so skipEmptyDays still works): completed blocks,
      // skills touched today, or mapped note prompts waiting in the active phase.
      const completedBlocks = session?.blocksCompleted?.length ?? 0;
      const skillsTouched = session?.skillIdsTouched?.length ?? 0;
      const mappedPrompts = notes.filter(
        (n) =>
          n.status === "mapped" &&
          n.practicePrompts.length > 0 &&
          (n.mappedPhaseIndex === undefined ||
            n.mappedPhaseIndex === profile.activePhaseIndex),
      );
      const hasLoggedPiano =
        completedBlocks > 0 || skillsTouched > 0 || mappedPrompts.length > 0;

      if (hasLoggedPiano) {
        const skillLabel =
          session?.skillIdsTouched
            ?.map((id) => getSkill(id)?.title)
            .find(Boolean) ??
          mappedPrompts[0]?.practicePrompts[0]?.slice(0, 40) ??
          "Practice today";
        piano.push({
          label: skillLabel,
          href: "/piano/today",
        });
      }
    } catch {
      // Piano store optional — digest still sends English activity.
    }
  }

  return { grammar, vocabNew, vocabReviewed, piano };
}

export async function buildDigestForUser(
  prefs: NotificationPreferences,
  now: Date = new Date(),
  options?: { force?: boolean },
): Promise<DigestPayload | null> {
  const localDay = localDayKey(now, prefs.timezone || "UTC");
  const [{ grammar, vocabNew, vocabReviewed, piano }, continueTarget, units] =
    await Promise.all([
      collectDigestActivity(prefs, now),
      resolveContinueTarget(),
      prefs.includeGrammar ? listGrammarUnits() : Promise.resolve([]),
    ]);

  const grammarTip =
    prefs.includeGrammar && units.length > 0
      ? options?.force
        ? pickGrammarTip(units, prefs.userId, localDay)
        : grammarTipForDigest(units, prefs.userId, localDay)
      : null;

  return buildDailyDigest({
    prefs,
    now,
    grammar,
    vocabNew,
    vocabReviewed,
    piano,
    grammarTip,
    force: options?.force,
    continueTarget: {
      href: continueTarget.href,
      label: continueTarget.label,
      needsPlacement: continueTarget.needsPlacement,
    },
  });
}

export async function getPreferencesForDefaultUser() {
  return getNotificationRepository().getOrCreatePreferences(getUserId());
}
