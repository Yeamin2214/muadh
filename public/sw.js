// Minimal service worker: lets prayer reminders show as proper notifications (needed on Android).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window" }).then((list) => (list.length ? list[0].focus() : self.clients.openWindow("/"))));
});
