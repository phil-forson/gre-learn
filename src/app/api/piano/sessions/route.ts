import { jsonError, jsonOk } from "@/lib/api";
import {
  completeSessionBlock,
  listSessions,
} from "@/features/piano/services/session-service";

export async function GET() {
  try {
    const sessions = await listSessions();
    return jsonOk({ sessions });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const session = await completeSessionBlock(body);
    return jsonOk({ session });
  } catch (error) {
    return jsonError(error);
  }
}
