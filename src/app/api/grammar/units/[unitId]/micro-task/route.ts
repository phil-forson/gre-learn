import { jsonError, jsonOk } from "@/lib/api";
import { submitUnitMicroTask } from "@/features/grammar/services/grammar-service";

type Params = { params: Promise<{ unitId: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { unitId } = await params;
    const body = await request.json();
    const data = await submitUnitMicroTask(unitId, body);
    return jsonOk(data);
  } catch (error) {
    return jsonError(error);
  }
}
