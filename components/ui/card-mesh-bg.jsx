'use client';
import { useEffect, useRef, useState } from 'react'
import { MeshGradient } from '@paper-design/shaders-react'

// Dark-gold mesh gradient background for service cards
export function CardMeshBg({ opacity = 1 }) {
  const wrapRef = useRef(null)
  const [size, setSize] = useState({ width: 400, height: 320 })

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) setSize({ width: Math.round(width), height: Math.round(height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'absolute', inset: 0,
        overflow: 'hidden', pointerEvents: 'none',
        opacity, transition: 'opacity 0.6s ease',
        zIndex: 0,
      }}
    >
      <MeshGradient
        width={size.width}
        height={size.height}
        colors={['#0d0b18', '#1a1408', '#0a0d1a', '#1f1600', '#080610', '#150f04']}
        distortion={0.6}
        swirl={0.5}
        speed={0.18}
        offsetX={0.05}
        grainMixer={0}
        grainOverlay={0}
      />
    </div>
  )
}
