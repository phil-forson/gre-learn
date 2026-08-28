import { jsonError, jsonOk } from "@/lib/api";
import { getTodayPlan } from "@/features/piano/services/today-service";

export async function GET() {
  try {
    const plan = await getTodayPlan();
    return jsonOk({ plan });
  } catch (error) {
    return jsonError(error);
  }
}
