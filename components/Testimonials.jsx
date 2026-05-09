'use client';
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '@/context/LangContext'
import ar from '@/i18n/ar'

const testimonials = [
  { quote: "Bejoice transformed our supply chain for the Saudi market. Their ZATCA expertise saved us weeks of compliance headaches — goods now clear customs within hours.", name: "Ahmad Al-Rashidi", title: "Supply Chain Director", company: "Al-Rashidi Industrial Group", initials: "AR" },
  { quote: "Exceptional handling of our project cargo from Germany to Riyadh. The team managed every detail — from oversized permits to final-mile delivery — flawlessly.", name: "Markus Weber", title: "Operations Manager", company: "Weber Engineering GmbH", initials: "MW" },
  { quote: "Bejoice handled our 180-tonne transformer relocation from Jubail to Riyadh flawlessly — hydraulic axles, route modification, onsite jacking, all coordinated seamlessly. True heavy lift experts.", name: "Fatima Al-Sayed", title: "Procurement Head", company: "Al-Sayed Trading Co.", initials: "FS" },
  { quote: "Real-time tracking, proactive communication, zero surprises at the port. Bejoice is the only forwarder we trust for critical automotive parts shipments.", name: "James Park", title: "Global Logistics Lead", company: "AutoParts Pacific", initials: "JP" },
]

export default function Testimonials() {
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const [active, setActive] = useState(0)
  const sectionRef = useRef(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) e.target.querySelectorAll('.fade-up').forEach((el, i) => {
            setTimeout(() => el.classList.add('visible'), i * 90)
          })
        })
      },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    intervalRef.current = setInterval(() => setActive(a => (a + 1) % testimonials.length), 6000)
    return () => clearInterval(intervalRef.current)
  }, [])

  const goTo = (i) => {
    setActive(i)
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => setActive(a => (a + 1) % testimonials.length), 6000)
  }

  const t = isAr
    ? { ...testimonials[active], ...ar.testimonials.items[active] }
    : testimonials[active]

  return (
    <section id="testimonials" ref={sectionRef} className="relative pt-6 pb-16 md:pt-10 md:pb-24 lg:pt-14 lg:pb-32 px-6 md:px-12 lg:px-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(91,194,231,0.05) 0%, transparent 65%)' }}/>
      <div className="absolute select-none pointer-events-none"
        style={{ top: 'clamp(32px,4vw,64px)', right: 'clamp(8px,3vw,48px)', fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(80px,18vw,280px)', lineHeight: 1, color: 'rgba(91,194,231,0.05)' }}>
        "
      </div>

      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px 0px" }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="mb-20 flex flex-col items-end"
        >
          <div className="section-glass-header" style={{ textAlign: 'right' }}>
            <div className="section-num mb-5" style={{ textAlign: 'right' }}>{isAr ? ar.testimonials.sectionNum : '05 — Client Voices'}</div>
            <h2 className="section-headline" style={{ textAlign: 'right' }}>
              <span style={{ color: '#ffffff' }}>{isAr ? ar.testimonials.whatThey : 'WHAT THEY'}</span><br />
              <span style={{ color: 'rgba(91,194,231,0.98)' }}>{isAr ? ar.testimonials.say : 'SAY'}</span>
            </h2>
          </div>
        </motion.div>

        <div className="fade-up">
          <div className="glass-card p-6 sm:p-10 md:p-16 border-gold/25 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-28 h-28"
              style={{ background: 'linear-gradient(135deg, rgba(91,194,231,0.12) 0%, transparent 65%)' }}/>
            <blockquote key={active} style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 'clamp(16px, 2.2vw, 22px)',
              fontWeight: 400, fontStyle: 'italic',
              color: '#ffffff',
              lineHeight: 1.65,
              marginBottom: '40px',
            }}>
              "{t.quote}"
            </blockquote>
            <div className="flex items-center gap-5 flex-wrap">
              <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center"
                style={{ background: 'rgba(91,194,231,0.12)', border: '1.5px solid rgba(91,194,231,0.35)', fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(15px,2vw,22px)', letterSpacing: '0.05em', color: '#5BC2E7' }}>
                {t.initials}
              </div>
              <div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(13px,1.7vw,16px)', fontWeight: 600, color: '#ffffff' }}>{t.name}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(11px,1.4vw,14px)', color: 'rgba(255,255,255,0.85)', marginTop: '3px' }}>{t.title} · {t.company}</div>
              </div>
              <div className="ml-auto flex items-center gap-3">
                {testimonials.map((_, i) => (
                  <button key={i} onClick={() => goTo(i)}
                    style={{ height: '4px', width: i === active ? 'clamp(24px,3.5vw,36px)' : 'clamp(10px,1.2vw,14px)', borderRadius: i === active ? 0 : '50%', background: i === active ? '#5BC2E7' : 'rgba(255,255,255,0.2)', transition: 'all 0.3s ease', border: 'none', cursor: 'pointer', padding: '10px 6px', boxSizing: 'content-box' }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px mt-px" style={{ fontSize: 'clamp(12px,1.5vw,15px)' }}>
          {testimonials.map((t2, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`fade-up glass-card px-6 py-5 text-left transition-all duration-300 ${i === active ? 'border-gold/45 !bg-gold/6' : 'opacity-50 hover:opacity-80'}`}
              style={{ transitionDelay: `${i * 55}ms` }}
            >
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(13px,1.7vw,17px)', letterSpacing: '0.1em', color: '#ffffff', marginBottom: '4px' }}>{t2.name.split(' ')[0]}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(9px,1.1vw,12px)', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.72)' }}>{t2.company.split(' ').slice(0, 2).join(' ')}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
