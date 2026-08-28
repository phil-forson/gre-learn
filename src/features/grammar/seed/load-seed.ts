import { contentHash } from "@/lib/utils";
import { validateGrammarUnit } from "@/features/grammar/schemas/unit";
import type { GrammarUnit } from "@/features/grammar/types";
import { AppError } from "@/lib/errors";
import { grammarUnitHashParts } from "./hash";

/** Raw seed shape before contentHash is attached. */
export type GrammarUnitSeedRaw = Omit<GrammarUnit, "contentHash">;

/**
 * Hash + Zod-validate a hand-authored seed. Uses the provided cache slot so
 * each unit file can keep its own module-level cache.
 */
export async function loadGrammarUnitSeed(
  raw: GrammarUnitSeedRaw,
  cache: { current: GrammarUnit | null },
): Promise<GrammarUnit> {
  if (cache.current) return cache.current;
  const hash = await contentHash(grammarUnitHashParts(raw));
  const candidate = { ...raw, contentHash: hash };
  const parsed = validateGrammarUnit(candidate);
  if (!parsed.success) {
    throw new AppError(
      "Grammar seed failed validation",
      "VALIDATION_ERROR",
      500,
      parsed.error.flatten(),
    );
  }
  cache.current = parsed.data;
  return cache.current;
}

/** Sync accessor after first async load — throws if not yet warmed. */
export function requireCachedGrammarUnit(
  cache: { current: GrammarUnit | null },
  label = "Grammar seed",
): GrammarUnit {
  if (!cache.current) {
    throw new AppError(`${label} not loaded`, "CONTENT_NOT_READY", 500);
  }
  return cache.current;
}
