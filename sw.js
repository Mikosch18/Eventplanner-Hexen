// Service Worker: zeigt Push-Mitteilungen an und öffnet beim Antippen die App.
// Absichtlich KEIN fetch-Handler: der würde Seiten zwischenspeichern, und Updates an der App kämen nicht mehr an.

self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { title: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Neuigkeit', {
    body: d.body || '',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    data: { url: d.url || './' },
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const scope = self.registration.scope;
  let url = new URL((e.notification.data && e.notification.data.url) || './', scope).href;
  if (!url.startsWith(scope)) url = scope;   // nur innerhalb der App – nie eine fremde Seite öffnen
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    for (const c of list) if (c.url.startsWith(scope)) { c.navigate(url); return c.focus(); }
    return clients.openWindow(url);
  }));
});
