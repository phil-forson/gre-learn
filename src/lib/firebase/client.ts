import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getMessaging, isSupported, type Messaging } from "firebase/messaging";
import {
  isLikelyVapidPublicKey,
  sanitizePublicEnvValue,
} from "@/lib/env/sanitize-public-env";

export type FirebaseClientConfig = {
  apiKey: string;
  authDomain?: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId: string;
  appId: string;
  vapidKey: string;
};

export function readFirebaseClientConfig(): FirebaseClientConfig | null {
  const apiKey = sanitizePublicEnvValue(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
  const projectId = sanitizePublicEnvValue(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  );
  const messagingSenderId = sanitizePublicEnvValue(
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  );
  const appId = sanitizePublicEnvValue(process.env.NEXT_PUBLIC_FIREBASE_APP_ID);
  const vapidKey = sanitizePublicEnvValue(
    process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  );
  if (!apiKey || !projectId || !messagingSenderId || !appId || !vapidKey) {
    return null;
  }
  if (!isLikelyVapidPublicKey(vapidKey)) {
    return null;
  }
  return {
    apiKey,
    authDomain: sanitizePublicEnvValue(
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    ),
    projectId,
    storageBucket: sanitizePublicEnvValue(
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    ),
    messagingSenderId,
    appId,
    vapidKey,
  };
}

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

export function getFirebaseClientApp(
  config: FirebaseClientConfig,
): FirebaseApp {
  if (app) return app;
  if (getApps().length) {
    app = getApps()[0]!;
    return app;
  }
  app = initializeApp({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
  });
  return app;
}

export async function getFirebaseMessaging(
  config: FirebaseClientConfig,
): Promise<Messaging | null> {
  if (!(await isSupported())) return null;
  if (messaging) return messaging;
  messaging = getMessaging(getFirebaseClientApp(config));
  return messaging;
}
