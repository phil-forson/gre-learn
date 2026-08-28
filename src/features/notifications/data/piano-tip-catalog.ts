import type { LearningSource } from "@/lib/learning-source";
import { PIANO_SOURCES } from "@/features/piano/curriculum/sources";

export type PianoTipEntry = {
  id: string;
  body: string;
  href: string;
  source: LearningSource;
};

/** Curated micro-lessons — each fact matches a cited source in curriculum. */
export const PIANO_TIP_CATALOG: readonly PianoTipEntry[] = [
  {
    id: "c-major-fingering",
    body: "C major RH ascending: 1-2-3, thumb under, 1-2-3-4-5. Same CAGED pattern for G, D, A, E, and B.",
    href: "/piano/today",
    source: PIANO_SOURCES.pianoscalesMajor,
  },
  {
    id: "b-major-lh",
    body: "B major LH starts on finger 4 (not 5) so the thumb stays on white keys: 4-3-2-1, then 4-3-2-1.",
    href: "/piano/today",
    source: PIANO_SOURCES.pianoscalesMajor,
  },
  {
    id: "251-c",
    body: "2-5-1 in C: Dm7 → G7 → Cmaj7. Spell the ii–V–I quality before you add fancy extensions.",
    href: "/piano/today",
    source: PIANO_SOURCES.jazzAdvice251,
  },
  {
    id: "mixolydian-hint",
    body: "Mixolydian = major scale with a lowered 7th. Hears like gospel dominant / I7 color before the cadence.",
    href: "/piano/today",
    source: PIANO_SOURCES.openMusicTheoryModes,
  },
  {
    id: "dorian-hint",
    body: "Dorian = natural minor with a raised 6th. On a ii vamp it feels brighter than plain Aeolian.",
    href: "/piano/today",
    source: PIANO_SOURCES.openMusicTheoryModes,
  },
  {
    id: "nashville-numbers",
    body: "In any key, I–IV–V–I as numbers survives transposition — say numbers aloud when the worship leader calls a new key.",
    href: "/piano/today",
    source: PIANO_SOURCES.hearAndPlay,
  },
  {
    id: "gospel-736",
    body: "7–3–6 motion: from the I chord, walk 7 → 3 → 6 (into the relative minor). Classic church turnaround language.",
    href: "/piano/today",
    source: PIANO_SOURCES.hearAndPlay,
  },
  {
    id: "metronome-rule",
    body: "Slow → clean → +4 BPM. If tone or pulse muddies, drop back — speed only after 3–4 clean reps.",
    href: "/piano/today",
    source: PIANO_SOURCES.metronomePractice,
  },
  {
    id: "hands-together",
    body: "Hands together (HT) = both hands play at once. Learn hands separate (HS) first when a passage collapses.",
    href: "/piano/today",
    source: PIANO_SOURCES.rcmSyllabi,
  },
  {
    id: "f-major-rh",
    body: "F major RH uses 1-2-3-4 on the way up (finger 4 on Bb) — not the plain 1-2-3 thumb-under on Bb.",
    href: "/piano/today",
    source: PIANO_SOURCES.pianoscalesMajor,
  },
  {
    id: "shell-voicings",
    body: "Shell voicing = root + 3rd + 7th (LH or RH). Add 9ths and 13ths only after the skeleton is steady.",
    href: "/piano/today",
    source: PIANO_SOURCES.pianoGroove251,
  },
  {
    id: "guide-tones",
    body: "On dom7 chords, guide tones are the 3rd and 7th — they tell the ear where the harmony resolves.",
    href: "/piano/today",
    source: PIANO_SOURCES.levineJazzPiano,
  },
  {
    id: "interval-m2",
    body: "A minor 2nd is one semitone (e.g. C→Db). Ear-train m2–P8 from a fixed tonic before grabbing chord tones.",
    href: "/piano/today",
    source: PIANO_SOURCES.musictheoryNetIntervals,
  },
  {
    id: "swing-feel",
    body: "Swing eighths: long-short pulse, not even 8ths. Comp shells at ~72–90 BPM before speeding up.",
    href: "/piano/today",
    source: PIANO_SOURCES.jazzAdviceSwing,
  },
  {
    id: "blues-12bar",
    body: "12-bar blues: four bars of I, two of IV, two of I, V–IV–I–V (or variations). Announce the form before you solo.",
    href: "/piano/today",
    source: PIANO_SOURCES.bluesForm12Bar,
  },
  {
    id: "tritone-sub",
    body: "Tritone sub: replace V7 with bII7 (same guide tones, different bass). Common gospel/jazz turnaround color.",
    href: "/piano/today",
    source: PIANO_SOURCES.levineJazzPiano,
  },
  {
    id: "harmonic-minor",
    body: "Harmonic minor raises the 7th ascending and descending — the augmented 2nd between 6 and 7 is correct, not a mistake.",
    href: "/piano/today",
    source: PIANO_SOURCES.rcmSyllabi,
  },
  {
    id: "warren-lh",
    body: "Gospel LH: keep a steady pattern under one RH chord — switch chords every 2 bars before adding fills.",
    href: "/piano/today",
    source: PIANO_SOURCES.gospelChopsWarren,
  },
  {
    id: "hanon-short",
    body: "Etude rule: one Hanon phrase, HS then HT, 4 clean reps — stop on time instead of noodling past the block.",
    href: "/piano/today",
    source: PIANO_SOURCES.imslpHanon,
  },
  {
    id: "circle-fifths",
    body: "Circle of fifths: each step adds a sharp (or removes a flat). Clock I–IV–V–I in the next key to build fluency.",
    href: "/piano/today",
    source: PIANO_SOURCES.musictheoryNetIntervals,
  },
] as const;

export function formatPianoTipBody(entry: PianoTipEntry, max = 155): string {
  const text = entry.body.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}
