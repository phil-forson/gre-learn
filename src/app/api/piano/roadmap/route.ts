import { jsonError, jsonOk } from "@/lib/api";
import { getRoadmap } from "@/features/piano/services/skill-service";

export async function GET() {
  try {
    const roadmap = await getRoadmap();
    return jsonOk(roadmap);
  } catch (error) {
    return jsonError(error);
  }
}
