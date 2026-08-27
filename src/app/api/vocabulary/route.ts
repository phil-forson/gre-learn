import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api";
import {
  addVocabularyWord,
  listVocabulary,
} from "@/features/vocabulary/services/vocabulary-service";

const createSchema = z.object({
  word: z.string().min(1).max(80),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await listVocabulary({
      query: searchParams.get("q") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      favoritesOnly: searchParams.get("favorites") === "1",
      groupId: searchParams.get("groupId") ?? undefined,
      sort:
        (searchParams.get("sort") as "alpha" | "newest" | "oldest" | null) ??
        "newest",
      page: Number(searchParams.get("page") ?? "1"),
      pageSize: Number(searchParams.get("pageSize") ?? "20"),
    });
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = createSchema.parse(await request.json());
    const result = await addVocabularyWord(body.word);
    return jsonOk(result, result.created ? 201 : 200);
  } catch (error) {
    return jsonError(error);
  }
}
