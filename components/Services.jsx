'use client';
import { useRef, useState, useEffect, useCallback } from 'react'
import { useLang } from '@/context/LangContext'
import ar from '@/i18n/ar'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'
import { MeshGradient } from '@paper-design/shaders-react'
import { SparklesCore } from './ui/sparkles'

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Maps each service to a frame folder + representative JPEG range for a looping preview
// We'll use a <video> element per card but since we only have JPEG frames,
// we use the existing mp4 for sea/air/road/project and a fallback poster otherwise.
// We reference frames as poster images for cards without dedicated video.
const services = [
  {
    num: '01', title: 'Air Freight',
    desc: 'Time-critical global air cargo with priority handling and real-time tracking. Express and charter options available.',
    subServices: [
      'General Cargo Consolidation',
      'Express & Time-Critical Air Freight',
      'Peak Season Capacity Solutions',
      'Temperature-Controlled Shipments',
      'Sea–Air & Air–Sea Solutions',
      'Air Charter Services',
      'Oversized Cargo Handling',
      'Dangerous Goods (DGR) Handling',
      'AOG Cargo Handling',
    ],
    icon: (<svg viewBox="0 0 48 48" fill="none" stroke="#5BC2E7" strokeWidth="1.3" className="w-10 h-10"><path d="M6 24L42 12L30 36L22 28L6 24Z" strokeLinejoin="round" /><path d="M22 28L24 42" strokeLinecap="round" /></svg>),
    span: 'md:col-span-2',
    videoBg: '/air-cargo.mp4',
  },
  {
    num: '02', title: 'Sea Freight',
    desc: 'FCL and LCL ocean freight worldwide. Deep expertise in GCC port operations and customs clearance.',
    subServices: [
      'Containerized Freight (FCL & LCL)',
      'Break Bulk Services',
      'Consolidation of Cargo',
      'Reefer Cargo Shipping for Perishable Goods',
      'Dangerous Goods Handling (DG)',
      'Out Of Gauge (OOG) & Heavy Lift Cargo Handling',
    ],
    icon: (<svg viewBox="0 0 48 48" fill="none" stroke="#5BC2E7" strokeWidth="1.3" className="w-10 h-10"><path d="M8 30L12 18H36L40 30" strokeLinejoin="round" /><path d="M4 34C8 30 12 38 16 34C20 30 24 38 28 34C32 30 36 38 40 34" strokeLinecap="round" /><rect x="20" y="10" width="8" height="8" rx="0.5" /></svg>),
    span: 'md:col-span-1',
    videoPoster: null,
    videoFrames: { folder: 'frames2', count: 289 },
  },
  {
    num: '03', title: 'Land Freight',
    desc: 'End-to-end FTL & LTL transport with seamless local and cross-border trucking across GCC & key trade corridors.',
    subServices: [
      'End-to-End FTL & LTL Transport Solutions',
      'Seamless Local & Cross-Border Trucking across GCC',
      'Specialized Handling of Oversized Cargo',
      'Advanced Fleet: Low Bed, Flatbed & Hydraulic Trailers',
      'Engineered Transport for Heavy & Critical Loads',
      'Full Shipment Visibility & Absolute Pricing Transparency',
      'Optimized Routes for Speed, Safety & Cost Efficiency',
    ],
    icon: (<svg viewBox="0 0 48 48" fill="none" stroke="#5BC2E7" strokeWidth="1.3" className="w-10 h-10"><rect x="4" y="18" width="28" height="16" rx="1" /><path d="M32 24H40L44 30V34H32V24Z" /><circle cx="12" cy="36" r="4" /><circle cx="36" cy="36" r="4" /></svg>),
    span: 'md:col-span-1',
    videoPoster: null,
    videoFrames: null,
    truckBg: null,
  },
  {
    num: '04', title: 'Customs Clearance',
    desc: 'ZATCA-certified customs brokerage. Seamless import/export documentation and full regulatory compliance.',
    subServices: [
      'Import & Export Customs Clearance',
      'Duty & Tax Calculation and Payment Handling',
      'Preparation & Submission of Customs Documentation',
      'Coordination with Customs Authorities & Government Agencies',
      'Secure Warehousing & Storage Awaiting Clearance',
      'Door Delivery Services After Clearance',
      'Full Adherence to Saudi Customs Regulations',
      'Minimized Delays & Cost Optimization',
      'End-to-End Customs Solutions Under One Roof',
    ],
    icon: (<svg viewBox="0 0 48 48" fill="none" stroke="#5BC2E7" strokeWidth="1.3" className="w-10 h-10"><rect x="10" y="6" width="28" height="36" rx="2" /><path d="M16 16H32M16 22H32M16 28H26" strokeLinecap="round" /><circle cx="34" cy="34" r="7" fill="#091524" strokeWidth="1.5" /><path d="M30 34L33 37L38 31" strokeLinecap="round" strokeLinejoin="round" /></svg>),
    span: 'md:col-span-2',
    videoPoster: null,
    videoFrames: { folder: 'frames4', count: 32 },
  },
  {
    num: '05', title: 'Warehousing',
    desc: 'Strategically located bonded warehouses across Saudi Arabia with advanced inventory management systems.',
    subServices: [
      'Inventory Management',
      'Order Management',
      'Cross-Dock Solutions',
      'Commodity Storage',
      'Pop-Up Warehousing',
      'Bonded Warehousing',
      'Storage in Free Trade Zones',
    ],
    icon: (<svg viewBox="0 0 48 48" fill="none" stroke="#5BC2E7" strokeWidth="1.3" className="w-10 h-10"><path d="M4 20L24 8L44 20V42H4V20Z" /><rect x="18" y="28" width="12" height="14" rx="0.5" /><rect x="8" y="24" width="8" height="8" rx="0.5" /><rect x="32" y="24" width="8" height="8" rx="0.5" /></svg>),
    span: 'md:col-span-2',
    truckBg: null,
  },
  {
    num: '06', title: 'Heavy Lift & Project Logistics',
    desc: 'Heavy-lift and out-of-gauge logistics. From oil & gas equipment to industrial machinery.',
    subServices: [
      'Heavy Lift / ODC / OOG Transportation — Conventional Hydraulic Axles for wind turbines, transformers, generators, industrial machinery & large project cargo',
      'Route Survey & Feasibility Study — Physical inspection and analysis of the full transportation route',
      'Route Modification for ODC Transportation — Removal of obstacles: traffic signals, guardrails, overhead cables & bypass construction',
      'Onsite Jacking & Skidding — Lift heavy equipment and horizontally move cargo along skid beams',
      'Technical Engineering Solutions — Lift plans, load distribution calculations & structural analysis',
    ],
    icon: (<svg viewBox="0 0 48 48" fill="none" stroke="#5BC2E7" strokeWidth="1.3" className="w-10 h-10"><path d="M6 36L16 20L28 28L38 12" strokeLinecap="round" strokeLinejoin="round" /><path d="M32 12H38V18" strokeLinecap="round" strokeLinejoin="round" /><circle cx="8" cy="40" r="3" /><circle cx="24" cy="40" r="3" /><circle cx="40" cy="40" r="3" /></svg>),
    span: 'md:col-span-1',
    truckBg: null,
  },
]

