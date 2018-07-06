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
				"https://fonts.googleapis.com/css?family=Roboto:300,700",
				"https://fonts.googleapis.com/css?family=Merriweather:900",
				"https://fonts.gstatic.com/s/roboto/v18/KFOlCnqEu92Fr1MmEU9fBBc4.woff2",
				"https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxK.woff2",
				"https://fonts.gstatic.com/s/merriweather/v19/u-4n0qyriQwlOrhSvowK_l52_wFZWMf6.woff2",
				"http://localhost:8000/js/uglified/dbhelper.js",
				"http://localhost:8000/js/main.js",
				"http://localhost:8000/js/restaurant_info.js",
				"https://cdn.jsdelivr.net/npm/idb@2.1.3/lib/idb.min.js"
			])
		}),
		caches.open(myImages).then(cache => {
			cache.addAll([
				'http://localhost:8000/img/1_400.jpg',
				'http://localhost:8000/img/1_400.webp',
				'http://localhost:8000/img/1.jpg',
				'http://localhost:8000/img/1.webp',
				'http://localhost:8000/img/2_400.jpg',
				'http://localhost:8000/img/2_400.webp',
				'http://localhost:8000/img/2.jpg',
				'http://localhost:8000/img/2.webp',
				'http://localhost:8000/img/3_400.jpg',
				'http://localhost:8000/img/3_400.webp',
				'http://localhost:8000/img/3.jpg',
				'http://localhost:8000/img/3.webp',
				'http://localhost:8000/img/4_400.jpg',
				'http://localhost:8000/img/4_400.webp',
				'http://localhost:8000/img/4.jpg',
				'http://localhost:8000/img/4.webp',
				'http://localhost:8000/img/5_400.jpg',
				'http://localhost:8000/img/5_400.webp',
				'http://localhost:8000/img/5.jpg',
				'http://localhost:8000/img/5.webp',
				'http://localhost:8000/img/6_400.jpg',
				'http://localhost:8000/img/6_400.webp',
				'http://localhost:8000/img/6.jpg',
				'http://localhost:8000/img/6.webp',
				'http://localhost:8000/img/7_400.jpg',
				'http://localhost:8000/img/7_400.webp',
				'http://localhost:8000/img/7.jpg',
				'http://localhost:8000/img/7.webp',
				'http://localhost:8000/img/8_400.jpg',
				'http://localhost:8000/img/8_400.webp',
				'http://localhost:8000/img/8.jpg',
				'http://localhost:8000/img/8.webp',
				'http://localhost:8000/img/9_400.jpg',
				'http://localhost:8000/img/9_400.webp',
				'http://localhost:8000/img/9.jpg',
				'http://localhost:8000/img/9.webp',
				'http://localhost:8000/img/10_400.jpg',
				'http://localhost:8000/img/10_400.webp',
				'http://localhost:8000/img/10.jpg',
				'http://localhost:8000/img/10.webp',
				'http://localhost:8000/img/food.png',
				'http://localhost:8000/img/restaurant-icon-4.png'
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
				return res;
			} else {
				return fetch(e.request);
			}
		})
	)
});