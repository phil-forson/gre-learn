import { jsonError, jsonOk } from "@/lib/api";
import {
  deleteWordGroup,
  renameWordGroup,
} from "@/features/vocabulary/services/word-group-service";
import { renameWordGroupSchema } from "@/features/vocabulary/schemas/word-group";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = renameWordGroupSchema.parse(await request.json());
    const group = await renameWordGroup(id, body.name);
    return jsonOk({ group });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await deleteWordGroup(id);
    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
