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
export const PIANO_SKILLS_RAW: readonly PianoSkill[] = [
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
    lesson: {
      why: "Church and jazz rehearsals speak numbers; letter names slow key changes.",
      steps: [
        "In today’s key, map scale degrees 1–7 on the keyboard aloud.",
        "Name I, IV, V, vi as numbers only (no letter crutches).",
        "Walk a familiar hymn progression calling only numbers.",
      ],
      exercise: "Pick a worship song you know; say every chord as a Nashville number while you play roots.",
      passRule: "Full verse+chorus called as numbers without looking at letter chart.",
      tip: "Think function: 5 wants 1; 2 wants 5 — not just labels.",
    },
    keysHint: ["Ab", "F", "G"],
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
    lesson: {
      why: "Chord tones and fills start as intervals you can hear before you grab them.",
      steps: [
        "Sing m2–P8 from a fixed tonic; check on the keyboard.",
        "Play random intervals from C; name quality before looking.",
        "Find 3 and 7 of a random triad by ear only.",
      ],
      exercise: "Ten random intervals from C: name quality, then verify. Aim for 8/10.",
      passRule: "At least 8 of 10 interval qualities named correctly before checking.",
      tip: "Use familiar hymn interval hooks as anchors when naming quality.",
    },
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
    lesson: {
      why: "Circle fluency lets you transpose gospel charts and jazz turnarounds without freezing.",
      steps: [
        "Say the next key on the circle of fifths from today’s key.",
        "Play I–IV–V–I in that key, then move one circle step.",
        "Name the relative minor without hesitation.",
      ],
      exercise: "Clock three circle steps: each key get I–IV–V–I then relative minor tonic.",
      passRule: "Three consecutive keys completed with correct relative minors named.",
      tip: "Sharps climb FCGDAEB; flats fall BEADGCF — say it while you play.",
    },
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
    lesson: {
      why: "RCM expects even major and harmonic minor scales hands together at measured tempos — this builds speed without sloppy thumb turns.",
      steps: [
        "Today's key: major scale two octaves hands together using the finger chart.",
        "Same key: harmonic minor two octaves (raised 7th on the way up and down).",
        "Hands separate first if hands together collapses — then reunite at the same tempo.",
        "Log the key done when both major and harmonic minor pass.",
      ],
      exercise:
        "Major + harmonic minor in today's key, two octaves hands together each.",
      passRule:
        "Each scale type: 4 clean two-octave hands-together reps at start tempo. Mark key done when both pass.",
      tip: "Harmonic minor's augmented 2nd is correct — do not flatten it to feel 'easier'.",
    },
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
    lesson: {
      why: "Broken chords across the keyboard build classical hand shapes used in hymns and jazz outlines.",
      steps: [
        "Root-position major/minor triad arpeggios, two octaves.",
        "Add dominant 7th arpeggios in the same two keys.",
        "Metronome; even tone through thumb turns.",
      ],
      exercise: "Major/minor triad arpeggios, then dominant 7ths, in two keys HT.",
      passRule: "Each arpeggio type: one clean two-octave HT pass per key.",
      tip: "Shape the hand for the next note before you leave the current one.",
    },
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
    lesson: {
      why: "Hanon/Czerny-style drills in short blocks — never noodle past the timer.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Short etudes & finger independence: Hanon/Czerny-style drills in short blocks.",
        "Close with the drill — One etude phrase, hands separate then together, 4 clean reps.",
      ],
      exercise: "One etude phrase, hands separate then together, 4 clean reps.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
  },
  {
    id: "sk_ear_classical",
    slug: "ear-classical",
    domainId: "d1",
    title: "Classical ear & dictation",
    description:
      "Melodic dictation of short phrases; clap rhythms before play.",
    strand: "classical",
    prereqIds: ["sk_intervals_ear"],
    weekHint: 5,
    practicePrompt:
      "Dictate a 4-bar hymn phrase by ear, then check against score.",
    lesson: {
      why: "Melodic dictation of short phrases; clap rhythms before play.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Classical ear & dictation: Melodic dictation of short phrases; clap rhythms before play.",
        "Close with the drill — Dictate a 4-bar hymn phrase by ear, then check against score.",
      ],
      exercise: "Dictate a 4-bar hymn phrase by ear, then check against score.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
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
    lesson: {
      why: "Keeping eyes ahead and pulse alive is how you survive unfamiliar hymn settings on Sunday.",
      steps: [
        "Choose an unfamiliar hymn verse; set half tempo.",
        "Scan one bar ahead; do not stop for mistakes.",
        "Finish the verse; mark only the worst stumble for later.",
      ],
      exercise: "Sight-read one unfamiliar hymn verse at half tempo with no stopping.",
      passRule: "Full verse completed without pausing the pulse (wrong notes ok).",
      tip: "Pulse > perfection on first pass — fix later with targeted reps.",
    },
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
    lesson: {
      why: "Major scales with numbered degrees are the parent of every mode and most gospel fills. You must know finger numbers per key — not just C.",
      steps: [
        "Use today's key (shown above). Learn the right-hand and left-hand finger numbers before you speed up.",
        "Hands separate: one octave each hand at the start tempo. Then hands together for two octaves.",
        "Sing degrees 1–2–3–4–5–6–7–8 ascending, then back down while you play.",
        "Raise metronome only after 4 clean reps in a row.",
      ],
      exercise:
        "Two octaves hands together in today's key; sing 1–3–5–7 then complete the scale.",
      passRule:
        "4 consecutive clean two-octave hands-together reps at start tempo with correct finger numbers. Then mark the key done.",
      tip: "Thumb crossings stay quiet — if you bump the tempo at the turn, drop 4 BPM.",
    },
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
    lesson: {
      why: "Ionian→Locrian from one parent major teaches characteristic notes before chord–scale jargon.",
      steps: [
        "Pick parent major (C or today’s key).",
        "Play each mode from its root for one octave; name the mode.",
        "Stop on the characteristic tone (e.g. #4 Lydian, b7 Mixolydian).",
      ],
      exercise: "Parent C major: play each of the seven modes from its root; name the characteristic tone.",
      passRule: "All seven modes played with correct characteristic tone named.",
      tip: "Same white-key family, different gravity — hear where it wants to resolve.",
    },
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
    lesson: {
      why: "Natural vs harmonic minor matters for classical lines and gospel minor hymns (raised 7).",
      steps: [
        "Play natural minor ascending/descending in A and D.",
        "Repeat as harmonic minor; notice the raised 7.",
        "Resolve a short phrase to i using the leading tone.",
      ],
      exercise: "Compare natural vs harmonic minor in A and D; end each with a clear resolve to i.",
      passRule: "Both keys: hear and play the raised 7 difference without score.",
      tip: "Harmonic minor’s augmented 2nd is a feature — do not “fix” it by ear.",
    },
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
    lesson: {
      why: "Minor blues scale + gospel blue notes for fills and shout choruses.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Gospel blues scale: Minor blues scale + gospel blue notes for fills and shout choruses.",
        "Close with the drill — Blues scale over I7–IV7–I7 shout pattern; land on chord tones.",
      ],
      exercise: "Blues scale over I7–IV7–I7 shout pattern; land on chord tones.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
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
    lesson: {
      why: "Dominant sound for V7 and gospel I7; b7 as color, not mistake.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Mixolydian deep dive: Dominant sound for V7 and gospel I7; b7 as color, not mistake.",
        "Close with the drill — Improvise 8 bars Mixolydian over static I7 worship vamp.",
      ],
      exercise: "Improvise 8 bars Mixolydian over static I7 worship vamp.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
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
    lesson: {
      why: "Minor ii and funky minor grooves; natural 6 as the Dorian flag.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Dorian deep dive: Minor ii and funky minor grooves; natural 6 as the Dorian flag.",
        "Close with the drill — Dorian vamp on ii; contrast with Aeolian to hear the 6.",
      ],
      exercise: "Dorian vamp on ii; contrast with Aeolian to hear the 6.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
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
    lesson: {
      why: "Jazz melodic minor modes (Lydian Dominant, Altered, etc.) — Levine path.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Melodic minor modes: Jazz melodic minor modes (Lydian Dominant, Altered, etc.).",
        "Close with the drill — Play melodic minor from C; then Lydian Dominant and Altered from the same parent.",
      ],
      exercise: "Play melodic minor from C; then Lydian Dominant and Altered from the same parent.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
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
    lesson: {
      why: "Half-whole / whole-half for dim7 and dominant alterations.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Diminished (octatonic) scale: Half-whole / whole-half for dim7 and dominant alterations.",
        "Close with the drill — Half-whole from C over C7alt idea; resolve to Fmaj.",
      ],
      exercise: "Half-whole from C over C7alt idea; resolve to Fmaj.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
  },
  {
    id: "sk_whole_tone",
    slug: "whole-tone",
    domainId: "d2",
    title: "Whole-tone scale",
    description:
      "Augmented color and Impressionist / late-gospel color washes.",
    strand: "jazz",
    prereqIds: ["sk_diminished_scale"],
    weekHint: 14,
    practicePrompt:
      "Whole-tone run into a dominant, then resolve to tonic triad.",
    lesson: {
      why: "Augmented color and Impressionist / late-gospel color washes.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Whole-tone scale: Augmented color and Impressionist / late-gospel color washes.",
        "Close with the drill — Whole-tone run into a dominant, then resolve to tonic triad.",
      ],
      exercise: "Whole-tone run into a dominant, then resolve to tonic triad.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
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
    lesson: {
      why: "Assign default scales to maj7, m7, dom7, m7b5, alt — one-page mental map.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Chord–scale map: Assign default scales to maj7, m7, dom7, m7b5, alt.",
        "Close with the drill — Flash-card: see chord symbol → play matching scale ascending.",
      ],
      exercise: "Flash-card: see chord symbol → play matching scale ascending.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
  },

  // Domain 3 — harmony
  {
    id: "sk_triads_inversions",
    slug: "triads-inversions",
    domainId: "d3",
    title: "Triads & inversions",
    description:
      "All inversions in closed position; voice-leading between chords.",
    strand: "shared",
    prereqIds: ["sk_number_system"],
    weekHint: 3,
    practicePrompt:
      "I–IV–V–I in inversions with smooth top voice.",
    lesson: {
      why: "Smooth top voice between chords is how hymns and jazz comps avoid jumps.",
      steps: [
        "Play root-position I–IV–V–I in today’s key.",
        "Redo with closest inversions; track the top note.",
        "Voice-lead so the top voice moves by step when possible.",
      ],
      exercise: "I–IV–V–I in inversions with a smooth top voice; repeat at a steady pulse.",
      passRule: "Four chords with no top-voice leap larger than a third (except cadence).",
      tip: "Hold common tones; move the other voices the shortest path.",
    },
  },
  {
    id: "sk_seventh_chords",
    slug: "seventh-chords",
    domainId: "d3",
    title: "Seventh chords",
    description:
      "maj7, m7, dom7, m7b5, dim7 — quality recognition at the keyboard.",
    strand: "shared",
    prereqIds: ["sk_triads_inversions"],
    weekHint: 4,
    practicePrompt:
      "Cycle qualities on one root, then around the circle.",
    lesson: {
      why: "maj7 / m7 / dom7 / m7b5 / dim7 are the quality vocabulary for gospel and jazz charts.",
      steps: [
        "On one root, cycle maj7 → m7 → dom7 → m7b5 → dim7.",
        "Name the third and seventh quality each time.",
        "Move the same cycle one step around the circle.",
      ],
      exercise: "Cycle all five seventh qualities on today’s tonic, then on the next circle key.",
      passRule: "Both roots: each quality named correctly while held.",
      tip: "Guide tones (3 and 7) define the quality — roots alone do not.",
    },
  },
  {
    id: "sk_extensions_9_11_13",
    slug: "extensions-9-11-13",
    domainId: "d3",
    title: "Extensions 9 / 11 / 13",
    description:
      "Add color tones without muddying the third and seventh.",
    strand: "jazz",
    prereqIds: ["sk_seventh_chords"],
    weekHint: 8,
    practicePrompt:
      "Build Cmaj9, Dm11, G13; isolate guide tones then add extensions.",
    lesson: {
      why: "Add color tones without muddying the third and seventh.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Extensions 9 / 11 / 13: Add color tones without muddying the third and seventh.",
        "Close with the drill — Build Cmaj9, Dm11, G13; isolate guide tones then add extensions.",
      ],
      exercise: "Build Cmaj9, Dm11, G13; isolate guide tones then add extensions.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
  },
  {
    id: "sk_altered_dominants",
    slug: "altered-dominants",
    domainId: "d3",
    title: "Altered dominants",
    description:
      "b9, #9, #11, b13 vocabulary for V7alt resolutions.",
    strand: "jazz",
    prereqIds: ["sk_extensions_9_11_13"],
    weekHint: 11,
    practicePrompt:
      "G7alt shapes resolving to Cmaj; name each alteration.",
    lesson: {
      why: "b9, #9, #11, b13 vocabulary for V7alt resolutions.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Altered dominants: b9, #9, #11, b13 vocabulary for V7alt resolutions.",
        "Close with the drill — G7alt shapes resolving to Cmaj; name each alteration.",
      ],
      exercise: "G7alt shapes resolving to Cmaj; name each alteration.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
  },
  {
    id: "sk_tritone_subs",
    slug: "tritone-subs",
    domainId: "d3",
    title: "Tritone substitutions",
    description:
      "bII7 for V7; gospel and jazz turnaround applications.",
    strand: "gospel",
    prereqIds: ["sk_seventh_chords"],
    weekHint: 9,
    practicePrompt:
      "Replace V7 with bII7 in a 2-5-1; hear the bass leap.",
    lesson: {
      why: "bII7 for V7; gospel and jazz turnaround applications.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Tritone substitutions: bII7 for V7; gospel and jazz turnaround applications.",
        "Close with the drill — Replace V7 with bII7 in a 2-5-1; hear the bass leap.",
      ],
      exercise: "Replace V7 with bII7 in a 2-5-1; hear the bass leap.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
  },

  // Domain 4 — progressions
  {
    id: "sk_251_basic",
    slug: "two-five-one",
    domainId: "d4",
    title: "2-5-1 progressions",
    description:
      "Major and minor ii–V–I with solid rhythm and voice leading.",
    strand: "jazz",
    prereqIds: ["sk_seventh_chords"],
    weekHint: 5,
    practicePrompt:
      "ii–V–I in three keys, quarter-note pulse, no pedal wash.",
    lesson: {
      why: "Major/minor ii–V–I is the jazz highway; solid rhythm beats fancy extensions early.",
      steps: [
        "Spell ii, V, I qualities in today’s key.",
        "Play ii–V–I with quarter-note pulse; no pedal wash.",
        "Repeat in two more keys on the circle.",
      ],
      exercise: "ii–V–I in three keys, quarter-note pulse, clear chord changes.",
      passRule: "Three keys: each cadence lands on time with correct qualities.",
      tip: "Guide tones (3/7) first; add color only after the skeleton is locked.",
    },
  },
  {
    id: "sk_gospel_736",
    slug: "gospel-736",
    domainId: "d4",
    title: "Gospel 7-3-6 pattern",
    description:
      "Classic HearAndPlay / church 7→3→6 motion into relative minor.",
    strand: "gospel",
    prereqIds: ["sk_number_system", "sk_seventh_chords"],
    weekHint: 5,
    practicePrompt:
      "In Ab: play 7–3–6 with LH roots and RH triads, then add 7ths.",
    lesson: {
      why: "7–3–6 is classic church motion into the relative minor — HearAndPlay / service language.",
      steps: [
        "In Ab (or today’s key), locate 7, 3, and 6 as numbers.",
        "LH roots, RH triads on 7–3–6; feel the pull to vi.",
        "Add sevenths on each chord; keep a slow pulse.",
      ],
      exercise: "In Ab: play 7–3–6 with LH roots and RH triads, then add 7ths for two clean cycles.",
      passRule: "Two cycles with correct chord qualities and steady quarter pulse.",
      tip: "7 is the leading-tone chord into 3; do not rush the resolution to 6.",
    },
    keysHint: ["Ab", "F"],
  },
  {
    id: "sk_gospel_514",
    slug: "gospel-514",
    domainId: "d4",
    title: "Gospel 5-1-4 pattern",
    description:
      "Dominant → tonic → subdominant gospel cadence language.",
    strand: "gospel",
    prereqIds: ["sk_gospel_736"],
    weekHint: 6,
    practicePrompt:
      "5–1–4 walk into a praise chorus vamp; lock with metronome.",
    lesson: {
      why: "5–1–4 is dominant→tonic→subdominant gospel cadence language for praise vamps.",
      steps: [
        "Locate 5, 1, and 4 in today’s key as numbers.",
        "Play 5–1–4 with LH roots / RH triads into a short vamp.",
        "Lock with metronome; no rushing into 1.",
      ],
      exercise: "5–1–4 walk into a praise chorus vamp; eight bars locked to the metronome.",
      passRule: "Eight bars with correct numbers and no tempo surge on the 1.",
      tip: "Land the 1 clean; fills come after the cadence is solid.",
    },
  },
  {
    id: "sk_gospel_362",
    slug: "gospel-362",
    domainId: "d4",
    title: "Gospel 3-6-2 pattern",
    description:
      "Secondary motion feeding into ii and turnarounds.",
    strand: "gospel",
    prereqIds: ["sk_gospel_514"],
    weekHint: 7,
    practicePrompt:
      "3–6–2–5–1 full cycle in F and Bb.",
    lesson: {
      why: "3–6–2 feeds secondary motion into ii and sets up turnarounds.",
      steps: [
        "Map 3–6–2–5–1 in F, then Bb.",
        "Play with LH roots and RH sevenths if ready.",
        "Keep voice-leading between 2 and 5 smooth.",
      ],
      exercise: "3–6–2–5–1 full cycle in F and Bb at a steady pulse.",
      passRule: "Both keys: full cycle once each without stopping to “find” chords.",
      tip: "Think numbers across keys — do not rebuild from letter names each time.",
    },
    keysHint: ["F", "Bb"],
  },
  {
    id: "sk_walkups",
    slug: "walkups",
    domainId: "d4",
    title: "Bass walkups & walkdowns",
    description:
      "Chromatic and diatonic bass lines into target chords.",
    strand: "gospel",
    prereqIds: ["sk_gospel_514"],
    weekHint: 8,
    practicePrompt:
      "Walk up into IV and walk down into I on a slow hymn.",
    lesson: {
      why: "Chromatic and diatonic bass lines into target chords.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Bass walkups & walkdowns: Chromatic and diatonic bass lines into target chords.",
        "Close with the drill — Walk up into IV and walk down into I on a slow hymn.",
      ],
      exercise: "Walk up into IV and walk down into I on a slow hymn.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
  },
  {
    id: "sk_turnarounds",
    slug: "turnarounds",
    domainId: "d4",
    title: "Turnarounds",
    description:
      "I–VI–ii–V and gospel turnaround variants for verse endings.",
    strand: "shared",
    prereqIds: ["sk_251_basic"],
    weekHint: 9,
    practicePrompt:
      "Four turnaround flavors into the top of a blues form.",
    lesson: {
      why: "I–VI–ii–V and gospel turnaround variants for verse endings.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Turnarounds: I–VI–ii–V and gospel turnaround variants for verse endings.",
        "Close with the drill — Four turnaround flavors into the top of a blues form.",
      ],
      exercise: "Four turnaround flavors into the top of a blues form.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
  },
  {
    id: "sk_circular_progressions",
    slug: "circular-progressions",
    domainId: "d4",
    title: "Circular / cycle progressions",
    description:
      "Circle-of-fifths sequences and continuous gospel cycles.",
    strand: "gospel",
    prereqIds: ["sk_gospel_362", "sk_turnarounds"],
    weekHint: 12,
    practicePrompt:
      "Cycle fifths descending: play 7ths with smooth voice leading.",
    lesson: {
      why: "Circle-of-fifths sequences and continuous gospel cycles.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Circular / cycle progressions: Circle-of-fifths sequences and continuous gospel cycles.",
        "Close with the drill — Cycle fifths descending: play 7ths with smooth voice leading.",
      ],
      exercise: "Cycle fifths descending: play 7ths with smooth voice leading.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
  },

  // Domain 5 — voicings
  {
    id: "sk_shell_voicings",
    slug: "shell-voicings",
    domainId: "d5",
    title: "Shell voicings (3 & 7)",
    description:
      "Guide-tone shells for ii–V–I and gospel skeletons.",
    strand: "jazz",
    prereqIds: ["sk_seventh_chords"],
    weekHint: 6,
    practicePrompt:
      "LH shells only through a 2-5-1; RH silent.",
    lesson: {
      why: "3&7 shells are the guide-tone skeleton for ii–V–I and gospel comps.",
      steps: [
        "Build LH shell (3+7) for ii, V, and I in today’s key.",
        "Voice-lead shells through ii–V–I; RH silent.",
        "Repeat at a slow swing or straight pulse.",
      ],
      exercise: "LH shells only through a 2-5-1; RH stays silent for four cycles.",
      passRule: "Four cycles with correct 3/7 and stepwise shell motion where possible.",
      tip: "If the shell jumps, you grabbed the wrong inversion — find the common tone.",
    },
  },
  {
    id: "sk_extension_voicings",
    slug: "extension-voicings",
    domainId: "d5",
    title: "Extension voicings",
    description:
      "Add 9ths and 13ths above shells without doubling mud.",
    strand: "jazz",
    prereqIds: ["sk_shell_voicings", "sk_extensions_9_11_13"],
    weekHint: 9,
    practicePrompt:
      "Shell + 9/13 on each chord of a turnaround.",
    lesson: {
      why: "Add 9ths and 13ths above shells without doubling mud.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Extension voicings: Add 9ths and 13ths above shells without doubling mud.",
        "Close with the drill — Shell + 9/13 on each chord of a turnaround.",
      ],
      exercise: "Shell + 9/13 on each chord of a turnaround.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
  },
  {
    id: "sk_rootless_ab",
    slug: "rootless-a-b",
    domainId: "d5",
    title: "Rootless A/B voicings",
    description:
      "Classic jazz piano rootless A and B forms for major ii–V–I.",
    strand: "jazz",
    prereqIds: ["sk_extension_voicings"],
    weekHint: 11,
    practicePrompt:
      "A→B→A through ii–V–I in C, F, Bb.",
    lesson: {
      why: "Classic jazz piano rootless A and B forms for major ii–V–I.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Rootless A/B voicings: Classic jazz piano rootless A and B forms for major ii–V–I.",
        "Close with the drill — A→B→A through ii–V–I in C, F, Bb.",
      ],
      exercise: "A→B→A through ii–V–I in C, F, Bb.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
  },
  {
    id: "sk_ust",
    slug: "upper-structure-triads",
    domainId: "d5",
    title: "Upper-structure triads (UST)",
    description:
      "Triads over bass for altered and Lydian Dominant color.",
    strand: "jazz",
    prereqIds: ["sk_rootless_ab", "sk_altered_dominants"],
    weekHint: 15,
    practicePrompt:
      "Db triad over G7 (alt color); resolve to Cmaj.",
    lesson: {
      why: "Triads over bass for altered and Lydian Dominant color.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Upper-structure triads (UST): Triads over bass for altered and Lydian Dominant color.",
        "Close with the drill — Db triad over G7 (alt color); resolve to Cmaj.",
      ],
      exercise: "Db triad over G7 (alt color); resolve to Cmaj.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
  },
  {
    id: "sk_drop2",
    slug: "drop-2-voicings",
    domainId: "d5",
    title: "Drop-2 voicings (later)",
    description:
      "Spread voicings for ballads and big-church pads.",
    strand: "classical",
    prereqIds: ["sk_shell_voicings"],
    weekHint: 16,
    practicePrompt:
      "Drop-2 maj7/m7 on four chords of a hymn cadence.",
    lesson: {
      why: "Spread voicings for ballads and big-church pads.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Drop-2 voicings (later): Spread voicings for ballads and big-church pads.",
        "Close with the drill — Drop-2 maj7/m7 on four chords of a hymn cadence.",
      ],
      exercise: "Drop-2 maj7/m7 on four chords of a hymn cadence.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
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
    lesson: {
      why: "Warren-style LH (root–octave–chord) drives hymns and praise without fighting the singer.",
      steps: [
        "Practice root–octave–chord on a static I for four bars.",
        "Switch chords every two bars under a static RH triad.",
        "Keep the pattern even; no rushing the octave.",
      ],
      exercise: "LH pattern under a static RH triad; switch chords every 2 bars for 16 bars.",
      passRule: "16 bars with steady LH pattern and clean chord changes on time.",
      tip: "LH is the drummer — consistency over fancy fills.",
    },
  },
  {
    id: "sk_walking_bass",
    slug: "walking-bass",
    domainId: "d6",
    title: "Walking bass",
    description:
      "Quarter-note walking lines through blues and 2-5-1.",
    strand: "jazz",
    prereqIds: ["sk_251_basic"],
    weekHint: 10,
    practicePrompt:
      "Walk a blues in F; RH comps shells only.",
    lesson: {
      why: "Quarter-note walking lines through blues and 2-5-1.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Walking bass: Quarter-note walking lines through blues and 2-5-1.",
        "Close with the drill — Walk a blues in F; RH comps shells only.",
      ],
      exercise: "Walk a blues in F; RH comps shells only.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
  },
  {
    id: "sk_rootless_lh",
    slug: "rootless-lh",
    domainId: "d6",
    title: "Rootless LH under melody",
    description:
      "LH rootless voicings while RH carries melody or fills.",
    strand: "jazz",
    prereqIds: ["sk_rootless_ab"],
    weekHint: 13,
    practicePrompt:
      "Play a standard head: LH rootless, RH melody.",
    lesson: {
      why: "LH rootless voicings while RH carries melody or fills.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Rootless LH under melody: LH rootless voicings while RH carries melody or fills.",
        "Close with the drill — Play a standard head: LH rootless, RH melody.",
      ],
      exercise: "Play a standard head: LH rootless, RH melody.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
  },

  // Domain 7 — rhythm
  {
    id: "sk_swing_feel",
    slug: "swing-feel",
    domainId: "d7",
    title: "Swing feel",
    description:
      "Triplet-based swing on comps and walking; listen before play.",
    strand: "jazz",
    prereqIds: ["sk_shell_voicings"],
    weekHint: 8,
    practicePrompt:
      "Comp shells in swing eighths at 90 bpm; record and check pocket.",
    lesson: {
      why: "Triplet-based swing on comps and walking; listen before play.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Swing feel: Triplet-based swing on comps and walking; listen before play.",
        "Close with the drill — Comp shells in swing eighths at 90 bpm; record and check pocket.",
      ],
      exercise: "Comp shells in swing eighths at 90 bpm; record and check pocket.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
  },
  {
    id: "sk_six_eight",
    slug: "six-eight-feel",
    domainId: "d7",
    title: "6/8 worship feel",
    description:
      "Compound meter for ballads and slow gospel.",
    strand: "gospel",
    prereqIds: ["sk_warren_lh"],
    weekHint: 9,
    practicePrompt:
      "Hymn in 6/8 with LH pattern locking to dotted pulse.",
    lesson: {
      why: "Compound meter for ballads and slow gospel.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on 6/8 worship feel: Compound meter for ballads and slow gospel.",
        "Close with the drill — Hymn in 6/8 with LH pattern locking to dotted pulse.",
      ],
      exercise: "Hymn in 6/8 with LH pattern locking to dotted pulse.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
  },
  {
    id: "sk_twelve_eight_shout",
    slug: "twelve-eight-shout",
    domainId: "d7",
    title: "12/8 shout chorus",
    description:
      "Shout-chorus energy with blues scale and LH drive.",
    strand: "gospel",
    prereqIds: ["sk_gospel_blues_scale", "sk_six_eight"],
    weekHint: 12,
    practicePrompt:
      "12/8 shout vamp I7–IV7; fill on beats 2 and 4.",
    lesson: {
      why: "Shout-chorus energy with blues scale and LH drive.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on 12/8 shout chorus: Shout-chorus energy with blues scale and LH drive.",
        "Close with the drill — 12/8 shout vamp I7–IV7; fill on beats 2 and 4.",
      ],
      exercise: "12/8 shout vamp I7–IV7; fill on beats 2 and 4.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
  },
  {
    id: "sk_syncopation",
    slug: "syncopation",
    domainId: "d7",
    title: "Syncopation & anticipations",
    description:
      "Anticipate chord changes; off-beat gospel hits.",
    strand: "gospel",
    prereqIds: ["sk_swing_feel"],
    weekHint: 11,
    practicePrompt:
      "Anticipate the I chord by an eighth; keep LH on the beat.",
    lesson: {
      why: "Anticipate chord changes; off-beat gospel hits.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Syncopation & anticipations: Anticipate chord changes; off-beat gospel hits.",
        "Close with the drill — Anticipate the I chord by an eighth; keep LH on the beat.",
      ],
      exercise: "Anticipate the I chord by an eighth; keep LH on the beat.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
  },

  // Domain 8 — improvisation
  {
    id: "sk_chord_tone_solo",
    slug: "chord-tone-solo",
    domainId: "d8",
    title: "Chord-tone soloing",
    description:
      "Target 1–3–5–7 on each change before adding scales.",
    strand: "jazz",
    prereqIds: ["sk_251_basic"],
    weekHint: 9,
    practicePrompt:
      "Solo only chord tones on a slow 2-5-1; land on 3 or 7.",
    lesson: {
      why: "Target 1–3–5–7 on each change before adding scales.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Chord-tone soloing: Target 1–3–5–7 on each change before adding scales.",
        "Close with the drill — Solo only chord tones on a slow 2-5-1; land on 3 or 7.",
      ],
      exercise: "Solo only chord tones on a slow 2-5-1; land on 3 or 7.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
  },
  {
    id: "sk_approach_tones",
    slug: "approach-tones",
    domainId: "d8",
    title: "Approach tones",
    description:
      "Chromatic and diatonic approaches into chord tones.",
    strand: "jazz",
    prereqIds: ["sk_chord_tone_solo"],
    weekHint: 11,
    practicePrompt:
      "Approach every target tone from a half-step below.",
    lesson: {
      why: "Chromatic and diatonic approaches into chord tones.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Approach tones: Chromatic and diatonic approaches into chord tones.",
        "Close with the drill — Approach every target tone from a half-step below.",
      ],
      exercise: "Approach every target tone from a half-step below.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
  },
  {
    id: "sk_blues_improv",
    slug: "blues-improv",
    domainId: "d8",
    title: "Blues improvisation",
    description:
      "Gospel/jazz blues language over 12-bar form.",
    strand: "gospel",
    prereqIds: ["sk_gospel_blues_scale", "sk_chord_tone_solo"],
    weekHint: 10,
    practicePrompt:
      "Three choruses: chord tones → blues scale → mix.",
    lesson: {
      why: "Gospel/jazz blues language over 12-bar form.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Blues improvisation: Gospel/jazz blues language over 12-bar form.",
        "Close with the drill — Three choruses: chord tones → blues scale → mix.",
      ],
      exercise: "Three choruses: chord tones → blues scale → mix.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
  },
  {
    id: "sk_mode_solos",
    slug: "mode-solos",
    domainId: "d8",
    title: "Mode solos",
    description:
      "Static-mode improvisation over Mixolydian and Dorian vamps.",
    strand: "jazz",
    prereqIds: ["sk_mixolydian_deep", "sk_dorian_deep"],
    weekHint: 13,
    practicePrompt:
      "16 bars Mixolydian then 16 bars Dorian; contrast color notes.",
    lesson: {
      why: "Static-mode improvisation over Mixolydian and Dorian vamps.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Mode solos: Static-mode improvisation over Mixolydian and Dorian vamps.",
        "Close with the drill — 16 bars Mixolydian then 16 bars Dorian; contrast color notes.",
      ],
      exercise: "16 bars Mixolydian then 16 bars Dorian; contrast color notes.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
  },
  {
    id: "sk_251_soloing",
    slug: "two-five-one-soloing",
    domainId: "d8",
    title: "2-5-1 soloing",
    description:
      "Connect scales and approaches through changing harmony.",
    strand: "jazz",
    prereqIds: ["sk_approach_tones", "sk_chord_scale_map"],
    weekHint: 16,
    practicePrompt:
      "Solo 2-5-1 in all 12 keys — one chorus each, metronome on 2 and 4.",
    lesson: {
      why: "Connect scales and approaches through changing harmony.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on 2-5-1 soloing: Connect scales and approaches through changing harmony.",
        "Close with the drill — Solo 2-5-1 in all 12 keys — one chorus each, metronome on 2 and 4.",
      ],
      exercise: "Solo 2-5-1 in all 12 keys — one chorus each, metronome on 2 and 4.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
  },

  // Domain 9 — church accompaniment
  {
    id: "sk_hymn_accomp",
    slug: "hymn-accompaniment",
    domainId: "d9",
    title: "Hymn accompaniment",
    description:
      "Support congregational singing with clear harmony and pulse.",
    strand: "gospel",
    prereqIds: ["sk_warren_lh", "sk_sight_reading"],
    weekHint: 8,
    practicePrompt:
      "Accompany one hymn verse + chorus; no solo fills yet.",
    lesson: {
      why: "Congregational support needs clear harmony and pulse before any flashy fills.",
      steps: [
        "Play one hymn verse with LH bass + RH chords; no solo fills.",
        "Match a singing tempo; leave space for breath.",
        "Add chorus the same way; dynamics under the melody.",
      ],
      exercise: "Accompany one hymn verse + chorus; no solo fills — pulse and harmony only.",
      passRule: "Verse+chorus with steady pulse and no competing melody in the RH.",
      tip: "If you cannot hear an imaginary congregation, you are too loud or too busy.",
    },
  },
  {
    id: "sk_fills_intros",
    slug: "fills-intros-endings",
    domainId: "d9",
    title: "Fills, intros & endings",
    description:
      "Tasteful fills between phrases; stock intros and amen endings.",
    strand: "gospel",
    prereqIds: ["sk_hymn_accomp"],
    weekHint: 10,
    practicePrompt:
      "Write three intro templates and two ending cadences in Ab.",
    lesson: {
      why: "Tasteful fills between phrases; stock intros and amen endings.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Fills, intros & endings: Tasteful fills between phrases; stock intros and amen endings.",
        "Close with the drill — Write three intro templates and two ending cadences in Ab.",
      ],
      exercise: "Write three intro templates and two ending cadences in Ab.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
  },
  {
    id: "sk_accompany_singer",
    slug: "accompany-singer",
    domainId: "d9",
    title: "Accompany a singer",
    description:
      "Dynamic balance, leave space, follow rubato cues.",
    strand: "gospel",
    prereqIds: ["sk_fills_intros"],
    weekHint: 12,
    practicePrompt:
      "Play under a recorded vocal; match dynamics and breath points.",
    lesson: {
      why: "Dynamic balance, leave space, follow rubato cues.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Accompany a singer: Dynamic balance, leave space, follow rubato cues.",
        "Close with the drill — Play under a recorded vocal; match dynamics and breath points.",
      ],
      exercise: "Play under a recorded vocal; match dynamics and breath points.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
  },
  {
    id: "sk_bass_awareness",
    slug: "bass-awareness",
    domainId: "d9",
    title: "Bass awareness (band)",
    description:
      "Leave low register when bass is present; complement, don’t fight.",
    strand: "gospel",
    prereqIds: ["sk_warren_lh"],
    weekHint: 11,
    practicePrompt:
      "Comp mid/high only over a backing track with bass.",
    lesson: {
      why: "Leave low register when bass is present; complement, don’t fight.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Bass awareness (band): Leave low register when bass is present; complement, don’t fight.",
        "Close with the drill — Comp mid/high only over a backing track with bass.",
      ],
      exercise: "Comp mid/high only over a backing track with bass.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
  },
  {
    id: "sk_transpose_church",
    slug: "transpose-church",
    domainId: "d9",
    title: "Transpose for singers",
    description:
      "Move charts ±2 keys quickly using numbers, not letter names.",
    strand: "gospel",
    prereqIds: ["sk_number_system", "sk_hymn_accomp"],
    weekHint: 13,
    practicePrompt:
      "Take a hymn chart and transpose up a whole step by numbers.",
    lesson: {
      why: "Move charts ±2 keys quickly using numbers, not letter names.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Transpose for singers: Move charts ±2 keys quickly using numbers, not letter names.",
        "Close with the drill — Take a hymn chart and transpose up a whole step by numbers.",
      ],
      exercise: "Take a hymn chart and transpose up a whole step by numbers.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
  },

  // Domain 10 — repertoire
  {
    id: "sk_lead_sheets",
    slug: "lead-sheets",
    domainId: "d10",
    title: "Lead sheet fluency",
    description:
      "Read melody + chord symbols; invent simple accompaniment.",
    strand: "jazz",
    prereqIds: ["sk_shell_voicings"],
    weekHint: 10,
    practicePrompt:
      "Play a lead sheet head with shells; one chorus melody.",
    lesson: {
      why: "Read melody + chord symbols; invent simple accompaniment.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Lead sheet fluency: Read melody + chord symbols; invent simple accompaniment.",
        "Close with the drill — Play a lead sheet head with shells; one chorus melody.",
      ],
      exercise: "Play a lead sheet head with shells; one chorus melody.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
  },
  {
    id: "sk_hymn_reading",
    slug: "hymn-reading",
    domainId: "d10",
    title: "Hymnal reading",
    description:
      "Four-part hymn texture reduction for piano.",
    strand: "classical",
    prereqIds: ["sk_sight_reading"],
    weekHint: 9,
    practicePrompt:
      "Reduce SATB to RH chords + LH bass for one hymn.",
    lesson: {
      why: "Four-part hymn texture reduction for piano.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Hymnal reading: Four-part hymn texture reduction for piano.",
        "Close with the drill — Reduce SATB to RH chords + LH bass for one hymn.",
      ],
      exercise: "Reduce SATB to RH chords + LH bass for one hymn.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
  },
  {
    id: "sk_blues_forms",
    slug: "blues-forms",
    domainId: "d10",
    title: "Blues forms",
    description:
      "12-bar blues variants: jazz, gospel, and minor blues.",
    strand: "gospel",
    prereqIds: ["sk_blues_improv"],
    weekHint: 12,
    practicePrompt:
      "Play three blues forms; announce each form before starting.",
    lesson: {
      why: "12-bar blues variants: jazz, gospel, and minor blues.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Blues forms: 12-bar blues variants: jazz, gospel, and minor blues.",
        "Close with the drill — Play three blues forms; announce each form before starting.",
      ],
      exercise: "Play three blues forms; announce each form before starting.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
  },
  {
    id: "sk_standards",
    slug: "jazz-standards",
    domainId: "d10",
    title: "Jazz standards reading",
    description:
      "Common-practice standards forms (AABA, ABAC) with changes.",
    strand: "jazz",
    prereqIds: ["sk_lead_sheets", "sk_251_basic"],
    weekHint: 15,
    practicePrompt:
      "Learn one standard: head, shells, one improvised chorus.",
    lesson: {
      why: "Common-practice standards forms (AABA, ABAC) with changes.",
      steps: [
        "Set a metronome and stay inside the block timer.",
        "Focus on Jazz standards reading: Common-practice standards forms (AABA, ABAC) with changes.",
        "Close with the drill — Learn one standard: head, shells, one improvised chorus.",
      ],
      exercise: "Learn one standard: head, shells, one improvised chorus.",
      passRule: "Complete the exercise once cleanly at a steady pulse without stopping to noodle.",
      tip: "Stay on the assigned skill — do not wander into unrelated repertoire.",
    },
  },

  // Domain 11 — habits
  {
    id: "sk_practice_logging",
    slug: "practice-logging",
    domainId: "d11",
    title: "Practice logging",
    description:
      "Log blocks completed and skills touched every session.",
    strand: "shared",
    prereqIds: [],
    weekHint: 1,
    practicePrompt:
      "After today’s template, note what felt sticky in one sentence.",
    lesson: {
      why: "Without a short log, sessions blur into noodling and you lose track of what stuck.",
      steps: [
        "Before you play, glance at yesterday’s sticky note (one sentence).",
        "After each template block, jot one word: clean / sticky / breakthrough.",
        "At session end, write one sentence: what to reopen tomorrow.",
      ],
      exercise: "Complete today’s five blocks, then write one sticky sentence in your practice log.",
      passRule: "Log exists for this local day with at least one concrete sticky item.",
      tip: "Prefer verbs over moods — “LH octave rushed on beat 3” beats “felt bad”.",
    },
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
    lesson: {
      why: "Tempo only climbs after clean reps; rushing locks in uneven fingers.",
      steps: [
        "Pick one short target (scale fragment or shell pattern).",
        "Set metronome under comfort; play 3 fully clean reps.",
        "Only then raise +4 bpm; if any rep muddies, drop back.",
      ],
      exercise: "One major scale HT: start slow, raise only after 3 consecutive clean reps.",
      passRule: "Three clean reps at the session’s top tempo with no restart mid-rep.",
      tip: "Clean means even tone and steady pulse — not “mostly ok”.",
    },
    keysHint: ["C", "G"],
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
