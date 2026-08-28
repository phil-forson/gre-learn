import type {
  DailyTemplate,
  FocusMix,
  PianoDomain,
  PianoPhase,
  PianoSkill,
} from "@/features/piano/types";

export const DEFAULT_FOCUS_MIX: FocusMix = {
  gospel: 60,
  jazz: 25,
  classical: 15,
};

export const PIANO_DOMAINS: readonly PianoDomain[] = [
  {
    id: "d0",
    slug: "basics",
    index: 0,
    title: "Basics & number system",
    description:
      "Light revision — Nashville numbers, intervals, and key geography for an intermediate player.",
  },
  {
    id: "d1",
    slug: "technique_classical",
    index: 1,
    title: "Classical technique",
    description:
      "RCM-style scales, arpeggios, etudes, ear training, and sight reading — short daily reps.",
  },
  {
    id: "d2",
    slug: "scales_modes",
    index: 2,
    title: "Scales & modes",
    description:
      "Levine order: major → modes → minors → blues → melodic-minor modes → diminished → whole-tone → chord-scale map.",
  },
  {
    id: "d3",
    slug: "harmony_chords",
    index: 3,
    title: "Harmony & chords",
    description:
      "Triads through altered dominants and tritones — gospel and jazz chord vocabulary.",
  },
  {
    id: "d4",
    slug: "progressions",
    index: 4,
    title: "Progressions",
    description:
      "2-5-1, gospel 7-3-6 / 5-1-4 / 3-6-2 patterns, walkups, turnarounds, and circular motion.",
  },
  {
    id: "d5",
    slug: "voicings",
    index: 5,
    title: "Voicings",
    description:
      "Shells → extensions → rootless A/B → upper-structure triads → drop-2 later.",
  },
  {
    id: "d6",
    slug: "left_hand",
    index: 6,
    title: "Left hand",
    description:
      "Warren-style LH patterns, walking bass, and rootless LH under right-hand melody.",
  },
  {
    id: "d7",
    slug: "rhythm_feel",
    index: 7,
    title: "Rhythm & feel",
    description:
      "Swing, 6/8, 12/8 shout, syncopation, and pocket for church and combo.",
  },
  {
    id: "d8",
    slug: "improvisation",
    index: 8,
    title: "Improvisation",
    description:
      "Chord tones → approaches → blues → mode solos → 2-5-1 soloing.",
  },
  {
    id: "d9",
    slug: "church_accompaniment",
    index: 9,
    title: "Church accompaniment",
    description:
      "Hymns, fills, intros, endings, singer support, bass awareness, and transpose.",
  },
  {
    id: "d10",
    slug: "repertoire_reading",
    index: 10,
    title: "Repertoire & reading",
    description:
      "Lead sheets, hymns, blues forms, and jazz standards reading fluency.",
  },
  {
    id: "d11",
    slug: "habits",
    index: 11,
    title: "Practice habits",
    description: "Logging, metronome protocol, and anti-noodle discipline.",
  },
] as const;

