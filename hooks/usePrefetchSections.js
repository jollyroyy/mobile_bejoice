'use client';
/**
 * usePrefetchSections
 *
 * Proactively warms all lazy-loaded component chunks so they're already
 * in the browser module cache by the time React's Suspense boundaries
 * are crossed. On fast connections this means skeletons are never shown.
 *
 * Strategy:
 *  1. Fire ALL imports() after the first user interaction (scroll / click /
 *     touch / key) — that's when the hero is visible and bandwidth is free.
 *  2. As a safety net, also fire after 2 s if no interaction has occurred
 *     (catches cases where user bounces without interacting).
 *  3. Individual IntersectionObserver watchers fire 500 px BEFORE each
 *     section enters the viewport — gives a second chance if interaction
 *     never triggered (e.g. user goes straight to a hash link).
 *
 * The import() calls are idempotent — Vite deduplicates them via its
 * module-registry, so calling the same import() twice is effectively free.
 */
import { useEffect } from 'react'

// All lazy chunks in load-priority order
const SECTION_IMPORTS = [
  () => import('@/components/WhyBejoice'),       // first section after hero — highest priority
  () => import('@/components/FloatingBookCTA'),  // chatbot — user might click fast
  () => import('@/components/Contact'),
  () => import('@/components/LogisticsTools'),
  () => import('@/components/Services'),
  () => import('@/components/Certifications'),
  () => import('@/components/Footer'),
  () => import('@/components/QuickQuoteModal'),  // opened via CTA
]

// IDs of lazy sections — used for IntersectionObserver fallback
const SECTION_IDS = ['contact', 'tools', 'services', 'certifications']

let globalPrefetched = false  // module-level guard — only run once per session

function prefetchAll() {
  if (globalPrefetched) return
  globalPrefetched = true
  // Stagger slightly to avoid saturating the network in one tick
  SECTION_IMPORTS.forEach((fn, i) => setTimeout(fn, i * 80))
}

export function usePrefetchSections() {
  useEffect(() => {
    // ── Trigger 1: first user interaction ───────────────────────────────────
    const EVENTS = ['scroll', 'mousemove', 'touchstart', 'keydown', 'click']
    function onInteraction() {
      prefetchAll()
      EVENTS.forEach(e => window.removeEventListener(e, onInteraction, true))
    }
    EVENTS.forEach(e => window.addEventListener(e, onInteraction, { passive: true, capture: true, once: true }))

    // ── Trigger 2: safety net after 2 s ─────────────────────────────────────
    const safetyTimer = setTimeout(prefetchAll, 2000)

    // ── Trigger 3: IntersectionObserver — 500 px before section enters view ─
    // This fires if the user jumps directly to a section (hash link, deep link)
    // before either of the above triggers ran.
    const observers = []
    if (typeof IntersectionObserver !== 'undefined') {
      SECTION_IDS.forEach(id => {
        const el = document.getElementById(id)
        if (!el) return
        const io = new IntersectionObserver(
          ([entry]) => { if (entry.isIntersecting) prefetchAll() },
          { rootMargin: '0px 0px -500px 0px', threshold: 0 }  // fires 500px early
        )
        io.observe(el)
        observers.push(io)
      })
    }

    return () => {
      EVENTS.forEach(e => window.removeEventListener(e, onInteraction, true))
      clearTimeout(safetyTimer)
      observers.forEach(io => io.disconnect())
    }
  }, [])
}
