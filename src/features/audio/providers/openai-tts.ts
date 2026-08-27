import { getEnv, requireTtsKey } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { LEARNING_LOCALE } from "@/features/learning/types";
import type { GeneratedSpeech, TextToSpeechProvider } from "./types";

/**
 * OpenAI TTS. Voices are American English; LEARNING_LOCALE (en-US) is the
 * product variety for Phases 0–5 — no BrE voice/toggle.
 */
export class OpenAITextToSpeechProvider implements TextToSpeechProvider {
  readonly name = "openai";
  /** Documented product locale; OpenAI speech API has no separate lang field. */
  readonly locale = LEARNING_LOCALE;

  async generateSpeech(input: {
    text: string;
    voice?: string;
    segmentKey: string;
  }): Promise<GeneratedSpeech> {
    const apiKey = requireTtsKey();
    const voice = input.voice || getEnv().TTS_VOICE;

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice,
        input: input.text,
        format: "mp3",
      }),
    });

    if (!response.ok) {
      throw new AppError(
        "The text-to-speech provider is unavailable.",
        "TTS_PROVIDER_UNAVAILABLE",
        502,
      );
    }

    const buffer = new Uint8Array(await response.arrayBuffer());
    return {
      audioBytes: buffer,
      contentType: "audio/mpeg",
      durationMs: null,
      useBrowserFallback: false,
    };
  }
}
