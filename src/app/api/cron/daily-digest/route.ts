import { jsonError, jsonOk } from "@/lib/api";
import { getEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { runDailyDigestCron } from "@/features/notifications/services/send-service";

function assertCronAuthorized(request: Request) {
  const secret = getEnv().CRON_SECRET;
  if (!secret) {
    throw new AppError(
      "CRON_SECRET is not configured.",
      "CRON_NOT_CONFIGURED",
      503,
    );
  }
  const header = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  if (header !== expected) {
    throw new AppError("Unauthorized", "UNAUTHORIZED", 401);
  }
}

export async function POST(request: Request) {
  try {
    assertCronAuthorized(request);
    const url = new URL(request.url);
    const ignoreSendHour = url.searchParams.get("ignoreSendHour") === "1";
    const result = await runDailyDigestCron(new Date(), { ignoreSendHour });
    return jsonOk({ ok: true, ...result });
  } catch (error) {
    return jsonError(error);
  }
}
