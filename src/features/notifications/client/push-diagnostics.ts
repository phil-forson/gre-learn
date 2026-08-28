"use client";

/** Client-side checks for Web Push / FCM on this device. */
export type PushEnvironment = {
  notificationsApi: boolean;
  permission: NotificationPermission | "unsupported";
  serviceWorker: boolean;
  standalone: boolean;
  ios: boolean;
  pushManager: boolean;
  readyForRegister: boolean;
  hints: string[];
};

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // Safari iOS legacy flag
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export function readPushEnvironment(): PushEnvironment {
  const notificationsApi =
    typeof window !== "undefined" && "Notification" in window;
  const permission: NotificationPermission | "unsupported" = notificationsApi
    ? Notification.permission
    : "unsupported";
  const serviceWorker =
    typeof navigator !== "undefined" && "serviceWorker" in navigator;
  const standalone = isStandalone();
  const ios = isIos();
  const pushManager =
    typeof window !== "undefined" &&
    "PushManager" in window &&
    serviceWorker;

  const hints: string[] = [];

  if (ios && !standalone) {
    hints.push(
      "Open gre-learn from your Home Screen icon (Share → Add to Home Screen). Safari tabs cannot register for push on iPhone.",
    );
  }
  if (permission === "denied") {
    hints.push(
      "Notifications are blocked. iPhone: Settings → Notifications → GRE Learn → Allow Notifications.",
    );
  }
  if (permission === "default") {
    hints.push(
      "Tap Register this phone — iOS will ask to allow notifications.",
    );
  }
  if (!serviceWorker) {
    hints.push("This browser does not support service workers.");
  }
  if (!pushManager && ios && standalone) {
    hints.push(
      "Push may be unavailable — update to iOS 16.4 or later for Web Push.",
    );
  }

  const readyForRegister =
    notificationsApi &&
    permission !== "denied" &&
    serviceWorker &&
    (!ios || standalone);

  return {
    notificationsApi,
    permission,
    serviceWorker,
    standalone,
    ios,
    pushManager,
    readyForRegister,
    hints,
  };
}
