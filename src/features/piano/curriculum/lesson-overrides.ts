import type { PianoSkillLesson } from "@/features/piano/types";
import { PIANO_SOURCES } from "./sources";

export const BOILERPLATE_PASS_RULE =
  "Complete the exercise once cleanly at a steady pulse without stopping to noodle.";

export const LESSON_OVERRIDES: Partial<Record<string, PianoSkillLesson>> = {
  sk_etudes_short: {
    why: "Short Hanon-style drills build even fingers for hymn runs and gospel fills without burning the whole block.",
    steps: [
      "Open Hanon Exercise 1 (or any single 4-bar phrase) from IMSLP.",
      "Hands separate at 60 BPM; 4 clean reps each hand.",
      "Hands together at the same tempo; 4 consecutive clean reps.",
    ],
    exercise:
      "One Hanon phrase (4 bars): hands separate then together, 4 clean reps at 60 BPM.",
    passRule:
      "4 consecutive hands-together reps with even tone and no missed notes at 60 BPM.",
    tip: "Stop at 4 reps — independence gains come from clean stops, not endless repeats.",
    sources: [PIANO_SOURCES.imslpHanon, PIANO_SOURCES.rcmSyllabi],
  },

  sk_ear_classical: {
    why: "Dictating hymn phrases trains your ear for Sunday surprises when the choir jumps a line you have not seen.",
    steps: [
      "Pick a 4-bar hymn phrase you know by sound but have not memorized on paper.",
      "Clap the rhythm twice before touching the keys.",
      "Notate or play back the melody; check against the score.",
    ],
    exercise:
      "Dictate a 4-bar hymn phrase by ear, then verify pitch and rhythm against the score.",
    passRule:
      "Rhythm matches score; at least 75% of pitches correct on first check.",
    tip: "Clap first — rhythm errors are harder to fix after you lock in wrong notes.",
    sources: [PIANO_SOURCES.musictheoryNetIntervals, PIANO_SOURCES.rcmSyllabi],
  },

  sk_gospel_blues_scale: {
    why: "The gospel blues scale (minor pentatonic + blue notes) is the language of shout fills and turnaround licks.",
    steps: [
      "Spell the minor blues scale from the tonic in today's key.",
      "Play I7–IV7–I7 vamp LH; RH blues scale ascending and descending.",
      "Improvise 4 bars landing on chord tones (3 or b7) on beats 1 and 3.",
    ],
    exercise:
      "Blues scale over I7–IV7–I7 shout pattern; land on chord tones at bar lines.",
    passRule:
      "8-bar improvisation with chord-tone arrivals on at least 6 of 8 downbeats.",
    tip: "b3 and b5 are color — resolve them to chord tones before the next change.",
    sources: [PIANO_SOURCES.bluesForm12Bar, PIANO_SOURCES.hearAndPlay],
  },

  sk_mixolydian_deep: {
    why: "Mixolydian is the dominant sound behind gospel I7 vamps and V7 chords — the b7 is intentional color.",
    steps: [
      "Play Mixolydian ascending/descending from the tonic in today's key.",
      "Hold the b7 against a static I7 LH; hear it as stable, not wrong.",
      "Improvise 8 bars over a worship I7 vamp using only Mixolydian tones.",
    ],
    exercise:
      "Improvise 8 bars Mixolydian over a static I7 worship vamp.",
    passRule:
      "8 bars completed without pausing; b7 used at least twice as a held color tone.",
    tip: "Mixolydian on I7 feels like home in church — do not rush to major.",
    sources: [PIANO_SOURCES.openMusicTheoryModes, PIANO_SOURCES.hearAndPlay],
  },

  sk_dorian_deep: {
    why: "Dorian's natural 6 separates minor ii grooves from sad Aeolian — essential for funk-gospel and jazz minor vamps.",
    steps: [
      "Play Dorian and Aeolian side by side from the same root; isolate the 6 vs b6.",
      "Vamp on ii7; improvise 8 bars Dorian only.",
      "Switch to Aeolian for 4 bars — name which note changed the mood.",
    ],
    exercise:
      "Dorian vamp on ii7 for 8 bars, then 4 bars Aeolian contrast on the same root.",
    passRule:
      "Hear and play the natural 6 difference; Dorian section uses 6 at least 3 times.",
    tip: "The 6 is Dorian's flag — if it sounds too dark, you slipped into Aeolian.",
    sources: [PIANO_SOURCES.openMusicTheoryModes, PIANO_SOURCES.levineJazzPiano],
  },

  sk_melodic_minor_modes: {
    why: "Melodic minor generates Lydian Dominant and Altered scales — the jazz vocabulary behind modern gospel reharmonizations.",
    steps: [
      "Play C melodic minor ascending and descending.",
      "From the same notes, play Lydian Dominant from the 4th degree (F).",
      "From the same notes, play Altered from the 7th degree (B).",
    ],
    exercise:
      "Play melodic minor from C; then Lydian Dominant and Altered from the same parent.",
    passRule:
      "All three modes played correctly with parent scale named before each.",
    tip: "One parent, three jobs — memorize the mode roots, not three separate scales.",
    sources: [PIANO_SOURCES.levineJazzPiano, PIANO_SOURCES.openMusicTheoryModes],
  },

  sk_diminished_scale: {
    why: "Half-whole diminished over dominant chords creates tension gospel and jazz players use before resolving home.",
    steps: [
      "Play half-whole diminished ascending from C (C–Db–Eb–E–F#–G–A–Bb).",
      "Hold C7 LH; run half-whole scale RH for 2 bars.",
      "Resolve to Fmaj with a clear cadence.",
    ],
    exercise:
      "Half-whole diminished from C over C7alt idea; resolve cleanly to Fmaj.",
    passRule:
      "Scale run + resolution in one take; landing chord held 2 beats without fumbling.",
    tip: "Half-whole starts on the dominant root — whole-half starts on the dim7 root.",
    sources: [PIANO_SOURCES.levineJazzPiano, PIANO_SOURCES.jazzAdvice251],
  },

  sk_whole_tone: {
    why: "Whole-tone color adds Impressionist wash and late-gospel shimmer over augmented and dominant chords.",
    steps: [
      "Play whole-tone scale from C (C–D–E–F#–G#–Bb).",
      "Run whole-tone into a G7 chord, then resolve to Cmaj triad.",
      "Use whole-tone as a 2-bar fill between hymn phrases.",
    ],
    exercise:
      "Whole-tone run into a dominant, then resolve to tonic triad.",
    passRule:
      "Fill + dominant + tonic resolution in one pass with no pause between sections.",
    tip: "Whole-tone has no leading tone — plan your exit note before you start.",
    sources: [PIANO_SOURCES.levineJazzPiano, PIANO_SOURCES.openMusicTheoryModes],
  },

  sk_chord_scale_map: {
    why: "A one-page chord–scale map stops you from guessing when the chart says maj7, m7, dom7, or alt.",
    steps: [
      "Review defaults: maj7→Ionian, m7→Dorian, dom7→Mixolydian, m7b5→Locrian, alt→Altered.",
      "Flash each chord symbol; play the matching scale ascending one octave.",
      "Cycle through all five qualities on two different roots.",
    ],
    exercise:
      "Flash-card drill: see chord symbol → play matching scale ascending within 3 seconds.",
    passRule:
      "5 chord types × 2 roots = 10 prompts; at least 8 correct scales on first try.",
    tip: "When in doubt on dom7, Mixolydian is the safe church default.",
    sources: [PIANO_SOURCES.levineJazzPiano, PIANO_SOURCES.jazzAdvice251],
  },

  sk_extensions_9_11_13: {
    why: "9ths, 11ths, and 13ths add color without replacing the 3rd and 7th that define the chord quality.",
    steps: [
      "Build Cmaj7 shell (3+7); add the 9th above without doubling the root.",
      "Build Dm11 and G13; isolate 3 and 7 before adding extensions.",
      "Voice-lead all three through a slow ii–V–I.",
    ],
    exercise:
      "Build Cmaj9, Dm11, G13; isolate guide tones then add extensions.",
    passRule:
      "All three chords voiced with clear 3 and 7 audible; no doubled muddy roots in RH.",
    tip: "Drop the 5th before stacking extensions — the 5th is the first casualty.",
    sources: [PIANO_SOURCES.levineJazzPiano, PIANO_SOURCES.pianoGroove251],
  },

  sk_altered_dominants: {
    why: "Altered dominants (b9, #9, #11, b13) create pull into major and minor targets — core jazz-gospel vocabulary.",
    steps: [
      "Spell G7alt: identify b9, #9, #11, b13 available tones.",
      "Play three different G7alt RH shapes over G in the bass.",
      "Resolve each shape to Cmaj7 with smooth voice leading.",
    ],
    exercise:
      "G7alt shapes resolving to Cmaj; name each alteration aloud as you play.",
    passRule:
      "3 distinct alt voicings each resolving to Cmaj7; alteration named correctly for each.",
    tip: "You do not need every alteration at once — 2–3 strong tensions beat a cluttered stack.",
    sources: [PIANO_SOURCES.levineJazzPiano, PIANO_SOURCES.jazzAdvice251],
  },

  sk_tritone_subs: {
    why: "Tritone substitution (bII7 for V7) is a gospel and jazz shortcut that adds bass drama in turnarounds.",
    steps: [
      "Play Dm7–G7–Cmaj7 in C; hear the G7 pull.",
      "Replace G7 with Db7 (same 3rd and 7th); feel the bass leap.",
      "Run ii–bII7–I in two keys.",
    ],
    exercise:
      "Replace V7 with bII7 in a 2-5-1; hear the bass leap in C and F.",
    passRule:
      "Both keys: bII7 substitution played with correct 3/7 and clean resolution to I.",
    tip: "The tritone sub shares guide tones with V7 — that is why it works.",
    sources: [PIANO_SOURCES.jazzAdvice251, PIANO_SOURCES.hearAndPlay],
  },

  sk_walkups: {
    why: "Bass walkups and walkdowns connect hymn changes smoothly when the congregation expects motion into the next chord.",
    steps: [
      "On a slow hymn in F, walk up diatonically into IV (Bb).",
      "Walk down chromatically from V back to I.",
      "Add RH triads on each bass arrival; keep quarter-note pulse.",
    ],
    exercise:
      "Walk up into IV and walk down into I on a slow hymn in F.",
    passRule:
      "Both walkups land on target chord on beat 1; no RH chord ahead of the bass.",
    tip: "Chromatic approach tones work best when the target chord is a strong downbeat.",
    sources: [PIANO_SOURCES.hearAndPlay, PIANO_SOURCES.gospelChopsWarren],
  },

  sk_turnarounds: {
    why: "Turnarounds (I–VI–ii–V and gospel variants) reset the form so you can loop verses and shout sections cleanly.",
    steps: [
      "Play I–VI–ii–V–I in C with root-position triads.",
      "Add gospel variant: I–bVII–IV–I in the same key.",
      "Play four turnaround flavors into the top of a 12-bar blues.",
    ],
    exercise:
      "Four turnaround flavors into the top of a blues form in F.",
    passRule:
      "All four turnarounds return to I on time; each flavor named before you play it.",
    tip: "The bVII–IV move is pure church — practice it in Ab and Bb.",
    sources: [PIANO_SOURCES.jazzAdvice251, PIANO_SOURCES.hearAndPlay],
  },

  sk_circular_progressions: {
    why: "Circle-of-fifths cycles power continuous gospel vamps and jazz standards — voice leading keeps them smooth.",
    steps: [
      "Play descending fifths: Em7–A7–Dm7–G7–Cmaj7 with LH roots.",
      "Voice-lead 7th chords so the top voice moves by step.",
      "Loop the cycle twice without stopping.",
    ],
    exercise:
      "Cycle fifths descending: play 7ths with smooth voice leading for two full loops.",
    passRule:
      "Two complete cycles with no pause; top voice moves by step or common tone on every change.",
    tip: "If your RH jumps an octave, pick a closer inversion — the cycle should feel downhill.",
    sources: [PIANO_SOURCES.jazzAdvice251, PIANO_SOURCES.hearAndPlay],
  },

  sk_extension_voicings: {
    why: "Shell + 9/13 voicings give you church-ready color without the mud of full stacked chords.",
    steps: [
      "Build LH shell (3+7) for each chord of I–VI–ii–V.",
      "Add 9th on maj7 and m7; add 13th on dom7.",
      "Play the turnaround twice at 80 BPM.",
    ],
    exercise:
      "Shell + 9/13 on each chord of a I–VI–ii–V turnaround in C.",
    passRule:
      "Two full turnarounds at 80 BPM with 3/7 and extension audible on every chord.",
    tip: "9 on minor, 13 on dominant — swap them and the band will look at you.",
    sources: [PIANO_SOURCES.pianoGroove251, PIANO_SOURCES.levineJazzPiano],
  },

  sk_rootless_ab: {
    why: "Rootless A and B voicings free your LH for walking while keeping guide tones locked for ii–V–I.",
    steps: [
      "Learn Type A and Type B rootless voicings for Cmaj7.",
      "Voice-lead A→B→A through Dm7–G7–Cmaj7.",
      "Repeat in F and Bb without pausing to rebuild shapes.",
    ],
    exercise:
      "A→B→A through ii–V–I in C, F, and Bb.",
    passRule:
      "All three keys: one clean ii–V–I each with correct A/B alternation.",
    tip: "Type A has the 3 on bottom; Type B has the 7 on bottom — say it as you play.",
    sources: [PIANO_SOURCES.pianoGroove251, PIANO_SOURCES.levineJazzPiano],
  },

  sk_ust: {
    why: "Upper-structure triads (e.g. Db over G7) pack altered color into one RH shape the congregation hears as 'modern gospel.'",
    steps: [
      "Play G in LH; stack Db major triad in RH (b5, b7, b9 color).",
      "Resolve to Cmaj7 with smooth voice leading.",
      "Try Eb triad over G7 for Lydian Dominant color; resolve again.",
    ],
    exercise:
      "Db triad over G7 (alt color); resolve to Cmaj7 cleanly.",
    passRule:
      "UST held 2 beats over G7, then resolution to Cmaj7 on beat 1 with no gap.",
    tip: "The triad spells extensions for you — trust the shape over thinking letter-by-letter.",
    sources: [PIANO_SOURCES.levineJazzPiano, PIANO_SOURCES.pianoGroove251],
  },

  sk_drop2: {
    why: "Drop-2 voicings spread maj7 and m7 chords for ballads and big-church pads without doubling the bass.",
    steps: [
      "Take a closed Cmaj7 (C–E–G–B); drop the 2nd voice from the top down an octave.",
      "Build drop-2 m7 on Dm7 the same way.",
      "Voice-lead drop-2 maj7/m7 through a 4-chord hymn cadence.",
    ],
    exercise:
      "Drop-2 maj7/m7 on four chords of a hymn cadence in Ab.",
    passRule:
      "Four-chord cadence with recognizable drop-2 spacing; no note doubled in the same octave.",
    tip: "Drop-2 sits well above a walking bass — keep LH roots separate.",
    sources: [PIANO_SOURCES.levineJazzPiano, PIANO_SOURCES.pianoGroove251],
  },

  sk_walking_bass: {
    why: "Quarter-note walking bass lets you hold a blues or 2-5-1 together when there is no bass player in the room.",
    steps: [
      "Spell F blues changes; play LH quarter notes only on roots for one chorus.",
      "Add approach tones (chromatic or diatonic) into each chord change.",
      "RH comps shell voicings only — no melody.",
    ],
    exercise:
      "Walk a blues in F for one chorus; RH comps shells only.",
    passRule:
      "Full 12-bar chorus: LH quarter notes on every beat, chord change on bar lines.",
    tip: "Walk toward the next root — aim for the target a beat early, land on beat 1.",
    sources: [PIANO_SOURCES.levineJazzPiano, PIANO_SOURCES.jazzAdviceSwing],
  },

  sk_rootless_lh: {
    why: "LH rootless voicings under melody free both hands for standards and hymn reharmonizations in the jazz-gospel set.",
    steps: [
      "Pick a simple standard or hymn melody (8 bars).",
      "LH plays rootless voicings on each change; RH plays melody.",
      "Keep melody on top; LH voicings stay below middle C.",
    ],
    exercise:
      "Play an 8-bar standard or hymn head: LH rootless, RH melody.",
    passRule:
      "8 bars with melody audible throughout; LH never doubles the melody pitch.",
    tip: "If the melody and LH collide, drop an LH note — the singer's line wins.",
    sources: [PIANO_SOURCES.pianoGroove251, PIANO_SOURCES.levineJazzPiano],
  },

  sk_swing_feel: {
    why: "Swing eighths (triplet-based long-short) are the pocket behind jazz comps and walking lines — church jazz sets need this feel.",
    steps: [
      "Listen to a swing recording; tap long-short eighths on your knee.",
      "Comp LH shells in swing eighths at 72 BPM on a ii–V–I loop.",
      "Record yourself; check that beat 2 and 4 stay relaxed, not rushed.",
    ],
    exercise:
      "Comp shells in swing eighths at 72 BPM; record and check pocket.",
    passRule:
      "3 clean 8-bar choruses at 72 BPM with consistent long-short eighth feel.",
    tip: "Swing is triplet-based — if it sounds straight, slow down and exaggerate the long note.",
    tempo: {
      startBpm: 72,
      targetBpm: 90,
      noteValue: "quarter note (♩)",
      howToUse:
        "Set metronome to 72 BPM. Each click = one quarter note. Comp 3 clean 8-bar choruses, then raise by 4 BPM until 90 BPM swing feel holds.",
    },
    sources: [PIANO_SOURCES.jazzAdviceSwing, PIANO_SOURCES.levineJazzPiano],
  },

  sk_six_eight: {
    why: "6/8 compound meter drives slow worship ballads — the dotted-quarter pulse is different from 4/4 and easy to rush.",
    steps: [
      "Count 6/8 as two beats per bar (1–2–3, 4–5–6).",
      "Play a familiar hymn in 6/8 with LH on dotted-quarter pulses.",
      "Lock RH chords to beats 1 and 4 (strong beats in 6/8).",
    ],
    exercise:
      "Hymn in 6/8 with LH pattern locking to dotted-quarter pulse for 16 bars.",
    passRule:
      "16 bars in 6/8 with LH pulse steady; no 4/4 'double-time' feel.",
    tip: "Feel two beats per bar, not six — that keeps ballads from racing.",
    sources: [PIANO_SOURCES.hearAndPlay, PIANO_SOURCES.gospelChopsWarren],
  },

  sk_twelve_eight_shout: {
    why: "12/8 shout choruses combine blues scale fire with compound-meter drive — the energy peak of many gospel sets.",
    steps: [
      "Set 12/8 feel: 4 dotted quarters per bar in a slow shout tempo.",
      "Vamp I7–IV7 LH; RH blues scale fills on beats 2 and 4.",
      "Build intensity across 16 bars without breaking the pulse.",
    ],
    exercise:
      "12/8 shout vamp I7–IV7; fill on beats 2 and 4 for 16 bars.",
    passRule:
      "16 bars with fills landing on beats 2 and 4; no tempo surge into the IV.",
    tip: "Shout is not faster 4/4 — stay in the 12/8 lope.",
    sources: [PIANO_SOURCES.hearAndPlay, PIANO_SOURCES.bluesForm12Bar],
  },

  sk_syncopation: {
    why: "Anticipating chord changes by an eighth (RH ahead of LH) is the gospel hit that makes praise teams lean in.",
    steps: [
      "Play LH on the beat; RH chord anticipates the next change by an eighth.",
      "Practice anticipating the I chord after a V7 — RH lands early, LH on 1.",
      "Loop a 4-bar gospel cadence with one anticipation per bar.",
    ],
    exercise:
      "Anticipate the I chord by an eighth; keep LH on the beat for 8 bars.",
    passRule:
      "8 bars with at least 4 clean anticipations; LH stays on the beat throughout.",
    tip: "Anticipation is a setup — the LH on 1 confirms the change for the room.",
    sources: [PIANO_SOURCES.hearAndPlay, PIANO_SOURCES.jazzAdviceSwing],
  },

  sk_chord_tone_solo: {
    why: "Chord-tone soloing (1–3–5–7) keeps your lines grounded before you add scales and chromaticism.",
    steps: [
      "Spell chord tones for Dm7, G7, Cmaj7.",
      "Solo 8 bars using only chord tones; land on 3 or 7 on each change.",
      "No passing tones yet — if it is not 1, 3, 5, or 7, skip it.",
    ],
    exercise:
      "Solo only chord tones on a slow 2-5-1 in C; land on 3 or 7 at each change.",
    passRule:
      "8-bar solo with chord-tone arrival on every change (Dm7, G7, Cmaj7).",
    tip: "Guide tones (3 and 7) define the chord — aim there first, decorate second.",
    sources: [PIANO_SOURCES.jazzAdvice251, PIANO_SOURCES.levineJazzPiano],
  },

  sk_approach_tones: {
    why: "Approach tones (chromatic or diatonic) into chord tones make scalar lines sound intentional, not random.",
    steps: [
      "Pick a target chord tone (e.g. G7's 3 = B).",
      "Approach from a half-step below (Bb→B) on beat 4 into the change.",
      "Solo 8 bars on ii–V–I using one approach per chord change.",
    ],
    exercise:
      "Approach every target chord tone from a half-step below on a slow 2-5-1.",
    passRule:
      "3 chord changes each with one audible chromatic approach into a chord tone.",
    tip: "Approach from below is the default — master it before above approaches.",
    sources: [PIANO_SOURCES.levineJazzPiano, PIANO_SOURCES.jazzAdvice251],
  },

  sk_blues_improv: {
    why: "Three-chorus blues practice (chord tones → blues scale → mix) builds solo vocabulary you can use in church jams.",
    steps: [
      "Chorus 1: chord tones only on F blues.",
      "Chorus 2: gospel blues scale only.",
      "Chorus 3: mix both; land on chord tones at bar 9 (V) and bar 12 (turnaround).",
    ],
    exercise:
      "Three choruses on F blues: chord tones → blues scale → mix.",
    passRule:
      "3 full choruses without stopping; chorus 3 includes at least 2 chord-tone landings.",
    tip: "Bar 9 is the test — the V chord is where amateur solos fall apart.",
    sources: [PIANO_SOURCES.bluesForm12Bar, PIANO_SOURCES.hearAndPlay],
  },

  sk_mode_solos: {
    why: "Static-mode soloing teaches you to hear Mixolydian vs Dorian color before the harmony starts moving fast.",
    steps: [
      "Vamp I7 for 16 bars; solo Mixolydian only — highlight the b7.",
      "Vamp ii7 for 16 bars; solo Dorian only — highlight the natural 6.",
      "Name the characteristic tone aloud at the start of each section.",
    ],
    exercise:
      "16 bars Mixolydian over I7, then 16 bars Dorian over ii7; contrast color notes.",
    passRule:
      "Both 16-bar sections completed; characteristic tone (b7 or 6) used at least 4 times each.",
    tip: "Same key, different mode — the 6 vs b6 is the whole story.",
    sources: [PIANO_SOURCES.openMusicTheoryModes, PIANO_SOURCES.levineJazzPiano],
  },

  sk_251_soloing: {
    why: "2-5-1 soloing in all keys is the jazz-gospel fluency test — if you can solo the cadence, you can survive most charts.",
    steps: [
      "Pick 3 keys on the circle (e.g. C, F, Bb).",
      "Solo one 8-bar chorus per key over ii–V–I.",
      "Use chord tones + one approach tone per change; metronome on 2 and 4.",
    ],
    exercise:
      "Solo 2-5-1 in 3 keys — one chorus each, metronome on beats 2 and 4.",
    passRule:
      "3 keys × 8 bars each with no pause between keys; chord change heard on every ii, V, and I.",
    tip: "Start with 3 keys, not 12 — clean motion beats sloppy speed through the cycle.",
    sources: [PIANO_SOURCES.jazzAdvice251, PIANO_SOURCES.levineJazzPiano],
  },

  sk_fills_intros: {
    why: "Stock intros and amen endings signal the band and congregation — fills between phrases must be short and purposeful.",
    steps: [
      "Write a 2-bar intro in Ab that lands on I on beat 1.",
      "Write two ending cadences: plagal (IV–I) and turnback (ii–V–I).",
      "Add one 1-bar fill between hymn phrases — no more than 4 notes.",
    ],
    exercise:
      "Write three intro templates and two ending cadences in Ab; play each once.",
    passRule:
      "5 templates played cleanly; each intro lands on I; each ending resolves without extra bars.",
    tip: "The best fill is the one you do not need — when in doubt, leave space.",
    sources: [PIANO_SOURCES.hearAndPlay, PIANO_SOURCES.gospelChopsWarren],
  },

  sk_accompany_singer: {
    why: "Accompanying a singer means dynamics follow breath, not your impulse to fill every rest.",
    steps: [
      "Pick a recorded worship vocal (or sing along yourself).",
      "Comp mid-register chords; drop volume when the vocalist is soft.",
      "Leave at least 2 beats of space before every chorus entrance.",
    ],
    exercise:
      "Play under a recorded vocal; match dynamics and breath points for one verse + chorus.",
    passRule:
      "Verse + chorus with no RH melody competing; at least 2 intentional dynamic swells matching the vocal.",
    tip: "If you cannot hear the singer in your head, you are playing too much.",
    sources: [PIANO_SOURCES.hearAndPlay, PIANO_SOURCES.gospelChopsWarren],
  },

  sk_bass_awareness: {
    why: "When a bass player is present, your LH must stay out of their register — mid/high comping only.",
    steps: [
      "Play a backing track with bass in the mix.",
      "Comp voicings from middle C up — no LH roots below C3.",
      "Lock RH rhythm to the bass player's pulse; do not double the root.",
    ],
    exercise:
      "Comp mid/high only over a backing track with bass for 32 bars.",
    passRule:
      "32 bars with no LH note below C3; pulse locked to the track.",
    tip: "Thin voicings (3+7 or shell) in the middle register leave room for the bass.",
    sources: [PIANO_SOURCES.gospelChopsWarren, PIANO_SOURCES.pianoGroove251],
  },

  sk_transpose_church: {
    why: "Transpose by Nashville numbers, not letter names — the singer says 'up a step' and you move before the count-in.",
    steps: [
      "Take a hymn chart in Ab; write the number line (1–4–1–5–1 etc.).",
      "Transpose up a whole step to Bb using numbers only.",
      "Play verse + chorus in the new key without looking at letter names.",
    ],
    exercise:
      "Take a hymn chart and transpose up a whole step by numbers; play verse + chorus.",
    passRule:
      "Verse + chorus in new key with correct chord functions; no letter-name pauses.",
    tip: "Numbers travel; letters trap — say '4 goes to 4' not 'Db goes to Eb'.",
    sources: [PIANO_SOURCES.hearAndPlay, PIANO_SOURCES.musictheoryNetIntervals],
  },

  sk_lead_sheets: {
    why: "Lead sheet fluency (melody + chord symbols) is how you survive guest charts and jazz-gospel gigs without a full score.",
    steps: [
      "Pick a lead sheet with melody and chord symbols.",
      "Play the head RH; LH shells on each change.",
      "One chorus: melody + shells without stopping for chord lookup.",
    ],
    exercise:
      "Play a lead sheet head with shells; one chorus melody + harmony.",
    passRule:
      "Full head (or 16 bars) with chord change on every symbol; no more than 2 lookup pauses.",
    tip: "Shells first — add extensions only after the form is locked.",
    sources: [PIANO_SOURCES.levineJazzPiano, PIANO_SOURCES.pianoGroove251],
  },

  sk_hymn_reading: {
    why: "Reducing SATB hymn texture to RH chords + LH bass lets you accompany from a hymnal without reading four staves at once.",
    steps: [
      "Open a hymnal SATB setting; identify the bass line and soprano.",
      "Reduce: LH plays bass notes; RH plays S+A+T as chords (drop the doubled soprano if crowded).",
      "Play one verse at half tempo keeping the pulse.",
    ],
    exercise:
      "Reduce SATB to RH chords + LH bass for one hymn verse.",
    passRule:
      "Full verse at half tempo with LH bass and RH harmony; pulse never stops.",
    tip: "You do not need every alto passing tone — keep the harmonic skeleton.",
    sources: [PIANO_SOURCES.rcmSyllabi, PIANO_SOURCES.musictheoryNetIntervals],
  },

  sk_blues_forms: {
    why: "Jazz, gospel, and minor blues forms share the 12-bar skeleton but differ on the IV, turnaround, and ii–V — know which you are in.",
    steps: [
      "Play standard 12-bar jazz blues in F (quick IV in bar 2).",
      "Play gospel blues with IV on bar 5 only.",
      "Play minor blues (i–iv–i–V) in Dm; announce each form before starting.",
    ],
    exercise:
      "Play three blues forms; announce each form name before starting.",
    passRule:
      "All three forms played correctly; form name stated aloud before each.",
    tip: "Gospel blues often stays on I longer — listen for the IV placement.",
    sources: [PIANO_SOURCES.bluesForm12Bar, PIANO_SOURCES.hearAndPlay],
  },

  sk_standards: {
    why: "Jazz standards (AABA, ABAC) connect your gospel-jazz vocabulary to real repertoire the band already knows.",
    steps: [
      "Pick one standard (e.g. Autumn Leaves or similar AABA form).",
      "Learn the head melody + chord changes.",
      "Play head + LH shells + one improvised chorus on chord tones.",
    ],
    exercise:
      "Learn one standard: head, shells, one improvised chorus.",
    passRule:
      "Head + one chorus improvised with chord change heard on every section boundary.",
    tip: "Map the form (AABA) on paper before you solo — getting lost is a form problem.",
    sources: [PIANO_SOURCES.levineJazzPiano, PIANO_SOURCES.jazzAdvice251],
  },
};

