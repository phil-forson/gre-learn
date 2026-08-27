import { jsonError, jsonOk } from "@/lib/api";
import { reorderWordGroups } from "@/features/vocabulary/services/word-group-service";
import { reorderWordGroupsSchema } from "@/features/vocabulary/schemas/word-group";

export async function POST(request: Request) {
  try {
    const body = reorderWordGroupsSchema.parse(await request.json());
    const groups = await reorderWordGroups(body.orderedIds);
    return jsonOk({ groups });
  } catch (error) {
    return jsonError(error);
  }
}
