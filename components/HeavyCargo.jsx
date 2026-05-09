'use client';
import { useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { SparklesCore } from './ui/sparkles'
import { useLang } from '@/context/LangContext'
import ar from '@/i18n/ar'

const capabilities = [
  {
    num: '01',
    title: 'Heavy Lift / ODC / OOG Transportation',
    desc: 'Conventional Hydraulic Axles for transporting heavy equipment such as wind turbines, transformers, generators, industrial machinery, construction components, and large project cargo.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="#5BC2E7" strokeWidth="1.3" className="w-10 h-10">
        <rect x="2" y="28" width="36" height="10" rx="1" />
        <circle cx="10" cy="40" r="4" /><circle cx="20" cy="40" r="4" /><circle cx="30" cy="40" r="4" />
        <path d="M38 33h6v5h-6z" /><circle cx="41" cy="40" r="3" />
        <rect x="8" y="20" width="22" height="8" rx="1" strokeDasharray="2 1" />
        <path d="M12 20v-4M22 20v-6M30 20v-3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Route Survey Feasibility Study',
    desc: 'Detailed physical inspection and analysis of the entire transportation route from the pickup location to the final delivery site.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="#5BC2E7" strokeWidth="1.3" className="w-10 h-10">
        <path d="M24 4v6M24 38v6M4 24h6M38 24h6" strokeLinecap="round" />
        <circle cx="24" cy="24" r="10" />
        <path d="M24 14v10l7 4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 8l3 5M30 8l-3 5" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Route Modification for ODC Transportation',
    desc: 'Removal or adjustment of obstacles such as traffic signals, road signs, guardrails, overhead cables, streetlights, and bypass construction for safe transportation.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="#5BC2E7" strokeWidth="1.3" className="w-10 h-10">
        <path d="M8 40L24 10L40 40H8Z" strokeLinejoin="round" />
        <path d="M24 24v8M24 34v2" strokeLinecap="round" strokeWidth="2" />
        <path d="M4 44h40" strokeLinecap="round" opacity="0.4" />
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Custom Clearance & Brokeraging',
    desc: 'Expert handling of documentation and customs regulations to ensure smooth clearance and minimize transit delays across all KSA ports of entry.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="#5BC2E7" strokeWidth="1.3" className="w-10 h-10">
        <rect x="10" y="6" width="28" height="36" rx="2" />
        <path d="M16 16h16M16 22h16M16 28h10" strokeLinecap="round" />
        <circle cx="34" cy="34" r="7" fill="#091524" strokeWidth="1.5" />
        <path d="M30 34l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    num: '05',
    title: 'Onsite Jacking & Skidding',
    desc: 'Lift heavy equipment such as transformers and reactors, while skidding systems allow cargo to be horizontally moved along specially designed tracks or skid beams.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="#5BC2E7" strokeWidth="1.3" className="w-10 h-10">
        <rect x="6" y="30" width="36" height="6" rx="1" />
        <path d="M14 30V18h20v12" strokeLinejoin="round" />
        <path d="M18 18V12h12v6" strokeLinejoin="round" />
        <path d="M6 36h36M10 38v4M22 38v4M38 38v4" strokeLinecap="round" opacity="0.6" />
        <path d="M20 14h8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: '06',
    title: 'Technical Engineering Solutions',
    desc: 'Technical analysis and planning for lifting, loading, securing, and transporting heavy cargo safely — including lift plans, load distribution calculations, and structural analysis.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="#5BC2E7" strokeWidth="1.3" className="w-10 h-10">
        <rect x="4" y="10" width="40" height="28" rx="2" />
        <path d="M10 30l6-8 6 6 6-10 6 8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 20h40" opacity="0.3" />
        <circle cx="16" cy="22" r="1.5" fill="#5BC2E7" />
        <circle cx="28" cy="18" r="1.5" fill="#5BC2E7" />
        <circle cx="22" cy="28" r="1.5" fill="#5BC2E7" />
        <circle cx="34" cy="26" r="1.5" fill="#5BC2E7" />
      </svg>
    ),
  },
]

