import { LEARNING_LOCALE } from "@/features/learning/types";

/** Prefer these en-US female system voices when using browser speech fallback. */
const PREFERRED_FEMALE_US_VOICES = [
  /^microsoft (aria|jenny|zira)/i,
  /^google us english$/i,
  /samantha/i,
  /zoe/i,
  /karen/i, // often en-AU — only use if en-US
  /female/i,
];

let cachedVoice: SpeechSynthesisVoice | null | undefined;

function scoreVoice(voice: SpeechSynthesisVoice): number {
  const lang = voice.lang.replace("_", "-");
  if (lang !== "en-US" && !lang.startsWith("en-US")) {
    if (lang.startsWith("en")) return 1;
    return 0;
  }
  for (let i = 0; i < PREFERRED_FEMALE_US_VOICES.length; i += 1) {
    const pattern = PREFERRED_FEMALE_US_VOICES[i]!;
    if (pattern.test(voice.name)) {
      // Karen is often Australian — skip unless explicitly en-US (already filtered)
      if (/karen/i.test(voice.name) && lang !== "en-US") continue;
      return 100 - i;
    }
  }
  return 10; // any en-US
}

export function pickFemaleAmericanVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  let best: SpeechSynthesisVoice | null = null;
  let bestScore = -1;
  for (const voice of voices) {
    const score = scoreVoice(voice);
    if (score > bestScore) {
      best = voice;
      bestScore = score;
    }
  }
  return bestScore > 0 ? best : null;
}

export async function loadBrowserVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  const existing = window.speechSynthesis.getVoices();
  if (existing.length) return existing;
  await new Promise<void>((resolve) => {
    const done = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", done);
      resolve();
    };
    window.speechSynthesis.addEventListener("voiceschanged", done);
    window.setTimeout(done, 700);
  });
  return window.speechSynthesis.getVoices();
}

export async function warmBrowserVoice(): Promise<SpeechSynthesisVoice | null> {
  const voices = await loadBrowserVoices();
  cachedVoice = pickFemaleAmericanVoice(voices);
  return cachedVoice ?? null;
}

/**
 * Speak with a preferred female American voice when available.
 * Ignores cancel/interrupt errors from cleanup between segments.
 */
export function speakBrowser(
  text: string,
  rate: number,
  onEnd: () => void,
  onError: (message: string) => void,
  preferredVoice?: SpeechSynthesisVoice | null,
): () => void {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onError("Speech synthesis is not available in this browser.");
    return () => {};
  }

  let cancelled = false;
  const synth = window.speechSynthesis;
  synth.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = LEARNING_LOCALE;
  utter.rate = rate;
  const voice = preferredVoice ?? cachedVoice ?? null;
  if (voice) {
    utter.voice = voice;
    utter.lang = voice.lang || LEARNING_LOCALE;
  }

  utter.onend = () => {
    if (!cancelled) onEnd();
  };
  utter.onerror = (event) => {
    // Advancing/pausing cancels the current utterance — not a real failure.
    if (
      cancelled ||
      event.error === "interrupted" ||
      event.error === "canceled" ||
      event.error === "cancelled"
    ) {
      return;
    }
    onError("Could not speak this segment.");
  };

  // Chrome sometimes drops speak() if called immediately after cancel().
  const timer = window.setTimeout(() => {
    if (cancelled) return;
    synth.speak(utter);
  }, 40);

  return () => {
    cancelled = true;
    window.clearTimeout(timer);
    synth.cancel();
  };
}
