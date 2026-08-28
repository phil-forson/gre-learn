import { CEFR_LEVELS, type CefrLevel } from "@/features/path/types";

export function cefrBandIndex(level: CefrLevel): number {
  return CEFR_LEVELS.indexOf(level);
}

/**
 * True when unitBand is more than one CEFR step below profileBand.
 * Example: profile B2 → A2 is one below (keep); A1 is more than one (skip).
 */
export function isMoreThanOneBandBelow(
  unitBand: CefrLevel,
  profileBand: CefrLevel,
): boolean {
  const unitIdx = cefrBandIndex(unitBand);
  const profileIdx = cefrBandIndex(profileBand);
  if (unitIdx < 0 || profileIdx < 0) return false;
  return unitIdx < profileIdx - 1;
}
