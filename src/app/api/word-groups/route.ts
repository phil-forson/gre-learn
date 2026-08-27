import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api";
import {
  createWordGroup,
  listWordGroups,
} from "@/features/vocabulary/services/word-group-service";
import { createWordGroupSchema } from "@/features/vocabulary/schemas/word-group";

export async function GET() {
  try {
    const groups = await listWordGroups();
    return jsonOk({ groups });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = createWordGroupSchema.parse(await request.json());
    const group = await createWordGroup(body.name);
    return jsonOk({ group }, 201);
  } catch (error) {
    return jsonError(error);
  }
}
