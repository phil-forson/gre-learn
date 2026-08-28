/* gre-learn service worker — install shell + FCM-ready push */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let title = "Today's English";
  let body = "Open gre-learn to continue.";
  let url = "/";
  try {
    const payload = event.data ? event.data.json() : null;
    if (payload) {
      if (payload.notification?.title) title = payload.notification.title;
      if (payload.notification?.body) body = payload.notification.body;
      if (payload.data?.url) url = payload.data.url;
      if (payload.title) title = payload.title;
      if (payload.body) body = payload.body;
      if (payload.url) url = payload.url;
    }
  } catch {
    try {
      const text = event.data?.text();
      if (text) body = text;
    } catch {
      /* ignore */
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url },
    }),
  );
});

function isSafeClientPath(url) {
  return (
    typeof url === "string" &&
    url.startsWith("/") &&
    !url.startsWith("//") &&
    !url.includes("://")
  );
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const raw = event.notification?.data?.url || "/";
  const path = isSafeClientPath(raw) ? raw : "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate?.(path);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(path);
      }
      return undefined;
    }),
  );
});
