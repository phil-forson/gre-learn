import type { ReviewMode, VocabularyEntry } from "@/features/vocabulary/types";
import type { ReviewQueueItem } from "@/features/learning/types";

export function isReviewEligible(entry: VocabularyEntry): boolean {
  return (
    entry.status === "ready" ||
    entry.status === "audio_ready" ||
    entry.status === "audio_pending" ||
    entry.status === "audio_failed"
  ) && Boolean(entry.content);
}

/**
 * Map VocabularyEntry → shared ReviewQueueItem (multi-source-ready).
 * Existing buildReviewQueue still returns VocabularyEntry for API compat.
 */
export function vocabularyEntryToReviewQueueItem(
  entry: VocabularyEntry,
): ReviewQueueItem {
  const primary =
    entry.content?.definitions.find((d) => d.isPrimary)?.text ??
    entry.content?.definitions[0]?.text ??
    null;

  return {
    sourceType: "vocabulary",
    sourceId: entry.id,
    title: entry.word,
    subtitle: primary,
    isFavorite: entry.isFavorite,
    dateAdded: entry.dateAdded,
    lastReviewedAt: entry.lastReviewedAt,
    reviewCount: entry.reviewCount,
    eligible: isReviewEligible(entry),
  };
}

export function vocabularyEntriesToReviewQueueItems(
  entries: VocabularyEntry[],
): ReviewQueueItem[] {
  return entries.map(vocabularyEntryToReviewQueueItem);
}

export function buildReviewQueue(
  entries: VocabularyEntry[],
  mode: ReviewMode,
  options?: { seed?: number; excludeId?: string; groupId?: string | null },
): VocabularyEntry[] {
  let eligible = entries.filter(isReviewEligible);

  if (options?.groupId) {
    eligible = eligible.filter((e) => e.groupId === options.groupId);
  }

  let queue: VocabularyEntry[];

  switch (mode) {
    case "favorites":
      queue = eligible.filter((e) => e.isFavorite);
      queue.sort((a, b) => a.normalizedWord.localeCompare(b.normalizedWord));
      break;
    case "recent":
      queue = [...eligible].sort(
        (a, b) =>
          new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
      );
      break;
    case "all":
      queue = [...eligible].sort((a, b) =>
        a.normalizedWord.localeCompare(b.normalizedWord),
      );
      break;
    case "shuffle":
      queue = shuffleUnique(eligible, options?.seed);
      break;
    default:
      queue = eligible;
  }

  // Avoid immediately replaying the excluded current item at head after reshuffle.
  if (options?.excludeId && queue.length > 1 && queue[0]?.id === options.excludeId) {
    const [first, ...rest] = queue;
    queue = [...rest, first];
  }

  // Guarantee uniqueness by id
  const seen = new Set<string>();
  return queue.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

/** Mulberry32 PRNG for deterministic tests */
function createRng(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleUnique(
  items: VocabularyEntry[],
  seed?: number,
): VocabularyEntry[] {
  const arr = [...items];
  const random = seed === undefined ? Math.random : createRng(seed);
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
