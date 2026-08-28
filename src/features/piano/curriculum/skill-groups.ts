/** All domain d2 skills — scale/mode/chord-scale lab content. */
export const D2_SKILL_IDS = new Set([
  "sk_major_scale_lab",
  "sk_seven_modes",
  "sk_natural_harmonic_minor",
  "sk_gospel_blues_scale",
  "sk_mixolydian_deep",
  "sk_dorian_deep",
  "sk_melodic_minor_modes",
  "sk_diminished_scale",
  "sk_whole_tone",
  "sk_chord_scale_map",
]);

/** Scale/mode drills — scale_mode_lab only, never other Today blocks. */
export const SCALE_MODE_BLOCK_SKILL_IDS = new Set([
  ...D2_SKILL_IDS,
  "sk_rcm_scales",
  "sk_arpeggios",
]);

/** Major-scale fingering chart + scale exercise overlay. */
export const SCALE_FINGERING_SKILL_IDS = new Set([
  "sk_major_scale_lab",
  "sk_rcm_scales",
]);

/** 12-key chip progress on Today. */
export const KEY_TRACKING_SKILL_IDS = new Set([
  "sk_major_scale_lab",
  "sk_rcm_scales",
  "sk_seven_modes",
  "sk_key_geography",
]);

/** Classical ear/sight — ear_or_reading block only. */
export const EAR_READING_SKILL_IDS = new Set([
  "sk_ear_classical",
  "sk_sight_reading",
  "sk_intervals_ear",
  "sk_lead_sheets",
  "sk_hymn_reading",
]);

/** Per-block skills that must never appear here. */
export const BLOCK_FORBIDDEN_SKILLS: Record<string, ReadonlySet<string>> = {
  jazz_application: SCALE_MODE_BLOCK_SKILL_IDS,
  gospel_core: SCALE_MODE_BLOCK_SKILL_IDS,
  key_chord_lab: SCALE_MODE_BLOCK_SKILL_IDS,
  ear_or_reading: SCALE_MODE_BLOCK_SKILL_IDS,
  scale_mode_lab: new Set(["sk_practice_logging", "sk_metronome_protocol"]),
};
