// Service Worker - 주간 플래너 PWA
// 오프라인 지원 없이 PWA 설치 조건만 충족

const CACHE_NAME = 'weekly-planner-v1';

// 설치 이벤트
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  self.skipWaiting();
});

// 활성화 이벤트
self.addEventListener('activate', (event) => {
  console.log('[SW] Service worker activated');
  event.waitUntil(clients.claim());
});

// 네트워크 요청 처리 (오프라인 캐싱 없이 그대로 전달)
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
