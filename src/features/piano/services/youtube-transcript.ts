import {
  YoutubeTranscript,
  YoutubeTranscriptDisabledError,
  YoutubeTranscriptError,
  YoutubeTranscriptNotAvailableError,
  YoutubeTranscriptTooManyRequestError,
  YoutubeTranscriptVideoUnavailableError,
} from "youtube-transcript";
import { AppError } from "@/lib/errors";

const YOUTUBE_URL_RE =
  /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;

export type TranscriptSegment = {
  text: string;
  offsetMs: number;
  durationMs: number;
};

export function isYoutubeUrl(url: string): boolean {
  return YOUTUBE_URL_RE.test(url.trim());
}

export function parseYoutubeVideoId(urlOrId: string): string {
  const input = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
  const match = input.match(YOUTUBE_URL_RE);
  if (match?.[1]) return match[1];
  throw new AppError(
    "That does not look like a YouTube link. Paste a watch or youtu.be URL.",
    "INVALID_YOUTUBE_URL",
    400,
  );
}

function segmentOffsetMs(offset: number, duration: number): number {
  // youtube-transcript returns ms for srv3 captions and seconds for classic XML.
  if (offset > 500 || duration > 120) return Math.round(offset);
  return Math.round(offset * 1000);
}

function segmentDurationMs(duration: number, offsetMs: number): number {
  if (duration > 120) return Math.round(duration);
  return Math.round(duration * 1000);
}

export function formatTimestamp(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Collapse caption chunks into readable timestamped lines for review + summarization. */
export function formatTranscriptForReview(segments: TranscriptSegment[]): string {
  if (segments.length === 0) {
    throw new AppError(
      "This video has no caption text to import.",
      "TRANSCRIPT_EMPTY",
      400,
    );
  }

  const lines: string[] = [];
  let bucketStart = segments[0]!.offsetMs;
  let bucketText = "";

  const flush = () => {
    const text = bucketText.trim();
    if (text) lines.push(`[${formatTimestamp(bucketStart)}] ${text}`);
    bucketText = "";
  };

  for (const seg of segments) {
    if (
      bucketText &&
      seg.offsetMs - bucketStart > 45_000 &&
      bucketText.length > 120
    ) {
      flush();
      bucketStart = seg.offsetMs;
    }
    bucketText += `${seg.text.trim()} `;
  }
  flush();

  const body = lines.join("\n").trim();
  if (!body) {
    throw new AppError(
      "This video has no caption text to import.",
      "TRANSCRIPT_EMPTY",
      400,
    );
  }
  return body.slice(0, 20_000);
}

export async function fetchYoutubeTranscript(
  urlOrId: string,
): Promise<{ videoId: string; text: string; segmentCount: number }> {
  const videoId = parseYoutubeVideoId(urlOrId);

  try {
    const raw = await YoutubeTranscript.fetchTranscript(videoId, { lang: "en" });
    const segments: TranscriptSegment[] = raw.map((row) => {
      const offsetMs = segmentOffsetMs(row.offset, row.duration);
      const durationMs = segmentDurationMs(row.duration, offsetMs);
      return {
        text: row.text,
        offsetMs,
        durationMs,
      };
    });
    const text = formatTranscriptForReview(segments);
    return { videoId, text, segmentCount: segments.length };
  } catch (error) {
    if (error instanceof AppError) throw error;

    if (error instanceof YoutubeTranscriptTooManyRequestError) {
      throw new AppError(
        "YouTube is rate-limiting transcript requests. Try again in a few minutes or paste notes manually.",
        "TRANSCRIPT_RATE_LIMIT",
        429,
      );
    }
    if (
      error instanceof YoutubeTranscriptDisabledError ||
      error instanceof YoutubeTranscriptNotAvailableError
    ) {
      throw new AppError(
        "This video has no captions available. Paste the lesson notes manually instead.",
        "TRANSCRIPT_UNAVAILABLE",
        400,
      );
    }
    if (error instanceof YoutubeTranscriptVideoUnavailableError) {
      throw new AppError(
        "That video is unavailable or private.",
        "TRANSCRIPT_VIDEO_UNAVAILABLE",
        400,
      );
    }
    if (error instanceof YoutubeTranscriptError) {
      throw new AppError(
        error.message.replace(/^\[YoutubeTranscript\] 🚨\s*/, ""),
        "TRANSCRIPT_FETCH_FAILED",
        400,
      );
    }

    throw new AppError(
      "Could not fetch captions for that video. Paste notes manually or try another link.",
      "TRANSCRIPT_FETCH_FAILED",
      502,
    );
  }
}

export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
