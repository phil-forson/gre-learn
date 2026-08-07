import { getEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";
import type { TextToSpeechProvider } from "./types";
import { MockTextToSpeechProvider } from "./mock-tts";
import { OpenAITextToSpeechProvider } from "./openai-tts";

export function getTextToSpeechProvider(): TextToSpeechProvider {
  const env = getEnv();
  if (env.TTS_PROVIDER === "openai") {
    if (!env.TTS_API_KEY && !env.AI_API_KEY) {
      throw new AppError(
        "TTS_PROVIDER=openai requires TTS_API_KEY (or AI_API_KEY). Or use TTS_PROVIDER=mock.",
        "TTS_NOT_CONFIGURED",
        500,
      );
    }
    return new OpenAITextToSpeechProvider();
  }
  return new MockTextToSpeechProvider();
}
