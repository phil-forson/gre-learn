"use client";

import { getToken, onMessage } from "firebase/messaging";
import {
  getFirebaseMessaging,
  readFirebaseClientConfig,
} from "@/lib/firebase/client";
import { readPushEnvironment } from "@/features/notifications/client/push-diagnostics";

export type FcmRegistrationResult =
  | { ok: true; token: string }
  | { ok: false; reason: string };

async function getServiceWorkerRegistration(): Promise<
  ServiceWorkerRegistration | undefined
> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return undefined;
  }
  const existing = await navigator.serviceWorker.getRegistration();
  if (existing) return existing;
  return navigator.serviceWorker.register("/sw.js", { scope: "/" });
}

export async function registerFcmToken(): Promise<FcmRegistrationResult> {
  const env = readPushEnvironment();
  if (!env.notificationsApi) {
    return {
      ok: false,
      reason: "Notifications are not supported in this browser.",
    };
  }

  if (env.ios && !env.standalone) {
    return {
      ok: false,
      reason:
        "On iPhone, open gre-learn from the Home Screen icon (not Safari). Add via Share → Add to Home Screen first.",
    };
  }

  if (env.permission === "denied") {
    return {
      ok: false,
      reason:
        "Notifications are blocked. iPhone: Settings → Notifications → GRE Learn → Allow Notifications, then try again.",
    };
  }

  const config = readFirebaseClientConfig();
  if (!config) {
    return {
      ok: false,
      reason:
        "Push is not configured (missing Firebase web config or VAPID key).",
    };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return {
      ok: false,
      reason:
        permission === "denied"
          ? "Notification permission was denied. Enable in iPhone Settings → Notifications → GRE Learn."
          : "Notification permission was not granted.",
    };
  }

  const messaging = await getFirebaseMessaging(config);
  if (!messaging) {
    return {
      ok: false,
      reason:
        "Firebase Messaging is not supported in this browser (iOS 16.4+ required on iPhone).",
    };
  }

  const registration = await getServiceWorkerRegistration();
  if (!registration) {
    return { ok: false, reason: "Could not register the service worker." };
  }

  try {
    await navigator.serviceWorker.ready;
    const token = await getToken(messaging, {
      vapidKey: config.vapidKey,
      serviceWorkerRegistration: registration,
    });
    if (!token) {
      return {
        ok: false,
        reason:
          "Could not obtain an FCM token. Check Firebase Web Push certificate (VAPID) matches NEXT_PUBLIC_FIREBASE_VAPID_KEY on Vercel.",
      };
    }
    return { ok: true, token };
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Unknown registration error";
    const hint =
      /invalid character/i.test(detail) ||
      /applicationServerKey/i.test(detail)
        ? " Check NEXT_PUBLIC_FIREBASE_VAPID_KEY — use only the key string (no quotes or inline # comments)."
        : "";
    return {
      ok: false,
      reason: `Push registration failed: ${detail}${hint}`,
    };
  }
}

/** Show a banner when FCM arrives while the app is open (e.g. Send test). */
export function listenForForegroundMessages(
  onReceive?: (title: string, body: string) => void,
): (() => void) | undefined {
  if (typeof window === "undefined") return undefined;

  const config = readFirebaseClientConfig();
  if (!config) return undefined;

  let cancelled = false;
  void (async () => {
    const messaging = await getFirebaseMessaging(config);
    if (!messaging || cancelled) return;

    onMessage(messaging, (payload) => {
      const title = payload.notification?.title ?? "Today's English";
      const body = payload.notification?.body ?? "Open gre-learn to continue.";
      onReceive?.(title, body);
      if (Notification.permission === "granted") {
        try {
          new Notification(title, {
            body,
            icon: "/icons/icon-192.png",
            data: { url: payload.data?.url ?? "/" },
          });
        } catch {
          /* ignore — in-app toast still shown */
        }
      }
    });
  })();

  return () => {
    cancelled = true;
  };
}
