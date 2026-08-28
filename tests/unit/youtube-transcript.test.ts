import { describe, expect, it } from "vitest";
import {
  formatTimestamp,
  formatTranscriptForReview,
  isYoutubeUrl,
  parseYoutubeVideoId,
  type TranscriptSegment,
} from "@/features/piano/services/youtube-transcript";

describe("youtube-transcript helpers", () => {
  it("detects YouTube URLs", () => {
    expect(isYoutubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      true,
    );
    expect(isYoutubeUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(true);
    expect(isYoutubeUrl("https://example.com/video")).toBe(false);
  });

  it("parses video ids from common URL shapes", () => {
    expect(parseYoutubeVideoId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(
      parseYoutubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    ).toBe("dQw4w9WgXcQ");
    expect(parseYoutubeVideoId("https://youtu.be/dQw4w9WgXcQ?t=42")).toBe(
      "dQw4w9WgXcQ",
    );
  });

  it("formats timestamps and grouped transcript lines", () => {
    expect(formatTimestamp(65_000)).toBe("1:05");
    const segments: TranscriptSegment[] = [
      { text: "Welcome", offsetMs: 0, durationMs: 1200 },
      { text: "to the lesson", offsetMs: 1200, durationMs: 1800 },
      { text: "on gospel voicings", offsetMs: 3000, durationMs: 2000 },
    ];
    const text = formatTranscriptForReview(segments);
    expect(text).toContain("[0:00]");
    expect(text).toContain("Welcome");
    expect(text).toContain("gospel voicings");
  });
});
