const CACHE_NAME = 'study-app-shell-v0.46.4';
const APP_SHELL = [
  '/',
  '/index.html',
  '/style.css?v=0.46.4',
  '/reorder-grading.js?v=0.46.4',
  '/app.js?v=0.46.4',
  '/exam-scope.js?v=0.46.4',
  '/manifest.webmanifest',
  '/data/curriculum.js?v=0.46.4',
  '/data/questions.js?v=0.46.4',
  '/data/question-supplement-v0449.js?v=0.46.4',
  '/data/question-supplement-v0450.js?v=0.46.4',
  '/data/question-supplement-v0451.js?v=0.46.4',
  '/data/question-supplement-v0452.js?v=0.46.4',
  '/data/question-supplement-v0453.js?v=0.46.4',
  '/data/question-supplement-v0454.js?v=0.46.4',
  '/data/question-supplement-v0455.js?v=0.46.4',
  '/data/question-supplement-v0456.js?v=0.46.4',
  '/data/question-supplement-v0457.js?v=0.46.4',
  '/data/question-supplement-v0458.js?v=0.46.4',
  '/data/question-supplement-v0459.js?v=0.46.4',
  '/data/question-supplement-v0460.js?v=0.46.4',
  '/data/question-supplement-v0461.js?v=0.46.4',
  '/data/question-supplement-v0464.js?v=0.46.4',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put('/index.html', copy));
        return res;
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, copy));
      }
      return res;
    }))
  );
});
