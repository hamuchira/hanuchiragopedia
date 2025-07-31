const CACHE_NAME = 'hamuchira-pedia-v1';
const urlsToCache = [
  './',
  './index.html',
  './hamuchira_terms.csv',
  './hamuchira_footer.jpg',
  './icon-192.png',
  './icon-512.png'
];

// Service Worker インストール時
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('キャッシュを開きました');
        return cache.addAll(urlsToCache);
      })
  );
});

// リクエスト時のキャッシュ戦略
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // キャッシュがあれば返す、なければネットワークから取得
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Service Worker更新時
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('古いキャッシュを削除:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});