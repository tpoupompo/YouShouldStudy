var cacheName = 'you-should-study-v1.0.9';
var filesToCache = ['./index.html'];

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            return cache.addAll(filesToCache);
        })
    );
    // 新しいSWをすぐに有効化
    self.skipWaiting();
});

self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                // 古いキャッシュを全部削除
                if (key !== cacheName) {
                    return caches.delete(key);
                }
            }));
        })
    );
    // 開いているページをすぐに新しいSWで制御
    self.clients.claim();
});

self.addEventListener('fetch', function(e) {
    e.respondWith(
        // キャッシュより常にネットワークを優先し、失敗時にキャッシュを使う
        fetch(e.request).then(function(response) {
            const clone = response.clone();
            caches.open(cacheName).then(function(cache) {
                cache.put(e.request, clone);
            });
            return response;
        }).catch(function() {
            return caches.match(e.request);
        })
    );
});