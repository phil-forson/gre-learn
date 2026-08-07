import { getEnv, requireTtsKey } from "@/lib/env";
import { AppError } from "@/lib/errors";
import type { GeneratedSpeech, TextToSpeechProvider } from "./types";

export class OpenAITextToSpeechProvider implements TextToSpeechProvider {
  readonly name = "openai";

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
