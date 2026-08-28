import { jsonError, jsonOk } from "@/lib/api";
import { recordGrammarLessonPlay } from "@/features/grammar/services/grammar-service";

type Params = { params: Promise<{ unitId: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    const { unitId } = await params;
    const data = await recordGrammarLessonPlay(unitId);
    return jsonOk(data);
  } catch (error) {
    return jsonError(error);
  }
}
