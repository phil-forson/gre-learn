import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api";
import { batchAddManualVocabulary } from "@/features/vocabulary/services/vocabulary-service";

const schema = z.object({
  text: z.string().min(1).max(20000),
  groupId: z.string().min(1).nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const results = await batchAddManualVocabulary(body.text, {
      groupId: body.groupId ?? undefined,
    });
    return jsonOk({ results });
  } catch (error) {
    return jsonError(error);
  }
}
