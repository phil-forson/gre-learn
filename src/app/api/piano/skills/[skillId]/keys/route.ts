import { jsonError, jsonOk } from "@/lib/api";
import { markKeyComplete } from "@/features/piano/services/skill-service";

export async function POST(
  request: Request,
  context: { params: Promise<{ skillId: string }> },
) {
  try {
    const { skillId } = await context.params;
    const body = await request.json();
    const progress = await markKeyComplete(skillId, body);
    return jsonOk({ progress });
  } catch (error) {
    return jsonError(error);
  }
}
