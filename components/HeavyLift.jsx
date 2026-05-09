'use client';
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '@/context/LangContext'
import ar from '@/i18n/ar'

const stats = [
  { val: '25+', label: 'Years Experience' },
  { val: '1,500+', label: 'Heavy Lifts' },
  { val: '180+', label: 'Countries' },
  { val: '100T+', label: 'Max Single Lift' },
]

const tags = [
  'Hydraulic Axle Transport',
  'OOG & ODC Cargo',
  'Route Survey & Modification',
  'Onsite Jacking & Skidding',
  'Customs Brokeraging',
  'Technical Engineering',
  'Lift Plans & Load Calc',
  'Wind Turbines & Transformers',
]

export default function HeavyLift() {
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting)
          e.target.querySelectorAll('.fade-up').forEach((el, i) =>
            setTimeout(() => el.classList.add('visible'), i * 60))
      }),
      { threshold: 0.06 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} style={{
      background: 'linear-gradient(135deg, #06080f 0%, #0a0e1a 45%, #060508 100%)',
      padding: 'clamp(40px, 8vw, 140px) clamp(1rem, 6vw, 8rem)',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background glows */}
      <div style={{
        position: 'absolute', top: '-5%', right: '5%',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(91,194,231,0.07) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', left: '-5%',
        width: '450px', height: '450px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(80,30,10,0.14) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.35,
        backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(91,194,231,0.025) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(91,194,231,0.025) 60px)',
      }} />

      {/* Diagonal accent line */}
      <div style={{
        position: 'absolute', top: 0, right: '30%',
        width: '1px', height: '100%',
        background: 'linear-gradient(180deg, transparent, rgba(91,194,231,0.10), transparent)',
        pointerEvents: 'none',
      }} />


      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Glass Header Block */}
        <div className="section-glass-header fade-up" style={{ marginBottom: 'clamp(24px, 5vw, 48px)' }}>

          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px', flexWrap: 'wrap' }}>
            <div style={{ width: 'clamp(32px,4.5vw,50px)', height: '1.5px', background: '#5BC2E7', flexShrink: 0 }} />
            <span style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(10px,1.2vw,13px)',
              letterSpacing: 'clamp(0.08em,0.35em,0.35em)', textTransform: 'uppercase',
              color: '#5BC2E7', fontWeight: 600, lineHeight: 1.5,
            }}>
              {isAr ? ar.heavyLift.eyebrow : 'Heavy Lift · ODC · OOG · Project Cargo'}
            </span>
          </div>

          {/* Main heading */}
          <motion.h2
            initial={{ x: -60, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-80px 0px' }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(2.8rem, 7vw, 6.5rem)',
              lineHeight: 0.92, letterSpacing: '0.06em',
              margin: '0',
              color: '#ffffff',
              textShadow: '0 2px 32px rgba(0,0,0,0.5)',
              cursor: 'default',
            }}
          >{isAr ? ar.heavyLift.headLine1 : 'WHEN THE LOAD'}</motion.h2>
          <motion.h2
            initial={{ x: -60, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-80px 0px' }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(2.8rem, 7vw, 6.5rem)',
              lineHeight: 0.92, letterSpacing: '0.06em',
              margin: '0 0 24px',
              color: '#5BC2E7',
              textShadow: '0 2px 40px rgba(91,194,231,0.3)',
              cursor: 'default',
            }}
          >{isAr ? ar.heavyLift.headLine2 : 'DEFIES LIMITS'}</motion.h2>

          {/* Gold divider */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ width: '80px', height: '2px', background: 'linear-gradient(90deg, #5BC2E7, rgba(91,194,231,0.2))', marginBottom: '24px', transformOrigin: 'left' }}
          />

          {/* Subheading */}
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: isAr ? 'clamp(21px, 2.6vw, 28px)' : 'clamp(17px, 2.2vw, 24px)',
            fontWeight: 600,
            color: '#ffffff',
            lineHeight: 1.5,
            maxWidth: '680px',
            marginBottom: '16px',
            textShadow: '0 1px 16px rgba(0,0,0,0.8)',
          }}>
            {isAr ? ar.heavyLift.subHeading : "Saudi Arabia's most demanding projects trust Bejoice to move what others won't touch."}
          </p>

          {/* Body */}
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(16px, 1.8vw, 19px)',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.88)',
            lineHeight: 1.85,
            maxWidth: '620px',
            margin: 0,
          }}>
            {isAr ? (
              <>{ar.heavyLift.body}{' '}<strong style={{ color: '#5BC2E7' }}>{ar.heavyLift.bodyBold}</strong>{ar.heavyLift.bodyEnd}</>
            ) : (
              <>From hydraulic axle convoys navigating KSA's most complex routes to precision onsite jacking,
              skidding, and technical engineering — we deliver the full spectrum of heavy lift and
              out-of-gauge logistics, backed by{' '}
              <strong style={{ color: '#5BC2E7' }}>25+ years of project cargo expertise</strong> and
              end-to-end customs clearance built for Saudi Arabia's regulatory environment.</>
            )}
          </p>
        </div>

        {/* ── Stats strip ── */}
        <div className="fade-up" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 0,
          marginBottom: 'clamp(24px,4vw,40px)',
          border: '1px solid rgba(91,194,231,0.18)',
          borderRadius: 12,
          overflow: 'hidden',
          background: 'rgba(91,194,231,0.03)',
        }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{

              padding: 'clamp(14px,2vw,22px) clamp(16px,2.5vw,28px)',
              borderRight: i < stats.length - 1 ? '1px solid rgba(91,194,231,0.12)' : 'none',
              textAlign: 'center',
            }}>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 'clamp(1.6rem,3.5vw,2.4rem)',
                letterSpacing: '0.04em', lineHeight: 1,
                color: '#5BC2E7',
                textShadow: '0 0 20px rgba(91,194,231,0.35)',
                marginBottom: 4,
              }}>{s.val}</div>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 'clamp(9px,1vw,11px)',
                letterSpacing: '0.18em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.45)', fontWeight: 600,
              }}>{isAr ? ar.heavyLift.statLabels[i] : s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Capability tags ── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {(isAr ? ar.heavyLift.tags : tags).map((tag, i) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ scale: 1.04, borderColor: 'rgba(91,194,231,0.6)', background: 'rgba(91,194,231,0.08)' }}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 'clamp(9px,1.1vw,12px)', letterSpacing: '0.15em',
                textTransform: 'uppercase', fontWeight: 600,
                color: 'rgba(91,194,231,1)',
                border: '1px solid rgba(91,194,231,0.28)',
                borderRadius: '3px',
                padding: 'clamp(5px,0.6vw,9px) clamp(11px,1.4vw,18px)',
                background: 'rgba(91,194,231,0.05)',
                cursor: 'default',
                transition: 'background 0.2s, border-color 0.2s',
                display: 'inline-block',
              }}
            >{tag}</motion.span>
          ))}
        </div>

      </div>
    </section>
  )
}
