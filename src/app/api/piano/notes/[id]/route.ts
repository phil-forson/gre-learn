import { jsonError, jsonOk } from "@/lib/api";
import { patchYoutubeNote } from "@/features/piano/services/notes-service";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const note = await patchYoutubeNote(id, body);
    return jsonOk({ note });
  } catch (error) {
    return jsonError(error);
  }
}
