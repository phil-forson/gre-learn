import { jsonError, jsonOk } from "@/lib/api";
import { assertNotificationsMutationAuth } from "@/features/notifications/services/mutation-auth";
import { sendTestDigest } from "@/features/notifications/services/send-service";

export async function POST(request: Request) {
  try {
    assertNotificationsMutationAuth(request);
    const result = await sendTestDigest();
    // Do not echo full digest payload on the wire for test sends.
    return jsonOk({
      ok: result.ok,
      configured: result.configured,
      message: result.message,
      result: result.result,
      preview: result.payload
        ? {
            title: result.payload.title,
            body: result.payload.body,
            url: result.payload.url,
            kind: result.payload.kind,
          }
        : null,
    });
  } catch (error) {
    return jsonError(error);
  }
}
