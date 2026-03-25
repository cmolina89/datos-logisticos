// Service Worker for CoppelFramework PWA
const CACHE_NAME = 'coppelframework-v1.0.0'
const STATIC_CACHE = 'static-v1.0.0'
const DYNAMIC_CACHE = 'dynamic-v1.0.0'
const API_CACHE = 'api-v1.0.0'

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/themes/lara-light-indigo/theme.css',
  '/themes/lara-dark-indigo/theme.css',
]

// API endpoints to cache
const API_ENDPOINTS = ['https://jsonplaceholder.typicode.com/posts']

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...')

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Service Worker: Static assets cached')
        return self.skipWaiting()
      })
      .catch(error => {
        console.error('Service Worker: Error caching static assets', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...')

  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== API_CACHE
            ) {
              console.log('Service Worker: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker: Activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Handle different types of requests
  if (url.origin === location.origin) {
    event.respondWith(handleAppRequest(request))
  } else if (API_ENDPOINTS.some(endpoint => request.url.startsWith(endpoint))) {
    event.respondWith(handleApiRequest(request))
  } else {
    event.respondWith(handleExternalRequest(request))
  }
})

// Handle app requests
async function handleAppRequest(request) {
  const url = new URL(request.url)

  // Static assets - Cache First
  if (url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)) {
    try {
      const cachedResponse = await caches.match(request)
      if (cachedResponse) {
        return cachedResponse
      }

      const networkResponse = await fetch(request)
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
      return networkResponse
    } catch (error) {
      return new Response('Asset not available offline', { status: 503 })
    }
  }

  // HTML pages - Network First
  try {
    const networkResponse = await fetch(request)
    const cache = await caches.open(DYNAMIC_CACHE)
    cache.put(request, networkResponse.clone())
    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    if (request.mode === 'navigate') {
      return caches.match('/') || new Response('Offline', { status: 503 })
    }

    return new Response('Content not available offline', { status: 503 })
  }
}

// Handle API requests
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    return new Response(
      JSON.stringify({
        error: 'No network connection',
        offline: true,
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

// Handle external requests
async function handleExternalRequest(request) {
  try {
    return await fetch(request)
  } catch (error) {
    return new Response('External resource not available', { status: 503 })
  }
}

// Push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
  }

  event.waitUntil(self.registration.showNotification('CoppelFramework', options))
})

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close()

  event.waitUntil(clients.openWindow('/'))
})
