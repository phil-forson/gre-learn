import type { GeneratedSpeech, TextToSpeechProvider } from "./types";

/**
 * Mock TTS — no paid API. Signals browser synthesis for playback (en-US via
 * LEARNING_LOCALE in the player), while still creating cache records with text
 * hashes for invalidation tests.
 */
export class MockTextToSpeechProvider implements TextToSpeechProvider {
  readonly name = "mock";

  async generateSpeech(): Promise<GeneratedSpeech> {
    return {
      audioBytes: null,
      contentType: "audio/mock",
      durationMs: null,
      useBrowserFallback: true,
    };
  }
}
