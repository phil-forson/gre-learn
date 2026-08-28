import { jsonError, jsonOk } from "@/lib/api";
import { getOrCreatePianoProfile } from "@/features/piano/services/profile-service";

export async function GET() {
  try {
    const profile = await getOrCreatePianoProfile();
    return jsonOk({ profile });
  } catch (error) {
    return jsonError(error);
  }
}
