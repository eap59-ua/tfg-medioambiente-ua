const CACHE_NAME = 'ecoalerta-cache-v1';
const DYNAMIC_CACHE = 'ecoalerta-dynamic-v1';

// Recursos estáticos básicos
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Instalar SW y pre-cachear estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Precaching estáticos');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activar SW y limpiar cachés viejas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
            console.log('[Service Worker] Limpiando caché antigua', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estrategia Network First (con fallback a caché) para la API y HTML
// Estrategia Cache First para imágenes y estáticos
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar peticiones no-GET o de extensiones
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) return;

  // RUTAS API: Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Guardar copia en dinámica
          const clonedResponse = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clonedResponse));
          return response;
        })
        .catch(async () => {
          // Offline fallback
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          
          return new Response(JSON.stringify({
            success: false,
            error: 'Estás offline y no hay datos en caché para esta solicitud.'
          }), { headers: { 'Content-Type': 'application/json' } });
        })
    );
    return;
  }

  // RECURSOS ESTÁTICOS & IMÁGENES: Cache First
  if (
    request.destination === 'image' ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    url.pathname.includes('/static/') ||
    url.pathname.match(/\.(png|jpg|jpeg|webp|svg|css|js)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(request).then((networkResponse) => {
          const clonedResponse = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clonedResponse));
          return networkResponse;
        }).catch(() => {
          // Si es una imagen y falla, devolver un placeholder si tuviéramos
        });
      })
    );
    return;
  }

  // HTML Y NAVEGACIÓN: Network First para SPA
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match('/index.html'))
    );
    return;
  }
});
