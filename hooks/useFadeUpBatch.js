'use client';
import { useEffect } from 'react'
import gsap from 'gsap'

/**
 * useFadeUpBatch — IO detection + GSAP batch stagger animation
 *
 * Replaces the old IO-on-section + setTimeout + classList pattern.
 * Each .fade-up element inside `containerRef` is individually observed.
 * Elements that enter the viewport in the same scroll event are collected
 * and animated together as a group (true batch stagger via GSAP RAF).
 *
 * Why this over setTimeout + CSS transition:
 *  - setTimeout is not RAF-synced → can stutter on busy frames
 *  - GSAP stagger is frame-perfect and respects Lenis smooth scroll
 *  - IO per-element fires for elements already partially visible on load
 */
export default function useFadeUpBatch(containerRef, { stagger = 0.09, duration = 0.65, y = 28, threshold = 0.1, rootMargin = '0px 0px -40px 0px' } = {}) {
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const els = Array.from(container.querySelectorAll('.fade-up'))
    if (!els.length) return

    // Set initial state via GSAP so it owns the transform (not CSS)
    gsap.set(els, { opacity: 0, y })

    // Batch: collect all elements entering in the same IO callback tick
    let batchTimer = null
    const pending = []

    const flush = () => {
      if (!pending.length) return
      const batch = pending.splice(0)
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        stagger,
        duration,
        ease: 'power2.out',
        onComplete() {
          // Mark as visible for CSS fallback compatibility
          batch.forEach(el => el.classList.add('visible'))
        },
      })
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        observer.unobserve(entry.target)
        pending.push(entry.target)
      })
      // Micro-batch: defer flush by one microtask so all entries in this
      // callback call are collected before animating
      clearTimeout(batchTimer)
      batchTimer = setTimeout(flush, 0)
    }, { threshold, rootMargin })

    els.forEach(el => observer.observe(el))

    return () => {
      observer.disconnect()
      clearTimeout(batchTimer)
    }
  }, [containerRef])  // eslint-disable-line react-hooks/exhaustive-deps
}
