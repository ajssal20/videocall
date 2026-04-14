





const CACHE_NAME = 'videocall-v1';
const OFFLINE_RESPONSE = new Response('You are offline and this page is not cached.', {
	status: 503,
	statusText: 'Service Unavailable'
});


const PRECACHE_URLS = [
	'/',
	'/manifest.json',
	'/favicon-32x32.png',
	'/favicon-16x16.png'
];


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


self.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);

	
	if (request.method !== 'GET') {
		return;
	}

	
	if (url.origin !== location.origin) {
		return;
	}

	
	if (request.mode === 'navigate' || request.destination === 'document') {
		event.respondWith(
			fetch(request)
				.then((response) => {
					
					if (response.ok) {
						const responseToCache = response.clone();
						caches.open(CACHE_NAME).then((cache) => {
							cache.put(request, responseToCache);
						});
					}
					return response;
				})
				.catch(() => {
					
					return caches
						.match(request)
						.then((response) => response || OFFLINE_RESPONSE);
				})
		);
		return;
	}

	
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

	
	event.respondWith(
		fetch(request)
			.then((response) => {
				
				if (response.ok) {
					const responseToCache = response.clone();
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(request, responseToCache);
					});
				}
				return response;
			})
			.catch(() => {
				
				return caches
					.match(request)
					.then((response) => response || OFFLINE_RESPONSE);
			})
	);
});


self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
});

console.log('[Service Worker] Loaded');
