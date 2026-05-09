/**
 * Bejoice Service Worker
 *
 * Cache topology (innermost = fastest):
 *
 *   Browser SW Cache
 *     └─ Cache First  → /assets/*.js, /assets/*.css  (immutable hashed bundles)
 *     └─ Cache First  → /public images (logos, .webp, .avif)
 *     └─ Network First → HTML navigation              (always fresh shell)
 *     └─ Network Only  → S3 frames                    (too large; HTTP cache handles)
 *     └─ Network Only  → cal.com, flagcdn, googleapis  (third-party, don't cache)
 *
 * Versioning: bump CACHE_VERSION on every deploy that changes
 * the shell/assets you want users to re-download.
 * JS/CSS chunks self-version via content hash — no manual bump needed for those.
 */

const CACHE_VERSION  = 'v5'
const SHELL_CACHE    = `bejoice-shell-${CACHE_VERSION}`
const ASSETS_CACHE   = `bejoice-assets-${CACHE_VERSION}`

// Files pre-cached on install (the app shell — needed for offline)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/bejoice-logo-group.png',
  '/ai-assistant-female.png',
  '/hero-frame0.webp',
  '/favicon.svg',
]

// ── Helpers ──────────────────────────────────────────────────────────────────

const isHashedAsset  = url => /\/assets\/.+\.(js|css)$/.test(url.pathname)
const isLocalImage   = url => /\.(webp|avif|svg|png|jpg|ico)$/.test(url.pathname) && url.origin === self.location.origin
const isNavigation   = req => req.mode === 'navigate'
const isThirdParty   = url => ![self.location.origin].includes(url.origin)
const isS3Frame      = url => url.hostname.includes('s3.ap-southeast-2.amazonaws.com')

// ── Install — pre-cache the app shell ────────────────────────────────────────

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())  // activate immediately, don't wait for old SW to die
  )
})

// ── Activate — delete stale cache versions ───────────────────────────────────

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== SHELL_CACHE && key !== ASSETS_CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())  // take control of all open tabs immediately
  )
})

// ── Fetch — route to the right caching strategy ──────────────────────────────

self.addEventListener('fetch', event => {
  const { request } = event
  if (request.method !== 'GET') return  // only cache GET

  const url = new URL(request.url)

  // ── 1. S3 WebP frames — skip SW entirely ──────────────────────────────────
  // These are 100+ MB total. The browser's HTTP cache (controlled by S3 headers
  // + our CDN Cache-Control) handles them. Caching in SW would fill storage fast.
  if (isS3Frame(url)) return

  // ── 1b. Local BIC frames — skip SW ────────────────────────────────────────
  // 145 × 124KB = ~18MB. HTTP cache handles them via _headers Cache-Control.
  if (url.pathname.startsWith('/bic/')) return

  // ── 2. Third-party origins — skip SW ──────────────────────────────────────
  // Google Fonts, Cal.com, flagcdn, jsdelivr — they have their own caching.
  if (isThirdParty(url)) return

  // ── 3. HTML navigation — Network First, fallback to cached shell ──────────
  // Always tries to get fresh HTML from the network. If offline/slow, serves
  // the cached shell so the app still loads (SPA handles routing client-side).
  if (isNavigation(request)) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache the fresh HTML shell for offline use
          const clone = response.clone()
          caches.open(SHELL_CACHE).then(cache => cache.put(request, clone))
          return response
        })
        .catch(() =>
          caches.match('/index.html').then(cached => cached || caches.match('/'))
        )
    )
    return
  }

  // ── 4. Hashed JS/CSS bundles — Cache First (immutable) ────────────────────
  // Vite embeds a content hash in every bundle filename (e.g. index-Abc123.js).
  // If the file is in cache it's identical to what the server has — serve it.
  // New deploys produce new filenames so users never get stale code.
  if (isHashedAsset(url)) {
    event.respondWith(
      caches.open(ASSETS_CACHE).then(cache =>
        cache.match(request).then(cached => {
          if (cached) return cached
          return fetch(request).then(response => {
            // Only cache valid responses
            if (response.ok) cache.put(request, response.clone())
            return response
          })
        })
      )
    )
    return
  }

  // ── 5. Local images (logos, WebP assets in /public) — Stale While Revalidate
  // Serve from cache immediately for speed; refresh in background so next visit
  // gets the latest version (handles logo/image updates without cache bust).
  if (isLocalImage(url)) {
    event.respondWith(
      caches.open(ASSETS_CACHE).then(cache =>
        cache.match(request).then(cached => {
          const networkFetch = fetch(request).then(response => {
            if (response.ok) cache.put(request, response.clone())
            return response
          })
          // Return cached immediately; background-refresh for next visit
          return cached || networkFetch
        })
      )
    )
    return
  }

  // ── Default — let browser handle normally (no SW intervention) ────────────
})

// ── Message: force update from app code ──────────────────────────────────────
// Allows the app to trigger SW update check: navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' })
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})
