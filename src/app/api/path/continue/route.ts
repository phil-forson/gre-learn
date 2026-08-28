import { jsonError, jsonOk } from "@/lib/api";
import { resolveContinueTarget } from "@/features/path/services/continue-service";

export async function GET() {
  try {
    const continueTarget = await resolveContinueTarget();
    return jsonOk({ continue: continueTarget });
  } catch (error) {
    return jsonError(error);
  }
}
