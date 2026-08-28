import { jsonError, jsonOk } from "@/lib/api";
import {
  listPublicPlacementItems,
  submitPlacementAnswers,
} from "@/features/path/services/placement-service";

export async function GET() {
  try {
    const items = listPublicPlacementItems();
    return jsonOk({ items, itemCount: items.length });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await submitPlacementAnswers(body);
    return jsonOk(data);
  } catch (error) {
    return jsonError(error);
  }
}
