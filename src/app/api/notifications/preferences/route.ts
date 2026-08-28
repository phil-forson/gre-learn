import { jsonError, jsonOk } from "@/lib/api";
import {
  assertNotificationsMutationAuth,
  isNotificationsMutationAuthConfigured,
} from "@/features/notifications/services/mutation-auth";
import {
  getNotificationPreferences,
  patchNotificationPreferences,
} from "@/features/notifications/services/preferences-service";
import {
  isFcmClientConfigured,
  isFcmSendConfigured,
} from "@/features/notifications/services/send-service";

function fcmStatus() {
  return {
    clientConfigured: isFcmClientConfigured(),
    sendConfigured: isFcmSendConfigured(),
    authConfigured: isNotificationsMutationAuthConfigured(),
  };
}

export async function GET() {
  try {
    const preferences = await getNotificationPreferences();
    return jsonOk({
      preferences,
      fcm: fcmStatus(),
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    assertNotificationsMutationAuth(request);
    const body = await request.json();
    const preferences = await patchNotificationPreferences(body);
    return jsonOk({
      preferences,
      fcm: fcmStatus(),
    });
  } catch (error) {
    return jsonError(error);
  }
}
