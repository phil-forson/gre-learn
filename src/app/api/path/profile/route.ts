import { jsonError, jsonOk } from "@/lib/api";
import {
  getOrCreateLearningProfile,
  patchLearningProfile,
} from "@/features/path/services/profile-service";

export async function GET() {
  try {
    const profile = await getOrCreateLearningProfile();
    return jsonOk({ profile });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const profile = await patchLearningProfile(body);
    return jsonOk({ profile });
  } catch (error) {
    return jsonError(error);
  }
}
