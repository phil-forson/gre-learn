import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";

let app: App | null = null;

export function getFirebaseAdminApp(): App {
  if (app) return app;
  if (getApps().length) {
    app = getApps()[0]!;
    return app;
  }

  const env = getEnv();
  if (
    !env.FIREBASE_ADMIN_PROJECT_ID ||
    !env.FIREBASE_ADMIN_CLIENT_EMAIL ||
    !env.FIREBASE_ADMIN_PRIVATE_KEY
  ) {
    throw new AppError(
      "Firebase Admin is not configured. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY, or use DATA_DRIVER=local.",
      "FIREBASE_NOT_CONFIGURED",
      500,
    );
  }

  const privateKey = env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n");

  app = initializeApp({
    credential: cert({
      projectId: env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });

  return app;
}

export function getDb(): Firestore {
  return getFirestore(getFirebaseAdminApp());
}

export function getBucket() {
  return getStorage(getFirebaseAdminApp()).bucket();
}
