import { jsonError, jsonOk } from "@/lib/api";
import { getUnitWithProgress } from "@/features/grammar/services/grammar-service";

type Params = { params: Promise<{ unitId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { unitId } = await params;
    const data = await getUnitWithProgress(unitId);
    return jsonOk(data);
  } catch (error) {
    return jsonError(error);
  }
}
