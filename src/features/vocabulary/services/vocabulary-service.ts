import { getEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { createId, nowIso } from "@/lib/utils";
import {
  assertOpenAiReadyForGeneration,
  generateLearningContentFromProvider,
  hasCachedLearningContent,
  hashLearningContent,
  shouldRetryGeneration,
} from "@/features/generation/services/generate-cached";
import { getVocabularyRepository } from "@/features/vocabulary/repository";
import {
  normalizeBatchInput,
  normalizeWord,
} from "@/features/vocabulary/services/normalize";
import type { VocabularyEntry } from "@/features/vocabulary/types";

function getUserId(): string {
  return getEnv().DEFAULT_USER_ID;
}

async function runGeneration(
  entryId: string,
  displayWord: string,
  contentVersion: number,
  reason: "initial" | "regenerate",
): Promise<VocabularyEntry> {
  const repo = getVocabularyRepository();
  const userId = getUserId();

  await repo.update(userId, entryId, {
    status: "generating",
    generationError: null,
    dateUpdated: nowIso(),
  });

  try {
    const { content, provider, model } =
      await generateLearningContentFromProvider(displayWord, reason);
    const hash = await hashLearningContent(content, contentVersion);

    return repo.update(userId, entryId, {
      status: "ready",
      word: content.word,
      partOfSpeech: content.partOfSpeech,
      content,
      contentVersion,
      contentHash: hash,
      generationProvider: provider,
      generationModel: model,
      generationError: null,
      dateUpdated: nowIso(),
      audioStatus: contentVersion > 1 ? "stale" : "none",
    });
  } catch (error) {
    const message =
      error instanceof AppError
        ? error.message
        : "Generation failed. You can try adding the word again.";
    return repo.update(userId, entryId, {
      status: "generation_failed",
      generationError: message,
      dateUpdated: nowIso(),
    });
  }
}

/**
 * Add a word. OpenAI runs only when there is no usable cached content for that word.
 * Successful cards: re-add returns cache hit (no AI).
 * Failed / incomplete rows: re-add retries generation instead of "already added".
 */
export async function addVocabularyWord(rawWord: string): Promise<{
  entry: VocabularyEntry;
  created: boolean;
  duplicate: boolean;
  fromCache: boolean;
  retried: boolean;
}> {
  const normalized = normalizeWord(rawWord);
  if (!normalized.ok) {
    throw new AppError(normalized.error, "INVALID_WORD", 400);
  }

  const repo = getVocabularyRepository();
  const userId = getUserId();
  const existing = await repo.getByNormalizedWord(userId, normalized.normalized);

  // Success already saved → do not call AI again.
  if (existing && hasCachedLearningContent(existing)) {
    console.info(
      `[ai] cache hit — skip OpenAI for "${normalized.normalized}" (already ready)`,
    );
    return {
      entry: existing,
      created: false,
      duplicate: true,
      fromCache: true,
      retried: false,
    };
  }

  assertOpenAiReadyForGeneration();

  // Previous attempt failed or incomplete → retry in place (same row).
  if (existing && shouldRetryGeneration(existing)) {
    console.info(
      `[ai] retry generation for failed/incomplete "${normalized.normalized}"`,
    );
    const nextVersion = Math.max(1, existing.contentVersion || 0) || 1;
    const entry = await runGeneration(
      existing.id,
      normalized.display,
      nextVersion,
      "initial",
    );
    return {
      entry,
      created: false,
      duplicate: false,
      fromCache: false,
      retried: true,
    };
  }

  const now = nowIso();
  let entry: VocabularyEntry = {
    id: createId("vocab"),
    userId,
    word: normalized.display,
    normalizedWord: normalized.normalized,
    partOfSpeech: [],
    status: "generating",
    isFavorite: false,
    dateAdded: now,
    dateUpdated: now,
    lastReviewedAt: null,
    reviewCount: 0,
    contentVersion: 0,
    contentHash: null,
    generationProvider: null,
    generationModel: null,
    generationError: null,
    audioStatus: "none",
    audioError: null,
    personalNote: null,
    content: null,
  };

  entry = await repo.create(entry);
  entry = await runGeneration(entry.id, normalized.display, 1, "initial");

  return {
    entry,
    created: true,
    duplicate: false,
    fromCache: false,
    retried: false,
  };
}

export async function batchAddVocabulary(raw: string) {
  const words = normalizeBatchInput(raw);
  if (!words.length) {
    throw new AppError("No valid words found in the batch.", "INVALID_BATCH", 400);
  }

  const results = [];
  for (const word of words) {
    try {
      const result = await addVocabularyWord(word);
      results.push({
        word,
        ok: true as const,
        duplicate: result.duplicate,
        fromCache: result.fromCache,
        retried: result.retried,
        entry: result.entry,
      });
    } catch (error) {
      results.push({
        word,
        ok: false as const,
        error:
          error instanceof AppError ? error.message : "Failed to add word",
      });
    }
  }
  return results;
}

/**
 * Explicit path that re-generates a ready word (costs an OpenAI call).
 * Previous content is kept if the new generation fails.
 */
export async function regenerateVocabulary(id: string): Promise<VocabularyEntry> {
  const repo = getVocabularyRepository();
  const userId = getUserId();
  const existing = await repo.getById(userId, id);
  if (!existing) {
    throw new AppError("Word not found.", "NOT_FOUND", 404);
  }

  assertOpenAiReadyForGeneration();

  const previousContent = existing.content;
  const nextVersion = existing.contentVersion + 1;

  await repo.update(userId, id, {
    status: "generating",
    generationError: null,
    dateUpdated: nowIso(),
  });

  try {
    const { content, provider, model } =
      await generateLearningContentFromProvider(existing.word, "regenerate");
    const hash = await hashLearningContent(content, nextVersion);

    await repo.markAudioStale(id);

    return repo.update(userId, id, {
      status: "ready",
      word: content.word,
      partOfSpeech: content.partOfSpeech,
      content,
      contentVersion: nextVersion,
      contentHash: hash,
      generationProvider: provider,
      generationModel: model,
      generationError: null,
      audioStatus: "stale",
      audioError: null,
      dateUpdated: nowIso(),
    });
  } catch (error) {
    const message =
      error instanceof AppError
        ? error.message
        : "Regeneration failed. Previous content may still be available.";
    return repo.update(userId, id, {
      status: previousContent ? "ready" : "generation_failed",
      content: previousContent,
      generationError: message,
      dateUpdated: nowIso(),
    });
  }
}

export async function toggleFavorite(id: string): Promise<VocabularyEntry> {
  const repo = getVocabularyRepository();
  const userId = getUserId();
  const existing = await repo.getById(userId, id);
  if (!existing) throw new AppError("Word not found.", "NOT_FOUND", 404);
  return repo.update(userId, id, {
    isFavorite: !existing.isFavorite,
    dateUpdated: nowIso(),
  });
}

export async function updatePersonalNote(
  id: string,
  note: string | null,
): Promise<VocabularyEntry> {
  const repo = getVocabularyRepository();
  const userId = getUserId();
  const existing = await repo.getById(userId, id);
  if (!existing) throw new AppError("Word not found.", "NOT_FOUND", 404);
  return repo.update(userId, id, {
    personalNote: note?.trim() || null,
    dateUpdated: nowIso(),
  });
}

export async function deleteVocabulary(id: string): Promise<void> {
  const repo = getVocabularyRepository();
  const userId = getUserId();
  const existing = await repo.getById(userId, id);
  if (!existing) throw new AppError("Word not found.", "NOT_FOUND", 404);
  await repo.delete(userId, id);
}

export async function listVocabulary(params: {
  query?: string;
  status?: string;
  favoritesOnly?: boolean;
  sort?: "alpha" | "newest" | "oldest";
  page?: number;
  pageSize?: number;
}) {
  return getVocabularyRepository().list({
    userId: getUserId(),
    ...params,
  });
}

export async function getVocabulary(id: string) {
  // Reads only — never calls OpenAI.
  const entry = await getVocabularyRepository().getById(getUserId(), id);
  if (!entry) throw new AppError("Word not found.", "NOT_FOUND", 404);
  return entry;
}

export async function getDashboardData() {
  const repo = getVocabularyRepository();
  const userId = getUserId();
  const [stats, recent] = await Promise.all([
    repo.countStats(userId),
    repo.list({ userId, sort: "newest", page: 1, pageSize: 8 }),
  ]);
  return { stats, recent: recent.items };
}
