import type { GrammarUnit } from "@/features/grammar/types";
import type { DigestGrammarSnippet } from "@/features/notifications/types";

/** Default chance a digest includes a curated grammar tip (when includeGrammar is on). */
export const DEFAULT_GRAMMAR_TIP_CHANCE_PERCENT = 50;

function stableHash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function shouldIncludeGrammarTip(
  userId: string,
  localDay: string,
  chancePercent = DEFAULT_GRAMMAR_TIP_CHANCE_PERCENT,
): boolean {
  if (chancePercent <= 0) return false;
  if (chancePercent >= 100) return true;
  return stableHash(`${userId}:${localDay}:grammar-tip`) % 100 < chancePercent;
}

export function pickGrammarTip(
  units: GrammarUnit[],
  userId: string,
  localDay: string,
): DigestGrammarSnippet | null {
  if (units.length === 0) return null;
  const idx = stableHash(`${userId}:${localDay}:grammar-pick`) % units.length;
  const unit = units[idx]!;
  return {
    unitId: unit.id,
    slug: unit.slug,
    title: unit.title,
    ruleLine: unit.form.ruleSummary,
  };
}

export function grammarTipForDigest(
  units: GrammarUnit[],
  userId: string,
  localDay: string,
  chancePercent = DEFAULT_GRAMMAR_TIP_CHANCE_PERCENT,
): DigestGrammarSnippet | null {
  if (!shouldIncludeGrammarTip(userId, localDay, chancePercent)) {
    return null;
  }
  return pickGrammarTip(units, userId, localDay);
}
