'use client';
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '@/context/LangContext'
import ar from '@/i18n/ar'

const routes = [
  { from: 'RIYADH', to: 'SHANGHAI', type: 'Air · 8h', active: true },
  { from: 'JEDDAH', to: 'ROTTERDAM', type: 'Sea · 22d', active: false },
  { from: 'DAMMAM', to: 'DUBAI', type: 'Road · 6h', active: false },
  { from: 'RIYADH', to: 'FRANKFURT', type: 'Air · 7h', active: false },
  { from: 'JEDDAH', to: 'NEW YORK', type: 'Air · 14h', active: false },
  { from: 'DAMMAM', to: 'MUMBAI', type: 'Sea · 8d', active: false },
]

const markets = [
  { name: 'Saudi Arabia', role: 'Primary Hub', detail: 'ZATCA · Heavy Lift Specialist', x: '55%', y: '48%' },
  { name: 'UAE', role: 'Regional Gateway', detail: 'Jebel Ali FCZ · DXB Hub', x: '60%', y: '52%' },
  { name: 'China', role: 'Origin Market', detail: 'Shanghai · Shenzhen · Ningbo', x: '80%', y: '36%' },
  { name: 'Europe', role: 'Destination Hub', detail: 'Rotterdam · Hamburg · Antwerp', x: '42%', y: '28%' },
  { name: 'USA', role: 'Trade Lane', detail: 'JFK · LAX · Houston', x: '16%', y: '40%' },
]

export default function KeyMarkets() {
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.fade-up').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 80)
            })
          }
        })
      },
      { threshold: 0.05 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="markets" ref={sectionRef} className="relative pt-6 pb-16 md:pt-10 md:pb-24 lg:pt-14 lg:pb-32 px-6 md:px-12 lg:px-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 20% 80%, rgba(91,194,231,0.05) 0%, transparent 55%)'
      }} />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px 0px" }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="mb-20 flex flex-col items-end"
        >
          <div className="section-glass-header" style={{ textAlign: 'right' }}>
            <div className="section-num mb-4" style={{ textAlign: 'right' }}>{isAr ? ar.keyMarkets.sectionNum : '03 — Key Markets'}</div>
            <h2 className="section-headline" style={{ textAlign: 'right' }}>
              <span style={{ color: '#ffffff' }}>{isAr ? ar.keyMarkets.headLineWhite : 'GLOBAL'}</span><br />
              <span style={{ color: 'rgba(91,194,231,0.78)' }}>{isAr ? ar.keyMarkets.headLineCyan : 'REACH'}</span>
            </h2>
            <p className="font-body max-w-xs" style={{ color: 'rgba(255,255,255,0.92)', fontSize: isAr ? '21px' : '17px', fontWeight: 500, lineHeight: 1.75, marginTop: '1.2rem', textAlign: isAr ? 'right' : 'left' }}>
              {isAr ? ar.keyMarkets.body : "Strategic footprint across the world's most critical trade lanes, with deep roots in Saudi Arabia."}
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Map area */}
          <div className="lg:col-span-3">
            <div className="fade-up relative rounded-none border border-gold/10 overflow-hidden" style={{ aspectRatio: '16/9' }}>
              {/* SVG World map (simplified) */}
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(135deg, rgba(13,13,20,1) 0%, rgba(7,16,28,1) 100%)'
              }} />

              {/* Grid lines */}
              <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 56" preserveAspectRatio="none">
                {/* Latitude lines */}
                {[10,20,30,40,50].map(y => (
                  <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#5BC2E7" strokeWidth="0.1"/>
                ))}
                {/* Longitude lines */}
                {[10,20,30,40,50,60,70,80,90].map(x => (
                  <line key={x} x1={x} y1="0" x2={x} y2="56" stroke="#5BC2E7" strokeWidth="0.1"/>
                ))}
                {/* Route arcs */}
                <path d="M 55 48 Q 70 20 80 36" stroke="#5BC2E7" strokeWidth="0.3" fill="none" opacity="0.6" strokeDasharray="1 0.5"/>
                <path d="M 55 48 Q 48 30 42 28" stroke="#5BC2E7" strokeWidth="0.3" fill="none" opacity="0.6" strokeDasharray="1 0.5"/>
                <path d="M 55 48 Q 36 44 16 40" stroke="#5BC2E7" strokeWidth="0.3" fill="none" opacity="0.4" strokeDasharray="1 0.5"/>
                <path d="M 60 52 Q 60 35 60 52" stroke="#5BC2E7" strokeWidth="0.3" fill="none" opacity="0.4" strokeDasharray="1 0.5"/>
              </svg>

              {/* Market dots */}
              {markets.map((m) => (
                <div
                  key={m.name}
                  className="absolute group cursor-default"
                  tabIndex={0}
                  style={{ left: m.x, top: m.y, transform: 'translate(-50%,-50%)' }}
                >
                  {/* Pulse ring */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`rounded-full border border-gold/30 ${m.name === 'Saudi Arabia' ? 'w-8 h-8 animate-ping' : 'w-5 h-5'} opacity-50`} />
                  </div>

                  {/* Dot */}
                  <div className={`relative rounded-full border border-gold ${
                    m.name === 'Saudi Arabia' ? 'w-4 h-4 bg-gold' : 'w-2.5 h-2.5 bg-gold/40'
                  }`} />

                  {/* Tooltip — hover (desktop) + focus (touch via tabIndex) */}
                  <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none z-10 whitespace-nowrap">
                    <div className="glass-card px-3 py-2 border-gold/30">
                      <div className="font-display text-sm tracking-widest text-gold">{m.name}</div>
                      <div className="font-body text-[10px] text-cream/60 mt-0.5">{m.role}</div>
                    </div>
                  </div>

                  {/* Label (always visible for Saudi) */}
                  {m.name === 'Saudi Arabia' && (
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <div className="font-display text-xs tracking-widest text-gold">KSA</div>
                    </div>
                  )}
                </div>
              ))}

              {/* Corner labels */}
              <div className="absolute top-4 left-4 text-[10px] tracking-[0.3em] uppercase text-cream/20 font-body">{isAr ? ar.keyMarkets.worldCoverage : 'World Coverage'}</div>
              <div className="absolute bottom-4 right-4 text-[10px] tracking-[0.2em] text-cream/20 font-body"></div>
            </div>
          </div>

          {/* Routes list */}
          <div className="lg:col-span-2">
            <div className="fade-up mb-6">
              <div className="font-body text-[11px] tracking-[0.3em] uppercase text-gold/60 mb-4">{isAr ? ar.keyMarkets.tradeLabel : 'Active Trade Lanes'}</div>
            </div>
            <div className="space-y-px">
              {(isAr ? ar.keyMarkets.routes.map((r2, i) => ({ ...routes[i], ...r2 })) : routes).map((r, i) => (
                <div
                  key={i}
                  className="fade-up glass-card group px-5 py-4 flex items-center justify-between cursor-default"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${r.active ? 'bg-gold' : 'bg-cream/20'}`} />
                    <div>
                      <div className="font-display text-sm tracking-widest text-cream">
                        {r.from} <span className="text-gold/50">→</span> {r.to}
                      </div>
                      <div className="font-body text-[11px] text-cream/40 mt-0.5">{r.type}</div>
                    </div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className="text-gold/30 group-hover:text-gold transition-colors duration-300">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
