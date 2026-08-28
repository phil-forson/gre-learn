import { jsonError, jsonOk } from "@/lib/api";
import { markSkillPracticed } from "@/features/piano/services/skill-service";

type Params = { params: Promise<{ skillId: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { skillId } = await params;
    let body: unknown = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const progress = await markSkillPracticed(skillId, body);
    return jsonOk({ progress });
  } catch (error) {
    return jsonError(error);
  }
}
