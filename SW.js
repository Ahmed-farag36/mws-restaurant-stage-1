const myCache = 'restaurant-static-assets v1';
const myImages = 'restaurant-images v1';

self.addEventListener('install', (e) => {
	e.waitUntil(
		caches.open(myCache).then(cache => {
			cache.addAll([
				"/",
				"/restaurant.html",
				"css/uglified/index.css",
				"css/uglified/restaurant.css",
				"fonts/icomoon.eot",
				"fonts/icomoon.svg",
				"fonts/icomoon.ttf",
				"fonts/icomoon.woff",
				"http://localhost:8000/js/uglified/dbhelper.js",
				"http://localhost:8000/js/main.js",
				"http://localhost:8000/js/restaurant_info.js",
				"https://cdn.jsdelivr.net/npm/idb@2.1.3/lib/idb.min.js",
				"/manifest.json"
			])
		})
	)
});

self.addEventListener('activate', e => {
	e.waitUntil(
		caches.keys().then(cachesArr => {
			Promise.all(
				cachesArr.map(cache => {
					if (cache.startsWith("restaurant") && cache != myCache && cache != myImages) {
							return caches.delete(cache);
					}
				})
			)
		})
	)
});

self.addEventListener('fetch', e => {
	e.respondWith(
		caches.match(e.request).then(res => {
			if (res) {
				console.log('from cache: ', res)
				return res;
			} else {
				return fetch(e.request).then(res => {
					console.log('from network: ', res);
					if (res.url.endsWith('webp') || res.url.endsWith('jpg')) {
						caches.open(myImages).then(cache => {
							cache.put(e.request, res);
						})
					}
					return res.clone();
				})
			}
		})
	)
});