export default function HeavyCargo() {
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const cardsRef = useRef([])
  const gigaCardRef = useRef(null)
  const gigaGlowRef = useRef(null)

  const handleGigaMouseMove = useCallback((e) => {
    const card = gigaCardRef.current
    const glow = gigaGlowRef.current
    if (!card || !glow) return
    const rect = card.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * 100
    const py = ((e.clientY - rect.top) / rect.height) * 100
    glow.style.background = `radial-gradient(600px circle at ${px}% ${py}%, rgba(91,194,231,0.10) 0%, rgba(91,194,231,0.04) 30%, transparent 65%)`
    const rx = ((e.clientY - rect.top) / rect.height - 0.5) * 4
    const ry = ((e.clientX - rect.left) / rect.width - 0.5) * -4
    card.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg)`
  }, [])

  const handleGigaMouseLeave = useCallback(() => {
    if (gigaCardRef.current) gigaCardRef.current.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)'
    if (gigaGlowRef.current) gigaGlowRef.current.style.background = 'transparent'
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )
    cardsRef.current.forEach(el => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="heavy-cargo" className="relative pt-6 pb-16 md:pt-10 md:pb-24 lg:pt-14 lg:pb-32 px-6 md:px-12 lg:px-24">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(91,194,231,0.05) 0%, transparent 55%)' }} />

      <div className="max-w-7xl mx-auto">
        <div
          ref={gigaCardRef}
          onMouseMove={handleGigaMouseMove}
          onMouseLeave={handleGigaMouseLeave}
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.015) 50%, rgba(91,194,231,0.018) 100%)',
            backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(91,194,231,0.28)',
            borderTop: '1px solid rgba(91,194,231,0.55)',
            borderRadius: 28,
            boxShadow: '0 60px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(91,194,231,0.06) inset, inset 0 1px 0 rgba(91,194,231,0.22), 0 0 50px rgba(91,194,231,0.06)',
            overflow: 'hidden', position: 'relative',
            padding: 'clamp(24px,3.5vw,48px)',
            transition: 'transform 0.15s ease',
          }}>

          {/* Sparkles background */}
          <SparklesCore
            background="transparent"
            minSize={0.6}
            maxSize={2}
            particleDensity={60}
            particleColor="rgba(91,194,231,0.9)"
            speed={0.8}
            className="absolute inset-0 w-full h-full"
          />

          {/* Mouse-follow glow */}
          <div ref={gigaGlowRef} style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            borderRadius: 28, transition: 'background 0.1s ease', zIndex: 1,
          }} />

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px 0px" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="mb-10 md:mb-16 lg:mb-20 flex flex-col items-end"
            style={{ position: 'relative', zIndex: 1 }}
          >
            <div style={{
              width: '100%', padding: 0,
              textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
            }}>
              <motion.h2
                className="no-reveal"
                initial={{ x: -70, opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
                whileInView={{ x: 0, opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
                viewport={{ once: true, margin: '-80px 0px' }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 'clamp(3rem,7vw,6rem)',
                  letterSpacing: '0.07em', lineHeight: 1,
                  margin: 0,
                  color: '#ffffff',
                  filter: 'drop-shadow(0 0 30px rgba(91,194,231,0.3))',
                }}
              >
                {isAr ? (
                  <>{ar.heavyCargo.headLine}</>
                ) : (
                  <><span style={{ color: '#ffffff' }}>CONSULTING FOR</span><br /><span style={{ color: '#5BC2E7' }}>GIGA PROJECTS</span></>
                )}
              </motion.h2>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 'clamp(14px,1.6vw,17px)',
                color: 'rgba(255,255,255,0.7)',
                marginTop: '16px', marginBottom: 0, maxWidth: '520px', lineHeight: 1.7,
              }}>
                {isAr ? ar.heavyCargo.subHeading : "End-to-end project cargo logistics for Saudi Arabia's most ambitious giga-developments — from NEOM to the Red Sea Project."}
              </p>
              <style>{`
                @keyframes headingSweep {
                  0%   { background-position: -100% center; }
                  100% { background-position: 200% center; }
                }
              `}</style>
            </div>
          </motion.div>

          <div className="gold-line mb-20" />

          {/* Grid */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px"
            style={{ background: 'rgba(91,194,231,0.12)', perspective: '1200px', position: 'relative', zIndex: 1 }}
          >
            {capabilities.map((c, i) => (
              <motion.div key={c.num}
                ref={el => cardsRef.current[i] = el}
                className="fade-up p-6 md:p-8 lg:p-10 group cursor-default"
                style={{
                  background: '#000000',
                  borderTop: '1px solid rgba(91,194,231,0.1)',
                  transitionDelay: `${i * 75}ms`,
                }}
                whileHover={{
                  rotateY: i % 2 === 0 ? 3 : -3,
                  rotateX: -2,
                  z: 18,
                  transition: { type: 'spring', stiffness: 280, damping: 22 }
                }}
              >
                <div className="mb-6 transition-transform duration-300 group-hover:scale-110 origin-left">
                  {c.icon}
                </div>
                <h3 className="card-title mb-4">{isAr ? ar.heavyCargo.capabilities[i].title : c.title}</h3>
                <p className="card-body">{isAr ? ar.heavyCargo.capabilities[i].desc : c.desc}</p>
              </motion.div>
            ))}
          </div>

        </div>{/* end outer glass-card */}
      </div>
    </section>
  )
}
