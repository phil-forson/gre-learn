import { generateSpeakingAudioSchema } from "@/features/speaking/schemas/unit";
import { ensureSpeakingAudioLesson } from "@/features/speaking/services/speaking-service";
import { jsonError, jsonOk } from "@/lib/api";
import { AppError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const parsed = generateSpeakingAudioSchema.safeParse(await request.json());
    if (!parsed.success) {
      throw new AppError(
        "Invalid audio generate request",
        "VALIDATION_ERROR",
        400,
        parsed.error.flatten(),
      );
    }
    const result = await ensureSpeakingAudioLesson(parsed.data.unitId);
    return jsonOk({
      lesson: result.lesson,
      script: result.script,
      unit: result.unit,
      useBrowserFallback: result.useBrowserFallback,
    });
  } catch (error) {
    return jsonError(error);
  }
}
