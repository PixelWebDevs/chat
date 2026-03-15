self.addEventListener("install", () => {
  console.log("Service Worker installed")
})

self.addEventListener("activate", () => {
  console.log("Service Worker activated")
})

// Handle push notifications
self.addEventListener("push", event => {
  const data = event.data ? event.data.text() : "New notification"

  event.waitUntil(
    self.registration.showNotification("Website Notification", {
      body: data,
      icon: "icon.png"
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
