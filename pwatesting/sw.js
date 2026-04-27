const CACHE_NAME = 'pwa-test-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

// Notifications
const timers = new Map();

self.addEventListener('message', event => {
  if (!event.data) return;
  
  if (event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { id, title, options, delay } = event.data;
    
    // Check if the experimental Notification Triggers API is supported
    if ('showTrigger' in Notification.prototype) {
      options.showTrigger = new TimestampTrigger(Date.now() + delay);
      self.registration.showNotification(title, options)
        .catch(err => console.error('showTrigger failed:', err));
    } else {
      // Fallback to setTimeout inside SW (will be killed by OS if app is closed/swiped away)
      const timerId = setTimeout(() => {
        self.registration.showNotification(title, options);
        timers.delete(id);
      }, delay);
      timers.set(id, timerId);
    }
    
  } else if (event.data.type === 'PERSISTENT_NOTIFICATION') {
    const { id, title, options, interval } = event.data;
    
    // Fallback to setInterval (will be killed when swiped away)
    const timerId = setInterval(() => {
      options.body = `Triggered at ${new Date().toLocaleTimeString()}\n${options.originalBody || options.body}`;
      self.registration.showNotification(title, options);
    }, interval);
    timers.set(id, timerId);
  } else if (event.data.type === 'CANCEL_ALL') {
    for (const timerId of timers.values()) {
      clearTimeout(timerId);
      clearInterval(timerId);
    }
    timers.clear();
    
    // To cancel showTrigger notifications, we need to get pending notifications and close them
    self.registration.getNotifications().then(notifications => {
      notifications.forEach(notification => notification.close());
    });
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes('/index.html') || client.url.endsWith('/') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./index.html');
      }
    })
  );
});
