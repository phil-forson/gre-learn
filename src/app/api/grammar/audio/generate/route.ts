import { generateGrammarAudioSchema } from "@/features/grammar/schemas/unit";
import { ensureGrammarAudioLesson } from "@/features/grammar/services/grammar-service";
import { jsonError, jsonOk } from "@/lib/api";
import { AppError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const parsed = generateGrammarAudioSchema.safeParse(await request.json());
    if (!parsed.success) {
      throw new AppError(
        "Invalid audio generate request",
        "VALIDATION_ERROR",
        400,
        parsed.error.flatten(),
      );
    }
    const result = await ensureGrammarAudioLesson(parsed.data.unitId);
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
