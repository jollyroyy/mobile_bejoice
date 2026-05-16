'use client';
import { useEffect, useRef, useState } from 'react'
import { useLang } from '@/context/LangContext'

function CountUp({ target, suffix = '', duration = 800 }) {
  const isNumeric = /^\d+(\.\d+)?$/.test(String(target).trim())
  const [display, setDisplay] = useState(isNumeric ? '0' : target)
  const hasRun = useRef(false)
  const elRef = useRef(null)

  useEffect(() => {
    if (!isNumeric) return
    const el = elRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasRun.current) {
        hasRun.current = true
        const end = parseFloat(target)
        const start = performance.now()
        const tick = (now) => {
          const t = Math.min((now - start) / duration, 1)
          const ease = 1 - Math.pow(1 - t, 3)
          setDisplay(Math.round(ease * end) + suffix)
          if (t < 1) requestAnimationFrame(tick)
          else setDisplay(end + suffix)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [target, suffix, duration])

  return <span ref={elRef}>{display}</span>
}

const STATS = [
  { v: '1500', suffix: '+', l: 'Heavy Lift & Project Shipments' },
  { v: '120',  suffix: '+', l: 'Countries Served' },
  { v: '25',   suffix: '+', l: 'Years Logistics Experience' },
  { v: '24/7', suffix: '',  l: 'Operations Support' },
  { v: 'KSA',  suffix: '',  l: 'Regional Specialist · FIATA' },
]

export default function StatsBar() {
  const { lang } = useLang()
  const isAr = lang === 'ar'
  return (
    <section style={{
      background: 'linear-gradient(90deg, #07090f 0%, #0d1220 50%, #07090f 100%)',
      borderTop: '1px solid rgba(91,194,231,0.18)',
      borderBottom: '1px solid rgba(91,194,231,0.18)',
      padding: 'clamp(40px, 6vw, 72px) clamp(1.5rem, 8vw, 8rem)',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`@media (max-width: 767px) { .stats-inner { flex-direction: column !important; align-items: center !important; gap: 28px !important; } .stats-inner > div { width: auto !important; flex-direction: column !important; align-items: center !important; } .stats-divider { display: none !important; } }`}</style>
      {/* Subtle gold glow top-center */}
      <div style={{
        position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '200px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(91,194,231,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="stats-inner" style={{
        maxWidth: '1100px', margin: '0 auto',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap',
        gap: 'clamp(32px, 4vw, 0px)',
        position: 'relative', zIndex: 1,
      }}>
        {STATS.map((s, i) => (
          <div key={s.l} style={{ display: 'flex', alignItems: 'center', gap: '0', flex: '0 0 auto' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 'clamp(2.6rem, 4vw, 3.8rem)',
                letterSpacing: '0.04em', lineHeight: 1,
                color: '#8DD8F0',
                textShadow: '0 0 24px rgba(255,214,0,0.55), 0 2px 10px rgba(0,0,0,0.8)',
              }}>
                <CountUp target={s.v} suffix={s.suffix} duration={800} />
              </div>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: isAr ? 'clamp(12px, 1.4vw, 17px)' : 'clamp(12px, 1.4vw, 15px)',
                letterSpacing: '0.18em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,1)', fontWeight: 700,
                marginTop: '6px',
              }}>{s.l}</div>
            </div>
            {/* Divider between stats */}
            {i < STATS.length - 1 && (
              <div className="stats-divider" style={{
                width: '1px', height: '52px', flexShrink: 0,
                background: 'linear-gradient(180deg, transparent, rgba(91,194,231,0.35), transparent)',
                margin: '0 clamp(20px, 3vw, 48px)',
              }} />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
