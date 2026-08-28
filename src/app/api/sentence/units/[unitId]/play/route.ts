import { jsonError, jsonOk } from "@/lib/api";
import { recordSentenceLessonPlay } from "@/features/sentence/services/sentence-service";

type Params = { params: Promise<{ unitId: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    const { unitId } = await params;
    const data = await recordSentenceLessonPlay(unitId);
    return jsonOk(data);
  } catch (error) {
    return jsonError(error);
  }
}