export const LESSON_SOURCE_PATCHES: Partial<
  Record<string, NonNullable<PianoSkillLesson["sources"]>>
> = {
  sk_number_system: [PIANO_SOURCES.hearAndPlay, PIANO_SOURCES.musictheoryNetIntervals],
  sk_intervals_ear: [PIANO_SOURCES.musictheoryNetIntervals, PIANO_SOURCES.hearAndPlay],
  sk_key_geography: [PIANO_SOURCES.musictheoryNetIntervals, PIANO_SOURCES.hearAndPlay],
  sk_rcm_scales: [PIANO_SOURCES.rcmSyllabi, PIANO_SOURCES.pianoscalesMajor],
  sk_arpeggios: [PIANO_SOURCES.rcmSyllabi, PIANO_SOURCES.pianoscalesMajor],
  sk_sight_reading: [PIANO_SOURCES.rcmSyllabi, PIANO_SOURCES.pianoscalesMajor],
  sk_major_scale_lab: [PIANO_SOURCES.pianoscalesMajor, PIANO_SOURCES.levineJazzPiano],
  sk_seven_modes: [PIANO_SOURCES.openMusicTheoryModes, PIANO_SOURCES.levineJazzPiano],
  sk_natural_harmonic_minor: [PIANO_SOURCES.openMusicTheoryModes, PIANO_SOURCES.levineJazzPiano],
  sk_triads_inversions: [PIANO_SOURCES.jazzAdvice251, PIANO_SOURCES.levineJazzPiano],
  sk_seventh_chords: [PIANO_SOURCES.jazzAdvice251, PIANO_SOURCES.levineJazzPiano],
  sk_251_basic: [PIANO_SOURCES.jazzAdvice251, PIANO_SOURCES.levineJazzPiano],
  sk_gospel_736: [PIANO_SOURCES.hearAndPlay, PIANO_SOURCES.jazzAdvice251],
  sk_gospel_514: [PIANO_SOURCES.hearAndPlay, PIANO_SOURCES.jazzAdvice251],
  sk_gospel_362: [PIANO_SOURCES.hearAndPlay, PIANO_SOURCES.jazzAdvice251],
  sk_shell_voicings: [PIANO_SOURCES.pianoGroove251, PIANO_SOURCES.levineJazzPiano],
  sk_warren_lh: [PIANO_SOURCES.gospelChopsWarren, PIANO_SOURCES.hearAndPlay],
  sk_hymn_accomp: [PIANO_SOURCES.hearAndPlay, PIANO_SOURCES.gospelChopsWarren],
  sk_practice_logging: [PIANO_SOURCES.metronomePractice],
  sk_metronome_protocol: [PIANO_SOURCES.metronomePractice],
};
