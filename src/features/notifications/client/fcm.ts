"use client";

import { getToken } from "firebase/messaging";
import {
  getFirebaseMessaging,
  readFirebaseClientConfig,
} from "@/lib/firebase/client";

export type FcmRegistrationResult =
  | { ok: true; token: string }
  | { ok: false; reason: string };

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

  let registration: ServiceWorkerRegistration | undefined;
  if ("serviceWorker" in navigator) {
    registration =
      (await navigator.serviceWorker.getRegistration()) ??
      (await navigator.serviceWorker.register("/sw.js"));
  }

  try {
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
