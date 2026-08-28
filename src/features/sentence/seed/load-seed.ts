import { contentHash } from "@/lib/utils";
import { validateSentenceUnit } from "@/features/sentence/schemas/unit";
import type { SentenceUnit } from "@/features/sentence/types";
import { AppError } from "@/lib/errors";
import { sentenceUnitHashParts } from "./hash";

/** Raw seed shape before contentHash is attached. */
export type SentenceUnitSeedRaw = Omit<SentenceUnit, "contentHash">;

/**
 * Hash + Zod-validate a hand-authored seed. Uses the provided cache slot so
 * each unit file can keep its own module-level cache.
 */
export async function loadSentenceUnitSeed(
  raw: SentenceUnitSeedRaw,
  cache: { current: SentenceUnit | null },
): Promise<SentenceUnit> {
  if (cache.current) return cache.current;
  const hash = await contentHash(sentenceUnitHashParts(raw));
  const candidate = { ...raw, contentHash: hash };
  const parsed = validateSentenceUnit(candidate);
  if (!parsed.success) {
    throw new AppError(
      "Sentence seed failed validation",
      "VALIDATION_ERROR",
      500,
      parsed.error.flatten(),
    );
  }
  cache.current = parsed.data;
  return cache.current;
}

/** Sync accessor after first async load — throws if not yet warmed. */
export function requireCachedSentenceUnit(
  cache: { current: SentenceUnit | null },
  label = "Sentence seed",
): SentenceUnit {
  if (!cache.current) {
    throw new AppError(`${label} not loaded`, "CONTENT_NOT_READY", 500);
  }
  return cache.current;
}
