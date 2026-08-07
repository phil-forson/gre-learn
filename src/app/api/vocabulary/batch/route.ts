import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api";
import { batchAddVocabulary } from "@/features/vocabulary/services/vocabulary-service";

const schema = z.object({
  text: z.string().min(1).max(5000),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const results = await batchAddVocabulary(body.text);
    return jsonOk({ results });
  } catch (error) {
    return jsonError(error);
  }
}
