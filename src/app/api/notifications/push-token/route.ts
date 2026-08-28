import { jsonError, jsonOk } from "@/lib/api";
import { assertNotificationsMutationAuth } from "@/features/notifications/services/mutation-auth";
import {
  registerPushToken,
  unregisterPushToken,
} from "@/features/notifications/services/preferences-service";

export async function POST(request: Request) {
  try {
    assertNotificationsMutationAuth(request);
    const body = await request.json();
    const token = await registerPushToken(body);
    return jsonOk({ token }, 201);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    assertNotificationsMutationAuth(request);
    const body = await request.json();
    const result = await unregisterPushToken(body);
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
