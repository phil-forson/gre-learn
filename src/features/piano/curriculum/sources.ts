import type { LearningSource } from "@/lib/learning-source";

/** Verified online sources for piano curriculum claims. */
export const PIANO_SOURCES = {
  pianoscalesMajor: {
    title: "pianoscales.org — Piano Major Scales",
    url: "https://pianoscales.org/major.html",
    note: "Major scale fingerings (one octave RH/LH)",
  },
  rcmSyllabi: {
    title: "Royal Conservatory — About the Syllabi",
    url: "https://www.rcmusic.com/learning/about-the-syllabi",
    note: "RCM graded scale/arpeggio requirements and tempo expectations",
  },
  levineJazzPiano: {
    title: "Sher Music — The Jazz Piano Book (Mark Levine)",
    url: "https://www.shermusic.com/product/the-jazz-piano-book/",
    note: "Scale/mode order, chord-scale relationships, melodic minor modes",
  },
  hearAndPlay: {
    title: "Hear And Play Music",
    url: "https://www.hearandplay.com/",
    note: "Gospel number system, 7-3-6, church progression language",
  },
  jazzAdvice251: {
    title: "Jazz Advice — The ii-V-I Progression",
    url: "https://www.jazzadvice.com/lessons/the-ii-v-i-progression/",
    note: "ii–V–I spelling, voice leading, practice approach",
  },
  pianoGroove251: {
    title: "PianoGroove — 2-5-1 Progressions",
    url: "https://www.pianogroove.com/jazz-piano-lessons/251-progressions/",
    note: "Jazz 2-5-1 voicings and rootless forms",
  },
  imslpHanon: {
    title: "IMSLP — Hanon The Virtuoso Pianist",
    url: "https://imslp.org/wiki/The_Virtuoso_Pianist_(Hanon%2C_Charles-Louis)",
    note: "Finger-independence etude repertoire (public domain)",
  },
  openMusicTheoryModes: {
    title: "Open Music Theory — Modes",
    url: "https://viva.pressbooks.pub/openmusictheory/chapter/modes/",
    note: "Mode names, characteristic tones, parent-scale construction",
  },
  musictheoryNetIntervals: {
    title: "musictheory.net — Lessons",
    url: "https://www.musictheory.net/lessons",
    note: "Interval recognition and keyboard spelling",
  },
  gospelChopsWarren: {
    title: "Gospel Chops — Left-Hand Patterns",
    url: "https://gospelchops.com/blogs/news",
    note: "Contemporary gospel left-hand accompaniment concepts",
  },
  jazzAdviceSwing: {
    title: "Learn Jazz Standards — Swing Feel",
    url: "https://www.learnjazzstandards.com/blog/learning-jazz/jazz-advice/swing-feel/",
    note: "Swing eighth feel at moderate tempos",
  },
  bluesForm12Bar: {
    title: "Open Music Theory — Blues",
    url: "https://viva.pressbooks.pub/openmusictheory/chapter/blues/",
    note: "12-bar blues form and basic harmonic structure",
  },
  metronomePractice: {
    title: "Bulletproof Musician — Effective Metronome Use",
    url: "https://bulletproofmusician.com/how-to-use-a-metronome/",
    note: "Slow practice, incremental tempo increases (+3–5 BPM)",
  },
} as const satisfies Record<string, LearningSource>;

export const DOMAIN_DEFAULT_SOURCES: Record<string, LearningSource[]> = {
  d0: [PIANO_SOURCES.musictheoryNetIntervals, PIANO_SOURCES.hearAndPlay],
  d1: [PIANO_SOURCES.rcmSyllabi, PIANO_SOURCES.pianoscalesMajor],
  d2: [PIANO_SOURCES.levineJazzPiano, PIANO_SOURCES.openMusicTheoryModes],
  d3: [PIANO_SOURCES.levineJazzPiano, PIANO_SOURCES.jazzAdvice251],
  d4: [PIANO_SOURCES.hearAndPlay, PIANO_SOURCES.jazzAdvice251],
  d5: [PIANO_SOURCES.pianoGroove251, PIANO_SOURCES.levineJazzPiano],
  d6: [PIANO_SOURCES.gospelChopsWarren, PIANO_SOURCES.hearAndPlay],
  d7: [PIANO_SOURCES.jazzAdviceSwing, PIANO_SOURCES.hearAndPlay],
  d8: [PIANO_SOURCES.levineJazzPiano, PIANO_SOURCES.jazzAdvice251],
  d9: [PIANO_SOURCES.hearAndPlay, PIANO_SOURCES.gospelChopsWarren],
  d10: [PIANO_SOURCES.rcmSyllabi, PIANO_SOURCES.levineJazzPiano],
  d11: [PIANO_SOURCES.metronomePractice],
};
