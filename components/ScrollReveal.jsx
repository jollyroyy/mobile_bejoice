'use client';
import { useEffect } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap'

/**
 * Animation map for data-animation attribute driven reveals.
 * Usage: <div data-animation="fade-left"> — no extra JS needed.
 *
 * Applied at mount time to elements already in the DOM (Nav, VideoHero
 * overlays, etc.). Lazy-loaded section components handle their own
 * .fade-up elements via useFadeUpBatch hook (see hooks/useFadeUpBatch.js).
 */
const animationMap = {
  'fade-up':    { opacity: 0, y: 60 },
  'fade-down':  { opacity: 0, y: -40 },
  'fade-left':  { opacity: 0, x: -60 },
  'fade-right': { opacity: 0, x: 60 },
  'scale-in':   { opacity: 0, scale: 0.88 },
}

export default function ScrollReveal() {
  useEffect(() => {
    // ── data-animation: IO + GSAP for any [data-animation] elements ──
    const dataEls = document.querySelectorAll('[data-animation]')
    if (dataEls.length) {
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          const type = entry.target.dataset.animation
          const fromVars = animationMap[type] || { opacity: 0, y: 40 }
          gsap.fromTo(
            entry.target,
            fromVars,
            { opacity: 1, y: 0, x: 0, scale: 1, duration: 0.9, ease: 'power3.out', clearProps: 'transform' }
          )
          sectionObserver.unobserve(entry.target)
        })
      }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' })

      dataEls.forEach(el => sectionObserver.observe(el))
    }

    // ── ScrollTrigger refresh after sections have loaded ──
    const r1 = setTimeout(() => ScrollTrigger.refresh(), 1000)
    const r2 = setTimeout(() => ScrollTrigger.refresh(), 3000)
    return () => { clearTimeout(r1); clearTimeout(r2) }
  }, [])

  return null
}
