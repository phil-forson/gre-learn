import { contentHash } from "@/lib/utils";
import { validateSpeakingUnit } from "@/features/speaking/schemas/unit";
import type { SpeakingUnit } from "@/features/speaking/types";
import { AppError } from "@/lib/errors";
import { speakingUnitHashParts } from "./hash";

/** Raw seed shape before contentHash is attached. */
export type SpeakingUnitSeedRaw = Omit<SpeakingUnit, "contentHash">;

/**
 * Hash + Zod-validate a hand-authored seed. Uses the provided cache slot so
 * each unit file can keep its own module-level cache.
 */
export async function loadSpeakingUnitSeed(
  raw: SpeakingUnitSeedRaw,
  cache: { current: SpeakingUnit | null },
): Promise<SpeakingUnit> {
  if (cache.current) return cache.current;
  const hash = await contentHash(speakingUnitHashParts(raw));
  const candidate = { ...raw, contentHash: hash };
  const parsed = validateSpeakingUnit(candidate);
  if (!parsed.success) {
    throw new AppError(
      "Speaking seed failed validation",
      "VALIDATION_ERROR",
      500,
      parsed.error.flatten(),
    );
  }
  cache.current = parsed.data;
  return cache.current;
}

/** Sync accessor after first async load — throws if not yet warmed. */
export function requireCachedSpeakingUnit(
  cache: { current: SpeakingUnit | null },
  label = "Speaking seed",
): SpeakingUnit {
  if (!cache.current) {
    throw new AppError(`${label} not loaded`, "CONTENT_NOT_READY", 500);
  }
  return cache.current;
}
