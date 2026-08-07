import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api";
import {
  deleteVocabulary,
  getVocabulary,
  regenerateVocabulary,
  toggleFavorite,
  updatePersonalNote,
} from "@/features/vocabulary/services/vocabulary-service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const entry = await getVocabulary(id);
    return jsonOk({ entry });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await deleteVocabulary(id);
    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}

const patchSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("favorite") }),
  z.object({ action: z.literal("regenerate") }),
  z.object({ action: z.literal("note"), note: z.string().max(2000).nullable() }),
]);

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = patchSchema.parse(await request.json());
    if (body.action === "favorite") {
      return jsonOk({ entry: await toggleFavorite(id) });
    }
    if (body.action === "regenerate") {
      return jsonOk({ entry: await regenerateVocabulary(id) });
    }
    return jsonOk({ entry: await updatePersonalNote(id, body.note) });
  } catch (error) {
    return jsonError(error);
  }
}
