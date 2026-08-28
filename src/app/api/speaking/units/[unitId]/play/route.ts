import { jsonError, jsonOk } from "@/lib/api";
import { recordSpeakingLessonPlay } from "@/features/speaking/services/speaking-service";

type Params = { params: Promise<{ unitId: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    const { unitId } = await params;
    const data = await recordSpeakingLessonPlay(unitId);
    return jsonOk(data);
  } catch (error) {
    return jsonError(error);
  }
}
