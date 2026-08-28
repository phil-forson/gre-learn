import { groundedAskRequestSchema } from "@/features/learning/schemas/grounded-ask";
import { askGroundedAi } from "@/features/learning/services/grounded-ask-ai";
import { buildPathUnitAskContext } from "@/features/learning/services/path-ask-context";
import { requireSentenceUnit } from "@/features/sentence/catalog";
import { SENTENCE_CURRICULUM } from "@/features/path/curriculum/sentence";
import { jsonError, jsonOk } from "@/lib/api";

type Params = { params: Promise<{ unitId: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { unitId } = await params;
    const body = groundedAskRequestSchema.parse(await request.json());
    const unit = await requireSentenceUnit(unitId);
    const mapEntry = SENTENCE_CURRICULUM.find((u) => u.id === unit.id);

    const ctx = buildPathUnitAskContext({
      title: unit.title,
      form: unit.form,
      microTask: unit.microTask,
      sources: mapEntry?.sources ?? [],
      cefrBand: unit.cefrBand,
      cefrRange: mapEntry?.cefrRange,
    });

    const result = await askGroundedAi(ctx, body.question);
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