/** Skill ids use sk_<slug> for stable references. */
export const PIANO_SKILLS: readonly PianoSkill[] = [
  // Domain 0 — basics (revision)
  {
    id: "sk_number_system",
    slug: "number-system",
    domainId: "d0",
    title: "Nashville number system",
    description:
      "Map scale degrees 1–7 in any key; call chords by number in rehearsal language.",
    strand: "shared",
    prereqIds: [],
    weekHint: 1,
    practicePrompt:
      "Pick a worship key and name every chord in a familiar hymn as numbers only.",
  },
  {
    id: "sk_intervals_ear",
    slug: "intervals-ear",
    domainId: "d0",
    title: "Intervals by ear & keyboard",
    description:
      "Sing and find m2–P8 on the keyboard; connect interval names to chord tones.",
    strand: "shared",
    prereqIds: ["sk_number_system"],
    weekHint: 1,
    practicePrompt:
      "Play random intervals from C and name quality before checking.",
  },
  {
    id: "sk_key_geography",
    slug: "key-geography",
    domainId: "d0",
    title: "Key geography & circle of fifths",
    description:
      "Move fluently through sharp/flat keys; locate relative minors without hesitation.",
    strand: "shared",
    prereqIds: ["sk_number_system"],
    weekHint: 2,
    practicePrompt:
      "Clock the circle: name next key, play I–IV–V–I, move one step.",
  },

  // Domain 1 — classical technique
  {
    id: "sk_rcm_scales",
    slug: "rcm-scales",
    domainId: "d1",
    title: "RCM major & minor scales",
    description:
      "Two-octave parallel scales with steady metronome; hands together, even tone.",
    strand: "classical",
    prereqIds: ["sk_key_geography"],
    weekHint: 2,
    practicePrompt:
      "One sharp and one flat major + relative harmonic minor at RCM tempo.",
  },
  {
    id: "sk_arpeggios",
    slug: "arpeggios",
    domainId: "d1",
    title: "Triad & seventh arpeggios",
    description:
      "Broken chords across the keyboard — classical hand shapes for fluency.",
    strand: "classical",
    prereqIds: ["sk_rcm_scales"],
    weekHint: 3,
    practicePrompt:
      "Root-position major/minor triad arpeggios, then dominant 7ths in two keys.",
  },
  {
    id: "sk_etudes_short",
    slug: "etudes-short",
    domainId: "d1",
    title: "Short etudes & finger independence",
    description:
      "Hanon/Czerny-style drills in short blocks — never noodle past the timer.",
    strand: "classical",
    prereqIds: ["sk_rcm_scales"],
    weekHint: 4,
    practicePrompt:
      "One etude phrase, hands separate then together, 4 clean reps.",
  },
  {
    id: "sk_ear_classical",
    slug: "ear-classical",
    domainId: "d1",
    title: "Classical ear & dictation",
    description: "Melodic dictation of short phrases; clap rhythms before play.",
    strand: "classical",
    prereqIds: ["sk_intervals_ear"],
    weekHint: 5,
    practicePrompt:
      "Dictate a 4-bar hymn phrase by ear, then check against score.",
  },
  {
    id: "sk_sight_reading",
    slug: "sight-reading",
    domainId: "d1",
    title: "Sight reading (hymn & simple score)",
    description:
      "Keep eyes ahead; maintain pulse through unfamiliar hymn settings.",
    strand: "classical",
    prereqIds: ["sk_rcm_scales"],
    weekHint: 6,
    practicePrompt:
      "Sight-read one unfamiliar hymn verse at half tempo, no stopping.",
  },

  // Domain 2 — scales & modes (Levine order) — first-class
  {
    id: "sk_major_scale_lab",
    slug: "major-scale-lab",
    domainId: "d2",
    title: "Major scale lab",
    description:
      "Major scale in all keys with degrees numbered; foundation for modes.",
    strand: "jazz",
    prereqIds: ["sk_key_geography"],
    weekHint: 2,
    practicePrompt:
      "Play major ascending/descending; sing 1–3–5–7 then fill in.",
  },
  {
    id: "sk_seven_modes",
    slug: "seven-modes",
    domainId: "d2",
    title: "Seven modes of major",
    description:
      "Ionian through Locrian from one parent major; hear characteristic notes.",
    strand: "jazz",
    prereqIds: ["sk_major_scale_lab"],
    weekHint: 3,
    practicePrompt:
      "Parent C major: play each mode from its root; name characteristic tone.",
  },
  {
    id: "sk_natural_harmonic_minor",
    slug: "natural-harmonic-minor",
    domainId: "d2",
    title: "Natural & harmonic minor",
    description:
      "Minor families for classical and gospel minor hymns; raised 7 awareness.",
    strand: "shared",
    prereqIds: ["sk_major_scale_lab"],
    weekHint: 4,
    practicePrompt:
      "Compare natural vs harmonic minor in A and D; resolve to i.",
  },
  {
    id: "sk_gospel_blues_scale",
    slug: "gospel-blues-scale",
    domainId: "d2",
    title: "Gospel blues scale",
    description:
      "Minor blues scale + gospel blue notes for fills and shout choruses.",
    strand: "gospel",
    prereqIds: ["sk_seven_modes"],
    weekHint: 5,
    practicePrompt:
      "Blues scale over I7–IV7–I7 shout pattern; land on chord tones.",
  },
  {
    id: "sk_mixolydian_deep",
    slug: "mixolydian-deep",
    domainId: "d2",
    title: "Mixolydian deep dive",
    description:
      "Dominant sound for V7 and gospel I7; b7 as color, not mistake.",
    strand: "gospel",
    prereqIds: ["sk_seven_modes"],
    weekHint: 6,
    practicePrompt:
      "Improvise 8 bars Mixolydian over static I7 worship vamp.",
  },
  {
    id: "sk_dorian_deep",
    slug: "dorian-deep",
    domainId: "d2",
    title: "Dorian deep dive",
    description:
      "Minor ii and funky minor grooves; natural 6 as the Dorian flag.",
    strand: "jazz",
    prereqIds: ["sk_seven_modes"],
    weekHint: 6,
    practicePrompt:
      "Dorian vamp on ii; contrast with Aeolian to hear the 6.",
  },
  {
    id: "sk_melodic_minor_modes",
    slug: "melodic-minor-modes",
    domainId: "d2",
    title: "Melodic minor modes",
    description:
      "Jazz melodic minor modes (Lydian Dominant, Altered, etc.) — Levine path.",
    strand: "jazz",
    prereqIds: ["sk_mixolydian_deep", "sk_dorian_deep"],
    weekHint: 10,
    practicePrompt:
      "Play melodic minor from C; then Lydian Dominant and Altered from the same parent.",
  },
  {
    id: "sk_diminished_scale",
    slug: "diminished-scale",
    domainId: "d2",
    title: "Diminished (octatonic) scale",
    description:
      "Half-whole / whole-half for dim7 and dominant alterations.",
    strand: "jazz",
    prereqIds: ["sk_melodic_minor_modes"],
    weekHint: 12,
    practicePrompt:
      "Half-whole from C over C7alt idea; resolve to Fmaj.",
  },
  {
    id: "sk_whole_tone",
    slug: "whole-tone",
    domainId: "d2",
    title: "Whole-tone scale",
    description: "Augmented color and Impressionist / late-gospel color washes.",
    strand: "jazz",
    prereqIds: ["sk_diminished_scale"],
    weekHint: 14,
    practicePrompt:
      "Whole-tone run into a dominant, then resolve to tonic triad.",
  },
  {
    id: "sk_chord_scale_map",
    slug: "chord-scale-map",
    domainId: "d2",
    title: "Chord–scale map",
    description:
      "Assign default scales to maj7, m7, dom7, m7b5, alt — one-page mental map.",
    strand: "jazz",
    prereqIds: ["sk_melodic_minor_modes"],
    weekHint: 14,
    practicePrompt:
      "Flash-card: see chord symbol → play matching scale ascending.",
  },

  // Domain 3 — harmony
  {
    id: "sk_triads_inversions",
    slug: "triads-inversions",
    domainId: "d3",
    title: "Triads & inversions",
    description: "All inversions in closed position; voice-leading between chords.",
    strand: "shared",
    prereqIds: ["sk_number_system"],
    weekHint: 3,
    practicePrompt:
      "I–IV–V–I in inversions with smooth top voice.",
  },
  {
    id: "sk_seventh_chords",
    slug: "seventh-chords",
    domainId: "d3",
    title: "Seventh chords",
    description: "maj7, m7, dom7, m7b5, dim7 — quality recognition at the keyboard.",
    strand: "shared",
    prereqIds: ["sk_triads_inversions"],
    weekHint: 4,
    practicePrompt:
      "Cycle qualities on one root, then around the circle.",
  },
  {
    id: "sk_extensions_9_11_13",
    slug: "extensions-9-11-13",
    domainId: "d3",
    title: "Extensions 9 / 11 / 13",
    description: "Add color tones without muddying the third and seventh.",
    strand: "jazz",
    prereqIds: ["sk_seventh_chords"],
    weekHint: 8,
    practicePrompt:
      "Build Cmaj9, Dm11, G13; isolate guide tones then add extensions.",
  },
  {
    id: "sk_altered_dominants",
    slug: "altered-dominants",
    domainId: "d3",
    title: "Altered dominants",
    description: "b9, #9, #11, b13 vocabulary for V7alt resolutions.",
    strand: "jazz",
    prereqIds: ["sk_extensions_9_11_13"],
    weekHint: 11,
    practicePrompt:
      "G7alt shapes resolving to Cmaj; name each alteration.",
  },
  {
    id: "sk_tritone_subs",
    slug: "tritone-subs",
    domainId: "d3",
    title: "Tritone substitutions",
    description: "bII7 for V7; gospel and jazz turnaround applications.",
    strand: "gospel",
    prereqIds: ["sk_seventh_chords"],
    weekHint: 9,
    practicePrompt:
      "Replace V7 with bII7 in a 2-5-1; hear the bass leap.",
  },

  // Domain 4 — progressions
  {
    id: "sk_251_basic",
    slug: "two-five-one",
    domainId: "d4",
    title: "2-5-1 progressions",
    description: "Major and minor ii–V–I with solid rhythm and voice leading.",
    strand: "jazz",
    prereqIds: ["sk_seventh_chords"],
    weekHint: 5,
    practicePrompt:
      "ii–V–I in three keys, quarter-note pulse, no pedal wash.",
  },
  {
    id: "sk_gospel_736",
    slug: "gospel-736",
    domainId: "d4",
    title: "Gospel 7-3-6 pattern",
    description: "Classic HearAndPlay / church 7→3→6 motion into relative minor.",
    strand: "gospel",
    prereqIds: ["sk_number_system", "sk_seventh_chords"],
    weekHint: 5,
    practicePrompt:
      "In Ab: play 7–3–6 with LH roots and RH triads, then add 7ths.",
  },
  {
    id: "sk_gospel_514",
    slug: "gospel-514",
    domainId: "d4",
    title: "Gospel 5-1-4 pattern",
    description: "Dominant → tonic → subdominant gospel cadence language.",
    strand: "gospel",
    prereqIds: ["sk_gospel_736"],
    weekHint: 6,
    practicePrompt:
      "5–1–4 walk into a praise chorus vamp; lock with metronome.",
  },
  {
    id: "sk_gospel_362",
    slug: "gospel-362",
    domainId: "d4",
    title: "Gospel 3-6-2 pattern",
    description: "Secondary motion feeding into ii and turnarounds.",
    strand: "gospel",
    prereqIds: ["sk_gospel_514"],
    weekHint: 7,
    practicePrompt:
      "3–6–2–5–1 full cycle in F and Bb.",
  },
  {
    id: "sk_walkups",
    slug: "walkups",
    domainId: "d4",
    title: "Bass walkups & walkdowns",
    description: "Chromatic and diatonic bass lines into target chords.",
    strand: "gospel",
    prereqIds: ["sk_gospel_514"],
    weekHint: 8,
    practicePrompt:
      "Walk up into IV and walk down into I on a slow hymn.",
  },
  {
    id: "sk_turnarounds",
    slug: "turnarounds",
    domainId: "d4",
    title: "Turnarounds",
    description: "I–VI–ii–V and gospel turnaround variants for verse endings.",
    strand: "shared",
    prereqIds: ["sk_251_basic"],
    weekHint: 9,
    practicePrompt:
      "Four turnaround flavors into the top of a blues form.",
  },
  {
    id: "sk_circular_progressions",
    slug: "circular-progressions",
    domainId: "d4",
    title: "Circular / cycle progressions",
    description: "Circle-of-fifths sequences and continuous gospel cycles.",
    strand: "gospel",
    prereqIds: ["sk_gospel_362", "sk_turnarounds"],
    weekHint: 12,
    practicePrompt:
      "Cycle fifths descending: play 7ths with smooth voice leading.",
  },

  // Domain 5 — voicings
  {
    id: "sk_shell_voicings",
    slug: "shell-voicings",
    domainId: "d5",
    title: "Shell voicings (3 & 7)",
    description: "Guide-tone shells for ii–V–I and gospel skeletons.",
    strand: "jazz",
    prereqIds: ["sk_seventh_chords"],
    weekHint: 6,
    practicePrompt:
      "LH shells only through a 2-5-1; RH silent.",
  },
  {
    id: "sk_extension_voicings",
    slug: "extension-voicings",
    domainId: "d5",
    title: "Extension voicings",
    description: "Add 9ths and 13ths above shells without doubling mud.",
    strand: "jazz",
    prereqIds: ["sk_shell_voicings", "sk_extensions_9_11_13"],
    weekHint: 9,
    practicePrompt:
      "Shell + 9/13 on each chord of a turnaround.",
  },
  {
    id: "sk_rootless_ab",
    slug: "rootless-a-b",
    domainId: "d5",
    title: "Rootless A/B voicings",
    description: "Classic jazz piano rootless A and B forms for major ii–V–I.",
    strand: "jazz",
    prereqIds: ["sk_extension_voicings"],
    weekHint: 11,
    practicePrompt:
      "A→B→A through ii–V–I in C, F, Bb.",
  },
  {
    id: "sk_ust",
    slug: "upper-structure-triads",
    domainId: "d5",
    title: "Upper-structure triads (UST)",
    description: "Triads over bass for altered and Lydian Dominant color.",
    strand: "jazz",
    prereqIds: ["sk_rootless_ab", "sk_altered_dominants"],
    weekHint: 15,
    practicePrompt:
      "Db triad over G7 (alt color); resolve to Cmaj.",
  },
  {
    id: "sk_drop2",
    slug: "drop-2-voicings",
    domainId: "d5",
    title: "Drop-2 voicings (later)",
    description: "Spread voicings for ballads and big-church pads.",
    strand: "classical",
    prereqIds: ["sk_shell_voicings"],
    weekHint: 16,
    practicePrompt:
      "Drop-2 maj7/m7 on four chords of a hymn cadence.",
  },

  // Domain 6 — left hand
  {
    id: "sk_warren_lh",
    slug: "warren-lh-patterns",
    domainId: "d6",
    title: "Warren-style LH patterns",
    description:
      "Gospel left-hand patterns (root–octave–chord) for praise and hymns.",
    strand: "gospel",
    prereqIds: ["sk_gospel_514"],
    weekHint: 7,
    practicePrompt:
      "LH pattern under a static RH triad; switch chords every 2 bars.",
  },
  {
    id: "sk_walking_bass",
    slug: "walking-bass",
    domainId: "d6",
    title: "Walking bass",
    description: "Quarter-note walking lines through blues and 2-5-1.",
    strand: "jazz",
    prereqIds: ["sk_251_basic"],
    weekHint: 10,
    practicePrompt:
      "Walk a blues in F; RH comps shells only.",
  },
  {
    id: "sk_rootless_lh",
    slug: "rootless-lh",
    domainId: "d6",
    title: "Rootless LH under melody",
    description: "LH rootless voicings while RH carries melody or fills.",
    strand: "jazz",
    prereqIds: ["sk_rootless_ab"],
    weekHint: 13,
    practicePrompt:
      "Play a standard head: LH rootless, RH melody.",
  },

  // Domain 7 — rhythm
  {
    id: "sk_swing_feel",
    slug: "swing-feel",
    domainId: "d7",
    title: "Swing feel",
    description: "Triplet-based swing on comps and walking; listen before play.",
    strand: "jazz",
    prereqIds: ["sk_shell_voicings"],
    weekHint: 8,
    practicePrompt:
      "Comp shells in swing eighths at 90 bpm; record and check pocket.",
  },
  {
    id: "sk_six_eight",
    slug: "six-eight-feel",
    domainId: "d7",
    title: "6/8 worship feel",
    description: "Compound meter for ballads and slow gospel.",
    strand: "gospel",
    prereqIds: ["sk_warren_lh"],
    weekHint: 9,
    practicePrompt:
      "Hymn in 6/8 with LH pattern locking to dotted pulse.",
  },
  {
    id: "sk_twelve_eight_shout",
    slug: "twelve-eight-shout",
    domainId: "d7",
    title: "12/8 shout chorus",
    description: "Shout-chorus energy with blues scale and LH drive.",
    strand: "gospel",
    prereqIds: ["sk_gospel_blues_scale", "sk_six_eight"],
    weekHint: 12,
    practicePrompt:
      "12/8 shout vamp I7–IV7; fill on beats 2 and 4.",
  },
  {
    id: "sk_syncopation",
    slug: "syncopation",
    domainId: "d7",
    title: "Syncopation & anticipations",
    description: "Anticipate chord changes; off-beat gospel hits.",
    strand: "gospel",
    prereqIds: ["sk_swing_feel"],
    weekHint: 11,
    practicePrompt:
      "Anticipate the I chord by an eighth; keep LH on the beat.",
  },

  // Domain 8 — improvisation
  {
    id: "sk_chord_tone_solo",
    slug: "chord-tone-solo",
    domainId: "d8",
    title: "Chord-tone soloing",
    description: "Target 1–3–5–7 on each change before adding scales.",
    strand: "jazz",
    prereqIds: ["sk_251_basic"],
    weekHint: 9,
    practicePrompt:
      "Solo only chord tones on a slow 2-5-1; land on 3 or 7.",
  },
  {
    id: "sk_approach_tones",
    slug: "approach-tones",
    domainId: "d8",
    title: "Approach tones",
    description: "Chromatic and diatonic approaches into chord tones.",
    strand: "jazz",
    prereqIds: ["sk_chord_tone_solo"],
    weekHint: 11,
    practicePrompt:
      "Approach every target tone from a half-step below.",
  },
  {
    id: "sk_blues_improv",
    slug: "blues-improv",
    domainId: "d8",
    title: "Blues improvisation",
    description: "Gospel/jazz blues language over 12-bar form.",
    strand: "gospel",
    prereqIds: ["sk_gospel_blues_scale", "sk_chord_tone_solo"],
    weekHint: 10,
    practicePrompt:
      "Three choruses: chord tones → blues scale → mix.",
  },
  {
    id: "sk_mode_solos",
    slug: "mode-solos",
    domainId: "d8",
    title: "Mode solos",
    description: "Static-mode improvisation over Mixolydian and Dorian vamps.",
    strand: "jazz",
    prereqIds: ["sk_mixolydian_deep", "sk_dorian_deep"],
    weekHint: 13,
    practicePrompt:
      "16 bars Mixolydian then 16 bars Dorian; contrast color notes.",
  },
  {
    id: "sk_251_soloing",
    slug: "two-five-one-soloing",
    domainId: "d8",
    title: "2-5-1 soloing",
    description: "Connect scales and approaches through changing harmony.",
    strand: "jazz",
    prereqIds: ["sk_approach_tones", "sk_chord_scale_map"],
    weekHint: 16,
    practicePrompt:
      "Solo 2-5-1 in all 12 keys — one chorus each, metronome on 2 and 4.",
  },

  // Domain 9 — church accompaniment
  {
    id: "sk_hymn_accomp",
    slug: "hymn-accompaniment",
    domainId: "d9",
    title: "Hymn accompaniment",
    description: "Support congregational singing with clear harmony and pulse.",
    strand: "gospel",
    prereqIds: ["sk_warren_lh", "sk_sight_reading"],
    weekHint: 8,
    practicePrompt:
      "Accompany one hymn verse + chorus; no solo fills yet.",
  },
  {
    id: "sk_fills_intros",
    slug: "fills-intros-endings",
    domainId: "d9",
    title: "Fills, intros & endings",
    description: "Tasteful fills between phrases; stock intros and amen endings.",
    strand: "gospel",
    prereqIds: ["sk_hymn_accomp"],
    weekHint: 10,
    practicePrompt:
      "Write three intro templates and two ending cadences in Ab.",
  },
  {
    id: "sk_accompany_singer",
    slug: "accompany-singer",
    domainId: "d9",
    title: "Accompany a singer",
    description: "Dynamic balance, leave space, follow rubato cues.",
    strand: "gospel",
    prereqIds: ["sk_fills_intros"],
    weekHint: 12,
    practicePrompt:
      "Play under a recorded vocal; match dynamics and breath points.",
  },
  {
    id: "sk_bass_awareness",
    slug: "bass-awareness",
    domainId: "d9",
    title: "Bass awareness (band)",
    description: "Leave low register when bass is present; complement, don’t fight.",
    strand: "gospel",
    prereqIds: ["sk_warren_lh"],
    weekHint: 11,
    practicePrompt:
      "Comp mid/high only over a backing track with bass.",
  },
  {
    id: "sk_transpose_church",
    slug: "transpose-church",
    domainId: "d9",
    title: "Transpose for singers",
    description: "Move charts ±2 keys quickly using numbers, not letter names.",
    strand: "gospel",
    prereqIds: ["sk_number_system", "sk_hymn_accomp"],
    weekHint: 13,
    practicePrompt:
      "Take a hymn chart and transpose up a whole step by numbers.",
  },

  // Domain 10 — repertoire
  {
    id: "sk_lead_sheets",
    slug: "lead-sheets",
    domainId: "d10",
    title: "Lead sheet fluency",
    description: "Read melody + chord symbols; invent simple accompaniment.",
    strand: "jazz",
    prereqIds: ["sk_shell_voicings"],
    weekHint: 10,
    practicePrompt:
      "Play a lead sheet head with shells; one chorus melody.",
  },
  {
    id: "sk_hymn_reading",
    slug: "hymn-reading",
    domainId: "d10",
    title: "Hymnal reading",
    description: "Four-part hymn texture reduction for piano.",
    strand: "classical",
    prereqIds: ["sk_sight_reading"],
    weekHint: 9,
    practicePrompt:
      "Reduce SATB to RH chords + LH bass for one hymn.",
  },
  {
    id: "sk_blues_forms",
    slug: "blues-forms",
    domainId: "d10",
    title: "Blues forms",
    description: "12-bar blues variants: jazz, gospel, and minor blues.",
    strand: "gospel",
    prereqIds: ["sk_blues_improv"],
    weekHint: 12,
    practicePrompt:
      "Play three blues forms; announce each form before starting.",
  },
  {
    id: "sk_standards",
    slug: "jazz-standards",
    domainId: "d10",
    title: "Jazz standards reading",
    description: "Common-practice standards forms (AABA, ABAC) with changes.",
    strand: "jazz",
    prereqIds: ["sk_lead_sheets", "sk_251_basic"],
    weekHint: 15,
    practicePrompt:
      "Learn one standard: head, shells, one improvised chorus.",
  },

  // Domain 11 — habits
  {
    id: "sk_practice_logging",
    slug: "practice-logging",
    domainId: "d11",
    title: "Practice logging",
    description: "Log blocks completed and skills touched every session.",
    strand: "shared",
    prereqIds: [],
    weekHint: 1,
    practicePrompt:
      "After today’s template, note what felt sticky in one sentence.",
  },
  {
    id: "sk_metronome_protocol",
    slug: "metronome-protocol",
    domainId: "d11",
    title: "Metronome protocol",
    description:
      "Slow → clean → +4 bpm rule; never raise tempo on muddy reps.",
    strand: "shared",
    prereqIds: ["sk_practice_logging"],
    weekHint: 2,
    practicePrompt:
      "Pick one scale: start slow, raise only after 3 clean reps.",
  },
] as const;

