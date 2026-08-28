import { groundedAskRequestSchema } from "@/features/learning/schemas/grounded-ask";
import { askGroundedAi } from "@/features/learning/services/grounded-ask-ai";
import { buildPianoLessonAskContext } from "@/features/piano/services/lesson-ask-context";
import { getOrCreatePianoProfile } from "@/features/piano/services/profile-service";
import { localDayKey } from "@/features/notifications/services/digest-builder";
import { jsonError, jsonOk } from "@/lib/api";

type Params = { params: Promise<{ skillId: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { skillId } = await params;
    const body = groundedAskRequestSchema.parse(await request.json());

    let localDay = body.localDay;
    if (!localDay) {
      const profile = await getOrCreatePianoProfile();
      localDay = localDayKey(new Date(), profile.timezone || "UTC");
    }

    const ctx = await buildPianoLessonAskContext(skillId, localDay);
    const result = await askGroundedAi(ctx, body.question);
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
