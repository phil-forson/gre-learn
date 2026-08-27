import { describe, expect, it } from "vitest";
import { pickFemaleAmericanVoice } from "@/features/audio/player/browser-tts";

function voice(name: string, lang: string): SpeechSynthesisVoice {
  return { name, lang } as SpeechSynthesisVoice;
}

describe("pickFemaleAmericanVoice", () => {
  it("prefers a known female en-US voice", () => {
    const picked = pickFemaleAmericanVoice([
      voice("Google UK English Male", "en-GB"),
      voice("Alex", "en-US"),
      voice("Samantha", "en-US"),
      voice("Daniel", "en-GB"),
    ]);
    expect(picked?.name).toBe("Samantha");
  });

  it("falls back to any en-US voice", () => {
    const picked = pickFemaleAmericanVoice([
      voice("Alex", "en-US"),
      voice("Daniel", "en-GB"),
    ]);
    expect(picked?.name).toBe("Alex");
  });
});
