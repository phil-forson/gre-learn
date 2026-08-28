import { jsonError, jsonOk } from "@/lib/api";
import { listUnitsWithProgress } from "@/features/grammar/services/grammar-service";

export async function GET() {
  try {
    const data = await listUnitsWithProgress();
    return jsonOk(data);
  } catch (error) {
    return jsonError(error);
  }
}
