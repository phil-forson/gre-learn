import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api";
import { ensureAudioLesson } from "@/features/audio/services/audio-service";

const schema = z.object({
  vocabularyId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const result = await ensureAudioLesson(body.vocabularyId);
    return jsonOk({
      lesson: result.lesson,
      script: result.script,
      entry: result.entry,
      useBrowserFallback: result.useBrowserFallback,
    });
  } catch (error) {
    return jsonError(error);
  }
}
