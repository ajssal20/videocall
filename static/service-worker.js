// Service Worker für VideoCall PWA
// Dieser Worker implementiert:
// - Offline-Unterstützung für statische Assets
// - Cache-Strategie (Network-first für dynamische, Cache-first für static)
// - Hintergrund-Sync für verpasste Nachrichten (optional)

const CACHE_NAME = 'videocall-v1';
const OFFLINE_RESPONSE = new Response('You are offline and this page is not cached.', {
	status: 503,
	statusText: 'Service Unavailable'
});

// Assets die sofort gecacht werden
const PRECACHE_URLS = [
	'/',
	'/manifest.json',
	'/favicon-32x32.png',
	'/favicon-16x16.png'
];

// Service Worker Installation
self.addEventListener('install', (event) => {
	console.log('[Service Worker] Installing...');

	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => {
				console.log('[Service Worker] Pre-caching assets');
				return cache.addAll(PRECACHE_URLS);
			})
			.then(() => self.skipWaiting())
	);
});

// Service Worker Aktivierung
self.addEventListener('activate', (event) => {
	console.log('[Service Worker] Activating...');

	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames.map((cacheName) => {
						if (cacheName !== CACHE_NAME) {
							console.log('[Service Worker] Deleting cache:', cacheName);
							return caches.delete(cacheName);
						}
					})
				);
			})
			.then(() => self.clients.claim())
	);
});

// Fetch-Events Handler
self.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// Ignoriere non-GET requests
	if (request.method !== 'GET') {
		return;
	}

	// Ignoriere externe Anfragen und absolute URLs zu anderen Origins
	if (url.origin !== location.origin) {
		return;
	}

	// Network-first für HTML (dynamic content)
	if (request.mode === 'navigate' || request.destination === 'document') {
		event.respondWith(
			fetch(request)
				.then((response) => {
					// Cache successful responses
					if (response.ok) {
						const responseToCache = response.clone();
						caches.open(CACHE_NAME).then((cache) => {
							cache.put(request, responseToCache);
						});
					}
					return response;
				})
				.catch(() => {
					// Return cached version or offline page
					return caches
						.match(request)
						.then((response) => response || OFFLINE_RESPONSE);
				})
		);
		return;
	}

	// Cache-first für statische Assets (JS, CSS, Fonts, Images)
	if (
		request.destination === 'script' ||
		request.destination === 'style' ||
		request.destination === 'font' ||
		request.destination === 'image'
	) {
		event.respondWith(
			caches.match(request).then((response) => {
				if (response) {
					return response;
				}

				return fetch(request).then((response) => {
					// Cache valid responses
					if (response.ok) {
						const responseToCache = response.clone();
						caches.open(CACHE_NAME).then((cache) => {
							cache.put(request, responseToCache);
						});
					}
					return response;
				});
			})
		);
		return;
	}

	// Default: Network-first
	event.respondWith(
		fetch(request)
			.then((response) => {
				// Cache alle erfolgreichen Responses
				if (response.ok) {
					const responseToCache = response.clone();
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(request, responseToCache);
					});
				}
				return response;
			})
			.catch(() => {
				// Versuche aus Cache zu laden
				return caches
					.match(request)
					.then((response) => response || OFFLINE_RESPONSE);
			})
	);
});

// Message Handler für Client-Kommunikation (optional)
self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
});

console.log('[Service Worker] Loaded');
