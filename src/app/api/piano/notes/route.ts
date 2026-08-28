import { jsonError, jsonOk } from "@/lib/api";
import {
  createYoutubeNote,
  listYoutubeNotes,
} from "@/features/piano/services/notes-service";

export async function GET() {
  try {
    const notes = await listYoutubeNotes();
    return jsonOk({ notes });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const note = await createYoutubeNote(body);
    return jsonOk({ note }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
