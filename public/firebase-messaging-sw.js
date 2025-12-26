/* eslint-disable no-undef */

importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

/**
 * Initialize Firebase
 * USE THE SAME CONFIG AS YOUR REACT APP
 */
firebase.initializeApp({
  apiKey: import.meta.env.VITE_APP_API_KEY,
  authDomain: import.meta.env.VITE_APP_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_APP_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_APP_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_APP_ID,
});

/**
 * Retrieve Firebase Messaging instance
 */
const messaging = firebase.messaging();

/**
 * 🔔 BACKGROUND NOTIFICATIONS
 * Triggered when:
 *  - App is closed
 *  - App is in background
 *  - Browser tab is inactive
 */
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Background message:", payload);

  const notificationTitle =
    payload.notification?.title || "New Notification";

  const notificationOptions = {
    body: payload.notification?.body || "You have a new message",
    icon: "/logo192.png",
    badge: "/badge.png",
    data: payload.data || {},
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

/**
 * 🖱️ Notification Click Handler
 * Opens app when user clicks notification
 */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(
      function (clientList) {
        for (const client of clientList) {
          if (client.url === "/" && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow("/");
        }
      }
    )
  );
});
