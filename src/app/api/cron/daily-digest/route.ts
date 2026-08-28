import { jsonError, jsonOk } from "@/lib/api";
import { getEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { runDailyDigestCron, runPianoTipCron } from "@/features/notifications/services/send-service";

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

async function handleCron(request: Request) {
  assertCronAuthorized(request);
  const url = new URL(request.url);
  const ignoreSendHour = url.searchParams.get("ignoreSendHour") === "1";
  const now = new Date();
  const [digest, pianoTips] = await Promise.all([
    runDailyDigestCron(now, { ignoreSendHour }),
    runPianoTipCron(now),
  ]);
  return { digest, pianoTips };
}

/** Vercel Cron invokes GET with Authorization: Bearer CRON_SECRET */
export async function GET(request: Request) {
  try {
    const result = await handleCron(request);
    return jsonOk({ ok: true, ...result });
  } catch (error) {
    return jsonError(error);
  }
}

/** Manual dry-run: POST with the same Bearer secret */
export async function POST(request: Request) {
  try {
    const result = await handleCron(request);
    return jsonOk({ ok: true, ...result });
  } catch (error) {
    return jsonError(error);
  }
}