// Animates JPEG frames on a canvas — lightweight, no video file needed
function FrameCanvas({ folder, count, active }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const frameRef = useRef(0)
  const imagesRef = useRef(null) // null = not yet loaded

  const ensureLoaded = useCallback(() => {
    if (imagesRef.current) return
    const imgs = []
    const step = Math.max(1, Math.floor(count / 36)) // cap at ~36 frames
    for (let i = 1; i <= count; i += step) {
      const img = new Image()
      img.src = `/${folder}/${String(i).padStart(4, '0')}.jpg`
      imgs.push(img)
    }
    imagesRef.current = imgs
  }, [folder, count])

  useEffect(() => {
    if (active) {
      ensureLoaded()
      let lastTime = 0
      const FPS = 18
      const interval = 1000 / FPS
      const tick = (time) => {
        rafRef.current = requestAnimationFrame(tick)
        if (time - lastTime < interval) return
        lastTime = time
        const canvas = canvasRef.current
        const imgs = imagesRef.current
        if (!canvas || !imgs || imgs.length === 0) return
        const img = imgs[frameRef.current % imgs.length]
        if (!img.complete) return
        const ctx = canvas.getContext('2d')
        canvas.width = canvas.offsetWidth
        canvas.height = canvas.offsetHeight
        const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight)
        const w = img.naturalWidth * scale
        const h = img.naturalHeight * scale
        ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h)
        frameRef.current++
      }
      rafRef.current = requestAnimationFrame(tick)
    } else {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    }
    return () => { if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null } }
  }, [active, ensureLoaded])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        opacity: active ? 1 : 0,
        transition: 'opacity 0.55s ease',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}

