const CACHE_NAME = 'hamuchira-pedia-v1';
const urlsToCache = [
  './',
  './index.html'
  // CSVファイルやアイコンファイルは存在する場合のみキャッシュ
];

// Service Worker インストール時
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('キャッシュを開きました');
        return cache.addAll(urlsToCache).catch(function(error) {
          console.log('一部ファイルのキャッシュに失敗:', error);
          // エラーがあってもインストールを続行
        });
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
        return fetch(event.request).catch(function() {
          // ネットワークエラーの場合は何も返さない
          return new Response('', {status: 404});
        });
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