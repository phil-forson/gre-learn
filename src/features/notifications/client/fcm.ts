"use client";

import { getToken, onMessage } from "firebase/messaging";
import {
  getFirebaseMessaging,
  readFirebaseClientConfig,
} from "@/lib/firebase/client";

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
  const config = readFirebaseClientConfig();
  if (!config) {
    return {
      ok: false,
      reason:
        "Push is not configured (missing Firebase web config or VAPID key).",
    };
  }

  if (typeof window === "undefined" || !("Notification" in window)) {
    return { ok: false, reason: "Notifications are not supported in this browser." };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { ok: false, reason: "Notification permission was not granted." };
  }

  const messaging = await getFirebaseMessaging(config);
  if (!messaging) {
    return { ok: false, reason: "Firebase Messaging is not supported here." };
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
      return { ok: false, reason: "Could not obtain an FCM token." };
    }
    return { ok: true, token };
  } catch (error) {
    return {
      ok: false,
      reason:
        error instanceof Error
          ? error.message
          : "Failed to register for push notifications.",
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
