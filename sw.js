const CACHE_NAME = 'hamuchira-pedia-v2'; // バージョンアップ
const urlsToCache = [
  './',
  './index.html'
  // CSVファイルは動的なのでキャッシュしない
];

// Service Worker インストール時
self.addEventListener('install', function(event) {
  // 新しいService Workerを即座にアクティブに
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('キャッシュを開きました');
        return cache.addAll(urlsToCache).catch(function(error) {
          console.log('一部ファイルのキャッシュに失敗:', error);
        });
      })
  );
});

// リクエスト時のキャッシュ戦略
self.addEventListener('fetch', function(event) {
  const url = new URL(event.request.url);
  
  // CSVファイルは常にネットワークから最新を取得
  if (url.pathname.endsWith('.csv')) {
    event.respondWith(
      fetch(event.request).catch(function() {
        return new Response('', {status: 404});
      })
    );
    return;
  }
  
  // HTMLファイルもネットワーク優先（常に最新版をチェック）
  if (url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.endsWith('/')) {
    event.respondWith(
      fetch(event.request)
        .then(function(response) {
          // ネットワークから取得できた場合、キャッシュも更新
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(function() {
          // ネットワークエラーの場合のみキャッシュから返す
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // その他のファイル（画像など）は通常のキャッシュ戦略
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(function() {
          return new Response('', {status: 404});
        });
      }
    )
  );
});

// Service Worker更新時
self.addEventListener('activate', function(event) {
  // 新しいバージョンをすぐに有効化
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
    }).then(function() {
      // すべてのタブで新しいService Workerを有効化
      return self.clients.claim();
    })
  );
});