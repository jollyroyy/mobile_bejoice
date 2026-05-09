'use client';
import { useRef } from 'react'
import { motion } from 'framer-motion'
import { SparklesCore } from './ui/sparkles'
import { useLang } from '@/context/LangContext'
import useFadeUpBatch from '@/hooks/useFadeUpBatch'

const certs = [
  { code: 'ZATCA',    ar: 'هيئة الزكاة والضريبة والجمارك',      color: '#2aaa5e' },
  { code: 'ISO 9001', ar: 'شهادة الآيزو 9001',  color: '#5BC2E7' },
  { code: 'FIATA',    ar: 'الاتحاد الدولي لوكلاء الشحن',      color: '#5a9de8' },
  { code: 'JC TRANS', ar: 'شبكة جي سي ترانس', color: '#e85a5a' },
  { code: 'GLA',      ar: 'تحالف اللوجستيات العالمي',  color: '#a05ae8' },
]

export default function Certifications() {
  const sectionRef = useRef(null)
  const { lang } = useLang()
  const isAr = lang === 'ar'

  useFadeUpBatch(sectionRef)

  return (
    <section id="certifications" ref={sectionRef} className="relative pt-6 pb-16 md:pt-10 md:pb-24 lg:pt-14 lg:pb-32 px-6 md:px-12 lg:px-24 overflow-hidden cv-section cv-certs" style={{ background: '#183650' }}>
      <SparklesCore background="transparent" minSize={0.6} maxSize={2} particleDensity={60} particleColor="rgba(91,194,231,0.9)" speed={0.8} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 60% 0%, rgba(91,194,231,0.07) 0%, transparent 50%)' }}/>
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 79px,rgba(91,194,231,0.02) 80px),repeating-linear-gradient(90deg,transparent,transparent 79px,rgba(91,194,231,0.02) 80px)',
      }}/>


      <div className="max-w-7xl mx-auto">

        {/* ── Single prestige card: heading + cert plates ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px 0px' }}
          transition={{ type: 'spring', stiffness: 90, damping: 22 }}
          style={{
            position: 'relative',
            background: 'linear-gradient(145deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.015) 50%, rgba(91,194,231,0.018) 100%)',
            backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(91,194,231,0.35)',
            borderTop: '1px solid rgba(91,194,231,0.65)',
            borderRadius: 28,
            overflow: 'hidden',
            boxShadow: [
              '0 60px 120px rgba(0,0,0,0.75)',
              '0 0 0 1px rgba(91,194,231,0.08) inset',
              'inset 0 1px 0 rgba(91,194,231,0.30)',
              '0 0 60px rgba(91,194,231,0.10)',
              '0 0 120px rgba(91,194,231,0.05)',
            ].join(', '),
          }}
        >

          {/* Animated top sweep */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, pointerEvents: 'none',
            background: 'linear-gradient(90deg, transparent 0%, rgba(91,194,231,0.6) 40%, rgba(91,194,231,0.8) 50%, rgba(91,194,231,0.6) 60%, transparent 100%)',
            animation: 'certHeaderSweep 4s ease-in-out infinite',
          }} />

          {/* Diagonal hatch texture */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.025,
            backgroundImage: 'repeating-linear-gradient(45deg, #5BC2E7 0px, #5BC2E7 1px, transparent 1px, transparent 12px)',
          }} />

          {/* Radial ambient glow */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 60% 80% at 30% 50%, rgba(91,194,231,0.06) 0%, transparent 70%)',
          }} />

          {/* Corner ornaments */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ position:'absolute', top:12, left:12, pointerEvents:'none' }}>
            <path d="M1 20 L1 1 L20 1" stroke="rgba(91,194,231,0.6)" strokeWidth="1.5" strokeLinecap="square"/>
            <path d="M1 28 L1 1 L28 1" stroke="rgba(91,194,231,0.18)" strokeWidth="1" strokeLinecap="square"/>
          </svg>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ position:'absolute', top:12, right:12, pointerEvents:'none', transform:'rotate(90deg)' }}>
            <path d="M1 20 L1 1 L20 1" stroke="rgba(91,194,231,0.6)" strokeWidth="1.5" strokeLinecap="square"/>
            <path d="M1 28 L1 1 L28 1" stroke="rgba(91,194,231,0.18)" strokeWidth="1" strokeLinecap="square"/>
          </svg>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ position:'absolute', bottom:12, left:12, pointerEvents:'none', transform:'rotate(270deg)' }}>
            <path d="M1 20 L1 1 L20 1" stroke="rgba(91,194,231,0.6)" strokeWidth="1.5" strokeLinecap="square"/>
            <path d="M1 28 L1 1 L28 1" stroke="rgba(91,194,231,0.18)" strokeWidth="1" strokeLinecap="square"/>
          </svg>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ position:'absolute', bottom:12, right:12, pointerEvents:'none', transform:'rotate(180deg)' }}>
            <path d="M1 20 L1 1 L20 1" stroke="rgba(91,194,231,0.6)" strokeWidth="1.5" strokeLinecap="square"/>
            <path d="M1 28 L1 1 L28 1" stroke="rgba(91,194,231,0.18)" strokeWidth="1" strokeLinecap="square"/>
          </svg>

          {/* ── Heading content ── */}
          <div style={{ position: 'relative', zIndex: 2, padding: 'clamp(2rem,4vw,3rem) clamp(2rem,5vw,4rem)', paddingBottom: 0 }}>
            {/* Eyebrow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div style={{ width: 40, height: '1.5px', background: '#5BC2E7' }} />
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, letterSpacing: '0.38em', textTransform: 'uppercase', color: 'rgba(91,194,231,0.85)', fontWeight: 700 }}>
                {lang === 'ar' ? 'الامتثال والجودة' : 'Industry Accreditations'}
              </span>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(91,194,231,0.25), transparent)' }} />
            </div>

            {/* Headline */}
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(3rem,7vw,6rem)', letterSpacing: '0.07em', lineHeight: 0.95, margin: 0 }}>
              <span style={{ color: '#ffffff', textShadow: '0 0 60px rgba(255,255,255,0.15), 0 2px 40px rgba(0,0,0,0.8)' }}>{lang === 'ar' ? 'معتمدون' : 'CERTIFIED'}</span>
              <br />
              <span style={{ color: '#5BC2E7', textShadow: '0 0 50px rgba(91,194,231,0.4), 0 2px 40px rgba(0,0,0,0.8)' }}>{lang === 'ar' ? 'للتسليم' : 'TO DELIVER'}</span>
            </h2>

            {/* Divider rule */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: 'clamp(1.5rem,3vw,2rem) 0 0' }}>
              <div style={{ width: 60, height: 2, background: 'linear-gradient(90deg, #5BC2E7, rgba(91,194,231,0.2))' }} />
              <div style={{ width: 6, height: 6, background: '#5BC2E7', opacity: 0.7, transform: 'rotate(45deg)', flexShrink: 0 }} />
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(91,194,231,0.15), transparent)' }} />
            </div>
          </div>

          {/* ── Cert plates — inside the card, separated by inner border ── */}
          <div style={{
            position: 'relative', zIndex: 2,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(120px,16vw,180px), 1fr))',
            borderTop: '1px solid rgba(91,194,231,0.15)',
            marginTop: 'clamp(1.5rem,3vw,2rem)',
          }}>
            {certs.map((c, i) => (
              <motion.div
                key={c.code}
                className="fade-up cursor-default"
                style={{
                  transitionDelay: `${i * 80}ms`,
                  position: 'relative',
                  padding: 'clamp(1.8rem,3vw,2.8rem) clamp(1rem,2vw,1.6rem)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRight: i < certs.length - 1 ? '1px solid rgba(91,194,231,0.12)' : 'none',
                  overflow: 'hidden',
                }}
              >
                {/* Animated scan line — top of each cell */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    background: `linear-gradient(90deg, transparent 0%, ${c.color} 50%, transparent 100%)`,
                    animation: `certScan${i} 3.5s ease-in-out infinite`,
                  }} />
                </div>

                {/* Dot matrix texture */}
                <div style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.05,
                  backgroundImage: `radial-gradient(circle, ${c.color} 1px, transparent 1px)`,
                  backgroundSize: '18px 18px',
                }} />

                {/* Code text */}
                <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: isAr ? 'clamp(15px,1.6vw,18px)' : 'clamp(11px,1.2vw,14px)',
                    letterSpacing: '0.35em',
                    textTransform: 'uppercase',
                    color: `${c.color}99`,
                    marginBottom: 10,
                    fontWeight: 700,
                  }}>{isAr ? 'معتمد' : 'CERTIFIED'}</div>

                  <div style={{
                    fontFamily: isAr ? "'Cairo', sans-serif" : "'Bebas Neue', sans-serif",
                    fontSize: isAr ? 'clamp(1.4rem,2.8vw,2.4rem)' : 'clamp(1.6rem,3vw,2.8rem)',
                    letterSpacing: isAr ? '0' : '0.12em',
                    lineHeight: 1,
                    color: '#ffffff',
                    textShadow: `0 0 40px ${c.color}55, 0 2px 24px rgba(0,0,0,0.9)`,
                  }}>
                    {isAr ? c.ar : c.code}
                  </div>


                  <div style={{
                    margin: '10px auto 0',
                    width: 'clamp(24px,2.5vw,36px)', height: 1,
                    background: `linear-gradient(90deg, transparent, ${c.color}, transparent)`,
                    opacity: 0.55,
                  }} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>

      <style>{`
        @keyframes certHeaderSweep {
          0%,100% { opacity: 0.2; transform: scaleX(0.15) translateX(-200%); }
          50%      { opacity: 1;   transform: scaleX(1)    translateX(0); }
        }
        ${certs.map((c, i) => `
          @keyframes certScan${i} {
            0%,100% { opacity: 0.3; transform: scaleX(0.2) translateX(-150%); }
            50%      { opacity: 1;   transform: scaleX(1)   translateX(0); }
          }
        `).join('')}
      `}</style>
    </section>
  )
}
