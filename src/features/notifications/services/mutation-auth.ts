import { getEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";

/**
 * Gates notification mutations that can register FCM tokens or trigger sends.
 * Accepts NOTIFICATIONS_PAIRING_SECRET (preferred for Settings UI) or CRON_SECRET.
 */
export function assertNotificationsMutationAuth(request: Request): void {
  const env = getEnv();
  const pairing = env.NOTIFICATIONS_PAIRING_SECRET?.trim();
  const cron = env.CRON_SECRET?.trim();

  if (!pairing && !cron) {
    throw new AppError(
      "Set NOTIFICATIONS_PAIRING_SECRET (or CRON_SECRET) in .env.local before enabling digests.",
      "NOTIFICATIONS_AUTH_NOT_CONFIGURED",
      503,
    );
  }

  const pairingHeader = request.headers.get("x-notifications-pairing")?.trim();
  if (pairingHeader) {
    if (pairing && pairingHeader === pairing) return;
    // Allow CRON_SECRET in the Settings pairing field when pairing secret unset.
    if (cron && pairingHeader === cron) return;
  }

  const auth = request.headers.get("authorization") ?? "";
  if (cron && auth === `Bearer ${cron}`) {
    return;
  }

  // Allow pairing secret via Bearer as well (Settings curl / advanced).
  if (pairing && auth === `Bearer ${pairing}`) {
    return;
  }

  throw new AppError(
    "Unauthorized. Provide X-Notifications-Pairing or Authorization Bearer secret.",
    "UNAUTHORIZED",
    401,
  );
}

export function isNotificationsMutationAuthConfigured(): boolean {
  const env = getEnv();
  return Boolean(
    env.NOTIFICATIONS_PAIRING_SECRET?.trim() || env.CRON_SECRET?.trim(),
  );
}
