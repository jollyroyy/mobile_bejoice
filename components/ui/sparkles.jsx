'use client';
import { useEffect, useRef } from 'react'

export const SparklesCore = ({
  className,
  particleDensity = 60,
  particleColor = 'rgba(91,194,231,0.9)',
  speed = 0.8,
}) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const baseColor = '91,194,231'
    const COUNT = Math.round(particleDensity * 0.65)
    const CONNECT_DIST = 160
    const BASE_SPEED = speed * 0.35

    let W, H, particles, raf, active = false

    function resize() {
      W = canvas.width = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
    }

    function makeParticle() {
      const angle = Math.random() * Math.PI * 2
      const spd = BASE_SPEED * (0.3 + Math.random() * 0.7)
      return {
        x: Math.random() * W, y: Math.random() * H,
        r: 1.8 + Math.random() * 2.8,
        vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
        wobbleFreq: 0.003 + Math.random() * 0.004,
        wobbleAmp: 0.15 + Math.random() * 0.15,
        phase: Math.random() * Math.PI * 2,
        opacity: 0.55 + Math.random() * 0.35,
      }
    }

    function init() {
      resize()
      particles = Array.from({ length: COUNT }, makeParticle)
    }

    let tick = 0
    function draw() {
      if (!active) return
      ctx.clearRect(0, 0, W, H)
      tick++

      for (const p of particles) {
        const wobble = Math.sin(tick * p.wobbleFreq + p.phase) * p.wobbleAmp
        p.x += p.vx + wobble
        p.y += p.vy + wobble
        if (p.x < -10) p.x = W + 10
        if (p.x > W + 10) p.x = -10
        if (p.y < -10) p.y = H + 10
        if (p.y > H + 10) p.y = -10
      }

      // batch all connecting lines into a single stroke call
      ctx.lineWidth = 1.4
      ctx.beginPath()
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECT_DIST) {
            const lineOpacity = (1 - dist / CONNECT_DIST) * 0.72
            ctx.strokeStyle = `rgba(${baseColor},${lineOpacity.toFixed(3)})`
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
          }
        }
      }
      ctx.stroke()

      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${baseColor},${p.opacity.toFixed(3)})`
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    init()

    // Only run RAF while canvas is visible — prevents GPU spike on mount
    // and stops consuming resources when scrolled away
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!active) { active = true; draw() }
        } else {
          active = false
          cancelAnimationFrame(raf)
        }
      },
      { rootMargin: '200px' }
    )
    io.observe(canvas)

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      W = canvas.width = Math.round(width)
      H = canvas.height = Math.round(height)
    })
    ro.observe(canvas)

    return () => {
      active = false
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
    }
  }, [particleDensity, speed])

  return (
    <canvas
      ref={canvasRef}
      className={className || ''}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  )
}