export const DAILY_TEMPLATE: DailyTemplate = {
  id: "piano-60",
  title: "60-minute anti-noodle day",
  totalMinutes: 60,
  blocks: [
    {
      id: "scale_mode_lab",
      label: "Scale / mode lab",
      minutes: 12,
      description: "Focused scale or mode work from the active phase.",
    },
    {
      id: "key_chord_lab",
      label: "Key / chord lab",
      minutes: 13,
      description: "Harmony, voicings, or progressions in today’s keys.",
    },
    {
      id: "gospel_core",
      label: "Gospel core",
      minutes: 20,
      description: "Church patterns, LH, accompaniment, or gospel repertoire.",
    },
    {
      id: "jazz_application",
      label: "Jazz application",
      minutes: 10,
      description: "2-5-1, rootless, swing, or standard application.",
    },
    {
      id: "ear_or_reading",
      label: "Ear or reading",
      minutes: 5,
      description: "Short ear drill or sight / lead-sheet reading.",
    },
  ],
};

export const PIANO_PHASES: readonly PianoPhase[] = [
  {
    phaseIndex: 0,
    title: "Month 1 — Foundations refresh",
    description:
      "Light Domain 0 revision + early scales/modes and gospel number fluency.",
    focusMix: DEFAULT_FOCUS_MIX,
    skillIds: [
      "sk_practice_logging",
      "sk_metronome_protocol",
      "sk_number_system",
      "sk_intervals_ear",
      "sk_key_geography",
      "sk_major_scale_lab",
      "sk_triads_inversions",
      "sk_rcm_scales",
      "sk_seventh_chords",
      "sk_gospel_736",
    ],
  },
  {
    phaseIndex: 1,
    title: "Month 2 — Modes & gospel cadence",
    description: "Seven modes, gospel 5-1-4 / 3-6-2, shells, and hymn base.",
    focusMix: DEFAULT_FOCUS_MIX,
    skillIds: [
      "sk_seven_modes",
      "sk_natural_harmonic_minor",
      "sk_gospel_514",
      "sk_gospel_362",
      "sk_251_basic",
      "sk_shell_voicings",
      "sk_warren_lh",
      "sk_arpeggios",
      "sk_sight_reading",
      "sk_hymn_accomp",
    ],
  },
  {
    phaseIndex: 2,
    title: "Month 3 — Blues, walkups & feel",
    description: "Gospel blues scale, Mixo/Dorian depth, walkups, swing, fills.",
    focusMix: DEFAULT_FOCUS_MIX,
    skillIds: [
      "sk_gospel_blues_scale",
      "sk_mixolydian_deep",
      "sk_dorian_deep",
      "sk_walkups",
      "sk_tritone_subs",
      "sk_extensions_9_11_13",
      "sk_swing_feel",
      "sk_six_eight",
      "sk_fills_intros",
      "sk_blues_improv",
      "sk_hymn_reading",
    ],
  },
  {
    phaseIndex: 3,
    title: "Month 4 — Voicings & turnarounds",
    description: "Extension/rootless path, turnarounds, ear, singer support.",
    focusMix: DEFAULT_FOCUS_MIX,
    skillIds: [
      "sk_extension_voicings",
      "sk_turnarounds",
      "sk_chord_tone_solo",
      "sk_approach_tones",
      "sk_ear_classical",
      "sk_etudes_short",
      "sk_syncopation",
      "sk_bass_awareness",
      "sk_accompany_singer",
      "sk_lead_sheets",
      "sk_walking_bass",
    ],
  },
  {
    phaseIndex: 4,
    title: "Month 5 — Melodic minor & shout",
    description: "Melodic-minor modes, altered, UST intro, 12/8 shout, blues forms.",
    focusMix: DEFAULT_FOCUS_MIX,
    skillIds: [
      "sk_melodic_minor_modes",
      "sk_altered_dominants",
      "sk_rootless_ab",
      "sk_circular_progressions",
      "sk_twelve_eight_shout",
      "sk_mode_solos",
      "sk_blues_forms",
      "sk_transpose_church",
      "sk_rootless_lh",
      "sk_chord_scale_map",
    ],
  },
  {
    phaseIndex: 5,
    title: "Month 6 — Integration",
    description:
      "Diminished/whole-tone, UST/drop-2, 2-5-1 soloing, standards polish.",
    focusMix: DEFAULT_FOCUS_MIX,
    skillIds: [
      "sk_diminished_scale",
      "sk_whole_tone",
      "sk_ust",
      "sk_drop2",
      "sk_251_soloing",
      "sk_standards",
    ],
  },
] as const;
