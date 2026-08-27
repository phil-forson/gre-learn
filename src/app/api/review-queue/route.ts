import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api";
import {
  getReviewQueue,
  recordReviewEvent,
} from "@/features/audio/services/audio-service";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const mode =
      (url.searchParams.get("mode") as
        | "all"
        | "shuffle"
        | "recent"
        | "favorites"
        | null) ?? "all";
    const groupId = url.searchParams.get("groupId");
    const excludeId = url.searchParams.get("excludeId");
    const queue = await getReviewQueue(mode, {
      groupId: groupId || undefined,
      excludeId: excludeId || undefined,
    });
    return jsonOk({
      queue: queue.map((e) => ({
        id: e.id,
        word: e.word,
        normalizedWord: e.normalizedWord,
        isFavorite: e.isFavorite,
        pronunciation: e.content?.pronunciation ?? null,
        primaryDefinition:
          e.content?.definitions.find((d) => d.isPrimary)?.text ??
          e.content?.definitions[0]?.text ??
          null,
      })),
    });
  } catch (error) {
    return jsonError(error);
  }
}

const eventSchema = z.object({
  vocabularyEntryId: z.string().min(1),
  action: z.enum(["played", "completed"]),
});

export async function POST(request: Request) {
  try {
    const body = eventSchema.parse(await request.json());
    const event = await recordReviewEvent(
      body.vocabularyEntryId,
      body.action,
    );
    return jsonOk({ event });
  } catch (error) {
    return jsonError(error);
  }
}