export default function Services() {
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px 0px" })
  const [hoveredCard, setHoveredCard] = useState(null)
  const [expandedCard, setExpandedCard] = useState(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: isMobile ? 0.08 : 0.15,
      }
    }
  }

  const itemVariants = {
    hidden: (i) => ({
      opacity: 0,
      y: isMobile ? 30 : [100, 150, 80, 120, 90, 140][i % 6],
      x: isMobile ? 0 : [-80, 100, -60, 80, -90, 70][i % 6],
      rotate: isMobile ? 0 : [-14, 12, -8, 15, -18, 10][i % 6],
      scale: isMobile ? 1 : 0.8
    }),
    show: {
      opacity: 1,
      x: 0, y: 0, rotate: 0, scale: 1,
      transition: {
        type: "spring", stiffness: isMobile ? 100 : 70, damping: 14, mass: 1
      }
    }
  }

  return (
    <section ref={sectionRef} id="services" className="relative pt-6 pb-16 md:pt-10 md:pb-24 lg:pt-14 lg:pb-32 px-4 md:px-10 lg:px-20" style={{ background: 'transparent', minHeight: '100vh' }}>
      <SparklesCore background="transparent" minSize={0.6} maxSize={2} particleDensity={isMobile ? 30 : 60} particleColor="rgba(91,194,231,0.9)" speed={0.8} className="absolute inset-0 w-full h-full pointer-events-none" />
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(91,194,231,0.07) 0%, transparent 60%)' }} />

      <div className="max-w-5xl mx-auto">

        {/* ── Unified card ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          style={{
            background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 50%, rgba(91,194,231,0.02) 100%)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(91,194,231,0.28)',
            borderTop: '1px solid rgba(91,194,231,0.55)',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(91,194,231,0.06) inset, inset 0 1px 0 rgba(91,194,231,0.22), 0 0 50px rgba(91,194,231,0.06)',
            position: 'relative',
          }}
        >


          {/* ── Centered heading block ── */}
          <div style={{ textAlign: 'center', padding: 'clamp(2.5rem,5vw,4rem) clamp(1.5rem,5vw,4rem) clamp(1.5rem,3vw,2.5rem)', borderBottom: '1px solid rgba(91,194,231,0.1)', position: 'relative', zIndex: 2 }}>
            <div style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 'clamp(13px,1.4vw,16px)',
              letterSpacing: '0.45em', textTransform: 'uppercase',
              color: 'rgba(91,194,231,1)',
              textShadow: '0 0 20px rgba(91,194,231,0.5)',
              fontWeight: 700,
              marginBottom: '0.8rem',
            }}>
              {isAr ? ar.services.eyebrow : 'What We Offer'}
            </div>
            <motion.h2
              className="no-reveal"
              initial={{ x: -70, opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
              animate={isInView ? { x: 0, opacity: 1, clipPath: 'inset(0 0% 0 0)' } : {}}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              style={{
                fontFamily: "var(--font-bebas), sans-serif",
                fontSize: 'clamp(3rem,7vw,6rem)',
                letterSpacing: '0.07em', lineHeight: 1,
                margin: 0,
              color: '#ffffff',
              filter: 'drop-shadow(0 0 30px rgba(91,194,231,0.3))',
              }}
            >
              {isAr ? (
                <span style={{ color: '#5BC2E7' }}>{ar.services.headline[0]}</span>
              ) : (
                <><span style={{ color: '#ffffff' }}>OUR </span><span style={{ color: '#5BC2E7' }}>SERVICES</span></>
              )}
            </motion.h2>
            <div style={{ width: 60, height: 2, margin: '1.4rem auto 0', background: 'linear-gradient(90deg, transparent, rgba(91,194,231,0.7), transparent)' }} />
          </div>

          {/* ── Services grid inside the card ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'show' : 'hidden'}
            className="services-grid"
            style={{
              position: 'relative', zIndex: 2,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))',
              gap: 0,
            }}
          >
            {services.map((s, i) => {
              const isActive = hoveredCard === s.num
              const isExpanded = expandedCard === s.num
              const hasExpand = s.subServices && s.subServices.length > 0
              const arItem = ar.services.items[i]
              return (
              <motion.div
                key={s.num}
                custom={i}
                variants={itemVariants}
                onHoverStart={() => setHoveredCard(s.num)}
                onHoverEnd={() => setHoveredCard(null)}
                style={{
                  position: 'relative', overflow: 'hidden',
                  padding: 'clamp(1.6rem,3vw,2.4rem)',
                  borderRight: (i % 3 !== 2) ? '1px solid rgba(91,194,231,0.08)' : 'none',
                  borderBottom: (i < 3) ? '1px solid rgba(91,194,231,0.08)' : 'none',
                  cursor: 'default',
                  transition: 'background 0.3s ease',
                  background: isExpanded ? 'rgba(91,194,231,0.06)' : isActive ? 'rgba(91,194,231,0.04)' : 'transparent',
                }}
              >
                {/* Subtle gold hover glow */}
                <div style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(91,194,231,0.06) 0%, transparent 70%)',
                  opacity: isActive || isExpanded ? 1 : 0,
                  transition: 'opacity 0.5s ease',
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                  {/* Icon */}
                  <div style={{
                    marginBottom: '1rem',
                    transition: 'transform 0.4s ease',
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  }}>
                    {s.icon}
                  </div>
                  {/* Title row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <div>
                      {s.eyebrow && (
                        <div style={{
                          fontFamily: isAr ? "var(--font-cairo), sans-serif" : "var(--font-dm-sans), sans-serif",
                          fontSize: 'clamp(10px,1vw,12px)',
                          letterSpacing: isAr ? '0' : '0.2em',
                          textTransform: 'uppercase',
                          color: 'rgba(91,194,231,0.85)',
                          fontWeight: 700,
                          marginBottom: '2px'
                        }}>
                          {isAr && arItem?.eyebrow ? arItem.eyebrow : s.eyebrow}
                        </div>
                      )}
                      <h3 style={{
                        fontFamily: isAr ? "var(--font-cairo), sans-serif" : "var(--font-bebas), sans-serif",
                        fontSize: isAr ? 'clamp(1.225rem,2vw,1.525rem)' : 'clamp(1.3rem,2.2vw,1.7rem)',
                        letterSpacing: isAr ? '0' : '0.08em', lineHeight: 1.1,
                        color: isExpanded ? 'rgba(91,194,231,1)' : isActive ? 'rgba(91,194,231,1)' : '#ffffff',
                        margin: 0,
                        marginTop: s.eyebrow ? '0' : '8px', 
                        transition: 'color 0.3s ease',
                      }}>
                        {isAr && arItem ? arItem.title : s.title}
                      </h3>
                    </div>
                    {hasExpand && (
                      <button
                        onClick={() => setExpandedCard(isExpanded ? null : s.num)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '5px',
                          background: isExpanded ? 'rgba(91,194,231,0.18)' : 'rgba(91,194,231,0.08)',
                          border: '1px solid rgba(91,194,231,0.35)',
                          borderRadius: '4px',
                          padding: '10px 16px',
                          cursor: 'pointer',
                          flexShrink: 0,
                          transition: 'all 0.25s ease',
                          minHeight: 44,
                        }}
                      >
                        <span style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: '13px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(91,194,231,0.9)' }}>
                          {isExpanded ? (isAr ? ar.services.viewLess : 'Less') : (isAr ? ar.services.viewMore : 'More')}
                        </span>
                        <motion.svg
                          width="10" height="10" viewBox="0 0 10 10" fill="none"
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <path d="M2 3.5L5 6.5L8 3.5" stroke="rgba(91,194,231,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </motion.svg>
                      </button>
                    )}
                  </div>
                  {/* Expandable sub-services */}
                  <AnimatePresence>
                    {isExpanded && hasExpand && (
                      <motion.div
                        key="sub"
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{
                          borderTop: '1px solid rgba(91,194,231,0.15)',
                          paddingTop: '0.9rem',
                          display: 'flex', flexDirection: 'column', gap: '0',
                        }}>
                          {(isAr && arItem?.subServices ? arItem.subServices : s.subServices).map((item, idx) => (
                            <motion.div
                              key={item}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.04, duration: 0.25 }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '6px 0',
                                borderBottom: idx < s.subServices.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                              }}
                            >
                              <div style={{
                                width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0,
                                background: 'rgba(91,194,231,0.7)',
                                boxShadow: '0 0 6px rgba(91,194,231,0.4)',
                              }} />
                              <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                {item.includes(' — ') ? (
                                  <>
                                    <span style={{
                                      fontFamily: "var(--font-bebas), sans-serif",
                                      fontSize: 'clamp(17px,1.7vw,20px)',
                                      letterSpacing: '0.06em',
                                      color: '#5BC2E7',
                                      lineHeight: 1.2,
                                    }}>{item.split(' — ')[0]}</span>
                                    <span style={{
                                      fontFamily: "var(--font-dm-sans), sans-serif",
                                      fontSize: 'clamp(13px,1.3vw,15px)',
                                      fontWeight: 450,
                                      color: 'rgba(255,255,255,0.72)',
                                      lineHeight: 1.7,
                                    }}>{item.split(' — ').slice(1).join(' — ')}</span>
                                  </>
                                ) : (
                                  <span style={{
                                    fontFamily: "var(--font-dm-sans), sans-serif",
                                    fontSize: 'clamp(13px,1.3vw,15px)',
                                    fontWeight: 450,
                                    color: 'rgba(255,255,255,0.72)',
                                    lineHeight: 1.7,
                                  }}>{item}</span>
                                )}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
              )
            })}
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        @keyframes headingSweep {
          0%   { background-position: -100% center; }
          100% { background-position: 200% center; }
        }
        @media (max-width: 600px) {
          #services .services-grid > div {
            border-right: none !important;
            border-bottom: 1px solid rgba(91,194,231,0.08) !important;
            min-height: 160px !important;
          }
          #services .services-grid > div:last-child {
            border-bottom: none !important;
          }
          #services .services-grid > div {
            padding: 1.4rem 1.2rem !important;
          }
        }
      `}</style>
    </section>
  )
}
