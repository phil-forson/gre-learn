import { jsonError, jsonOk } from "@/lib/api";
import { listTracksWithProfile } from "@/features/path/services/placement-service";

export async function GET() {
  try {
    const data = await listTracksWithProfile();
    return jsonOk(data);
  } catch (error) {
    return jsonError(error);
  }
}
