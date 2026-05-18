'use client';
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { useCalBooking } from '@/hooks/useCalBooking'
import { useLang } from '@/context/LangContext'
import ar from '@/i18n/ar'
import DrawerQuoteModal from './DrawerQuoteModal'

const CAL_LINK = "bejoice/freight-expert-consultation"

const links = [
  { label: 'Why Bejoice',                    arLabel: 'لماذا بيجويس',                id: 'why-us',         num: '01', sub: 'Our story & edge',    arSub: 'قصتنا وميزتنا' },
  { label: 'Services',                       arLabel: 'الخدمات',                     id: 'services',       num: '03', sub: 'Full logistics suite',  arSub: 'حلول لوجستية متكاملة' },
  { label: 'Heavy Lift & Project Logistics', arLabel: 'رفع ثقيل ولوجستيات المشاريع', id: 'heavy-cargo',    num: '05', sub: '1500+ operations',    arSub: '+1500 عملية' },
  { label: 'Bejoice Wings',                  arLabel: 'أجنحة بيجويس',                id: 'globe-mid',      num: '06', sub: 'Our global network',   arSub: 'شبكتنا العالمية', isGlobe: true },
  { label: 'Certified to Deliver',           arLabel: 'معتمدون للتسليم',             id: 'certifications', num: '04', sub: 'Industry accreditations', arSub: 'اعتمادات صناعية' },
]


export default function Nav({ onQuoteClick, onWhyClick, onServicesClick, onToolsClick, onCertificationsClick }) {
  const { openCalPopup } = useCalBooking()
  const { lang, setLang } = useLang()
  const isAr = lang === 'ar'
  const [scrolled, setScrolled]   = useState(false)
  const [pastHero, setPastHero]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [heavyOpen, setHeavyOpen] = useState(false)
  const [drawerQuoteOpen, setDrawerQuoteOpen] = useState(false)
  const drawerRef                 = useRef(null)
  const backdropRef               = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Detect when scrollytelling hero ends (1800vh)
  useEffect(() => {
    const update = (scrollY) => {
      const heroEnd = (1800 / 100) * window.innerHeight
      setPastHero(scrollY > heroEnd)
    }
    const attach = () => {
      if (window.__lenis) {
        window.__lenis.on('scroll', ({ scroll }) => update(scroll))
      } else {
        setTimeout(attach, 200)
      }
    }
    attach()
    const onScroll = () => update(window.scrollY || document.documentElement.scrollTop)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll when drawer/heavy popup is open
  useEffect(() => {
    const lenis = window.__lenis
    const lockScroll = menuOpen || heavyOpen || drawerQuoteOpen
    document.body.style.overflow = lockScroll ? 'hidden' : ''
    if (lockScroll) document.body.classList.add('explore-open')
    else document.body.classList.remove('explore-open')
    if (lockScroll) lenis?.stop?.()
    else lenis?.start?.()
    return () => {
      document.body.style.overflow = ''
      document.body.classList.remove('explore-open')
      lenis?.start?.()
    }
    }, [menuOpen, heavyOpen, drawerQuoteOpen])

  // GSAP drawer animation
  useEffect(() => {
    const drawer   = drawerRef.current
    const backdrop = backdropRef.current
    if (!drawer || !backdrop) return
    if (menuOpen) {
      backdrop.style.display = 'block'
      gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.28, ease: 'power2.out' })
      gsap.fromTo(drawer,   { x: '100%' }, { x: '0%', duration: 0.42, ease: 'power3.out' })
    } else {
      gsap.to(drawer,   { x: '100%', duration: 0.32, ease: 'power3.in' })
      gsap.to(backdrop, { opacity: 0, duration: 0.28, ease: 'power2.in', onComplete: () => { if (backdrop) backdrop.style.display = 'none' } })
    }
  }, [menuOpen])

  const scrollTo = (id) => {
    setMenuOpen(false)
    // globe links jump instantly — no drawer-close delay
    const delay = (id === 'globe' || id === 'globe-mid') ? 0 : 400
    setTimeout(() => {
      const el = document.getElementById(id)
      if (el) {
        const offset = id === 'globe-mid' ? 0 : -80
        if (window.__lenis) window.__lenis.scrollTo(el, { offset, immediate: true })
        else el.scrollIntoView({ behavior: 'instant' })
      }
    }, delay)
  }

  const scrollToTop = () => {
    setMenuOpen(false)
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true })
    else window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const handleQuote = () => {
    setMenuOpen(false)
    onQuoteClick?.()
  }

  const toolCard = (icon, label, sub, onClick) => (
    <button
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', gap: '0.5rem',
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '0.9rem', padding: 'clamp(0.85rem,2vw,1.1rem) clamp(0.75rem,1.8vw,1rem)',
        cursor: 'pointer', transition: 'all 0.22s', textAlign: 'left',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,194,231,0.1)'; e.currentTarget.style.borderColor = 'rgba(91,194,231,0.35)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
    >
      <span style={{ fontSize: 'clamp(1.3rem,2.5vw,1.6rem)', lineHeight: 1 }}>{icon}</span>
      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(0.88rem,2vw,1rem)', letterSpacing: '0.1em', color: '#ffffff', lineHeight: 1.1, textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(0.63rem,1.4vw,0.68rem)', fontWeight: 500, color: 'rgba(91,194,231,0.7)', lineHeight: 1.4, letterSpacing: '0.02em' }}>{sub}</span>
    </button>
  )

  return (
    <>
      <a href="#main-content" className="skip-link">
        {isAr ? 'تجاوز إلى المحتوى الرئيسي' : 'Skip to Content'}
      </a>
      <nav
        role="navigation"
        aria-label={isAr ? 'الملاحة الرئيسية' : 'Main Navigation'}
        style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        transition: 'background 0.5s ease, backdrop-filter 0.5s ease',
        padding: '12px 0',
        background: 'transparent',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        borderBottom: 'none',
      }}>
        <div className="nav-inner" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 32px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 'clamp(110px, 11vw, 155px)' }}>

          {/* Logo */}
          <div
            onClick={scrollToTop}
            className="nav-logo-wrap"
            role="link"
            aria-label={isAr ? 'الصفحة الرئيسية بيجويس' : 'Bejoice Home'}
            style={{ position: 'relative', cursor: 'pointer', display: 'inline-block', flexShrink: 0 }}>
            <Image
              src="/bejoice-logo-group.webp"
              alt="Bejoice"
              width={2048}
              height={2048}
              className="nav-logo-img"
              priority
              unoptimized
              quality={100}
              sizes="(max-width: 479px) 105px, (max-width: 900px) 130px, 155px"
              style={{
                height: 'clamp(110px, 11vw, 155px)',
                width: 'auto',
                display: 'block',
                objectFit: 'contain',
                imageRendering: 'auto',
                filter: 'none',
              }}
            />
          </div>

          {/* Right side: CTA + Hamburger */}
          <div className="nav-right-wrap" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px,2vw,16px)' }}>

            {/* CTA — Book a Call (hidden after hero scrollytelling) */}
            <button
              onClick={openCalPopup}
              className="btn-gold nav-book-call"
              style={{ padding: 'clamp(9px,1.5vw,12px) clamp(12px,2.5vw,22px)', whiteSpace: 'nowrap', fontSize: isAr ? 'clamp(0.575rem,0.8vw,0.775rem)' : 'clamp(0.45rem,0.8vw,0.65rem)', fontWeight: 700, opacity: pastHero ? 0 : 1, pointerEvents: pastHero ? 'none' : 'auto', transition: 'opacity 0.4s ease' }}
            >
              <div className="btn-shine-overlay" />
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span className="hidden sm:inline">{isAr ? ar.nav.bookCall : 'Book a Call with Freight Expert'}</span>
              <span className="sm:hidden">{isAr ? ar.nav.bookCallShort : 'Book a Call'}</span>
            </button>

            <div className="explore-lang-wrap" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px,2vw,16px)' }}>
            {/* Explore button — premium glass pill with gradient border */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              className="explore-btn"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                opacity: pastHero ? 0 : 1, pointerEvents: pastHero ? 'none' : 'auto',
                padding: 'clamp(8px,1.5vw,11px) clamp(16px,2.5vw,22px)',
                background: menuOpen
                  ? 'linear-gradient(135deg, rgba(91,194,231,0.18) 0%, rgba(0,125,186,0.14) 100%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(91,194,231,0.04) 100%)',
                border: 'none', borderRadius: '100px', cursor: 'pointer', zIndex: 60,
                position: 'relative', overflow: 'visible',
                WebkitTapHighlightColor: 'transparent',
                backdropFilter: 'blur(12px)',
                boxShadow: menuOpen
                  ? '0 0 28px rgba(91,194,231,0.3), inset 0 1px 0 rgba(255,255,255,0.12)'
                  : '0 2px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
                outline: `1.5px solid ${menuOpen ? 'rgba(91,194,231,0.75)' : 'rgba(91,194,231,0.35)'}`,
                transition: 'all 0.35s cubic-bezier(0.23,1,0.32,1)',
              }}
              onMouseEnter={e => {
                if (!menuOpen) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(91,194,231,0.13) 0%, rgba(0,125,186,0.1) 100%)'
                  e.currentTarget.style.outline = '1.5px solid rgba(91,194,231,0.7)'
                  e.currentTarget.style.boxShadow = '0 0 24px rgba(91,194,231,0.22), inset 0 1px 0 rgba(255,255,255,0.1)'
                }
              }}
              onMouseLeave={e => {
                if (!menuOpen) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(91,194,231,0.04) 100%)'
                  e.currentTarget.style.outline = '1.5px solid rgba(91,194,231,0.35)'
                  e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)'
                }
              }}
            >
<span style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: isAr ? 'clamp(13px,1.1vw,15px)' : 'clamp(11px,1.1vw,13px)',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: menuOpen ? '#5BC2E7' : '#ffffff',
                lineHeight: 1,
                transition: 'all 0.3s ease',
              }}>
                {menuOpen ? (isAr ? ar.nav.close : 'Close') : (isAr ? ar.nav.explore : 'Explore')}
              </span>
            </button>

            {/* Language Toggle */}
            <div style={{
              display: 'flex', alignItems: 'stretch', flexShrink: 0,
              background: 'rgba(10,10,18,0.6)', border: '1.5px solid rgba(91,194,231,0.45)',
              borderRadius: '10px', overflow: 'hidden', backdropFilter: 'blur(12px)',
              boxShadow: '0 2px 16px rgba(91,194,231,0.12), inset 0 1px 0 rgba(91,194,231,0.08)',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(91,194,231,0.75)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(91,194,231,0.28), inset 0 1px 0 rgba(91,194,231,0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(91,194,231,0.45)'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(91,194,231,0.12), inset 0 1px 0 rgba(91,194,231,0.08)' }}
            >
              <button onClick={() => { if (lang === 'en') return; setLang('en') }}
                style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: 'clamp(6px,1.2vw,8px) clamp(9px,1.5vw,13px)', background: lang === 'en' ? 'rgba(91,194,231,0.22)' : 'transparent', border: 'none', borderRight: '1px solid rgba(91,194,231,0.3)', cursor: lang === 'en' ? 'default' : 'pointer', transition: 'background 0.25s ease', position: 'relative' }}
                onMouseEnter={e => { if (lang !== 'en') e.currentTarget.style.background = 'rgba(91,194,231,0.1)' }}
                onMouseLeave={e => { if (lang !== 'en') e.currentTarget.style.background = 'transparent' }}
              >
                <img src="https://flagcdn.com/w40/gb.png" width="20" height="14" alt="English" decoding="async" loading="lazy" style={{ borderRadius: '3px', flexShrink: 0, objectFit: 'cover', display: 'block', boxShadow: '0 1px 4px rgba(0,0,0,0.5)', opacity: lang === 'en' ? 1 : 0.75 }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', lineHeight: 1, color: lang === 'en' ? '#8DD8F0' : 'rgba(91,194,231,0.65)', textShadow: lang === 'en' ? '0 0 12px rgba(232,204,122,0.6)' : 'none' }}>EN</span>
                {lang === 'en' && <span style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '20px', height: '2px', background: 'linear-gradient(90deg, transparent, #5BC2E7, transparent)', borderRadius: '2px 2px 0 0' }} />}
              </button>
              <button onClick={() => { if (lang === 'ar') return; setLang('ar') }}
                style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: 'clamp(6px,1.2vw,8px) clamp(9px,1.5vw,13px)', background: lang === 'ar' ? 'rgba(91,194,231,0.22)' : 'transparent', border: 'none', cursor: lang === 'ar' ? 'default' : 'pointer', transition: 'background 0.25s ease', position: 'relative' }}
                onMouseEnter={e => { if (lang !== 'ar') e.currentTarget.style.background = 'rgba(91,194,231,0.1)' }}
                onMouseLeave={e => { if (lang !== 'ar') e.currentTarget.style.background = 'transparent' }}
              >
                <img src="https://flagcdn.com/w40/sa.png" width="20" height="14" alt="Arabic" decoding="async" loading="lazy" style={{ borderRadius: '3px', flexShrink: 0, objectFit: 'cover', display: 'block', boxShadow: '0 1px 4px rgba(0,0,0,0.5)', opacity: lang === 'ar' ? 1 : 0.75 }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', lineHeight: 1, color: lang === 'ar' ? '#8DD8F0' : 'rgba(91,194,231,0.65)', textShadow: lang === 'ar' ? '0 0 12px rgba(232,204,122,0.6)' : 'none' }}>AR</span>
                {lang === 'ar' && <span style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '20px', height: '2px', background: 'linear-gradient(90deg, transparent, #5BC2E7, transparent)', borderRadius: '2px 2px 0 0' }} />}
              </button>
            </div>
            </div>

          </div>
        </div>
      </nav>

      {/* ── BACKDROP ── */}
      <div
        ref={backdropRef}
        onClick={() => setMenuOpen(false)}
        style={{ display: 'none', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 998, backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      />

      {/* ── SIDE DRAWER ── */}
      <div
        className="drawer-scroll-hide"
        ref={drawerRef}
        data-lenis-prevent
        data-lenis-prevent-wheel
        data-lenis-prevent-touch
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 'min(400px, 92vw)',
          background: '#0a1826',
          borderLeft: '1px solid rgba(91,194,231,0.12)',
          zIndex: 999,
          display: 'flex', flexDirection: 'column',
          transform: 'translateX(100%)',
          overflow: 'hidden',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {/* Ambient glow effects — behind all content */}
        <div style={{ position:'absolute', top:'5%', right:'-10%', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle,rgba(91,194,231,0.05) 0%,transparent 65%)', pointerEvents:'none', zIndex: 0 }} />
        <div style={{ position:'absolute', bottom:'5%', left:'-8%', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle,rgba(30,60,180,0.05) 0%,transparent 65%)', pointerEvents:'none', zIndex: 0 }} />
        {/* Top shimmer line */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:1, pointerEvents:'none', zIndex: 1,
          background:'linear-gradient(90deg, transparent 0%, rgba(91,194,231,0.6) 40%, rgba(91,194,231,0.8) 50%, rgba(91,194,231,0.6) 60%, transparent 100%)' }} />
        {/* Inner scrollable content */}
        <div style={{ position:'relative', flex: 1, overflowY: 'auto', zIndex: 1, scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          className="drawer-scroll-hide">
        {/* Gold top accent */}
        <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, rgba(91,194,231,0.8), transparent)', flexShrink: 0 }} />

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 1.4rem', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0px' }}>
            <img src="/bejoice-logo-group.webp" alt="Bejoice" style={{ height: 'clamp(60px, 18vw, 102px)', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 1px 6px rgba(0,0,0,0.8))' }} />
            <div style={{ borderLeft: '1.5px solid rgba(91,194,231,0.35)', paddingLeft: '9px', marginLeft: '6px' }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '16px', letterSpacing: '0.18em', color: '#ffffff', textTransform: 'uppercase', fontWeight: 700, lineHeight: 1 }}>Bejoice</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', letterSpacing: '0.14em', color: '#ffffff', textTransform: 'uppercase', fontWeight: 600, lineHeight: 1, marginTop: '3px' }}>Group</div>
            </div>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', transition: 'all 0.2s', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
          >✕</button>
        </div>

        {/* Nav links */}
        <div style={{ padding: '1rem 1.4rem 0.5rem', flexShrink: 0 }}>
          {links.map(link => (
            <button
              key={link.id}
              onClick={() => {
                if (link.id === 'heavy-cargo') { setMenuOpen(false); setHeavyOpen(true); }
                else if (link.id === 'why-us') { setMenuOpen(false); onWhyClick?.(); }
                else if (link.id === 'load-calculator') { setMenuOpen(false); onToolsClick?.(); }
                else if (link.id === 'certifications') { setMenuOpen(false); onCertificationsClick?.(); }
                else if (link.id === 'services') { setMenuOpen(false); onServicesClick?.(); }
                else scrollTo(link.id);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%', textAlign: 'left',
                fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(0.84rem,2vw,0.99rem)', fontWeight: 400,
                textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.65)',
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 'clamp(0.65rem,2vw,0.7rem) 0', minHeight: '44px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#5BC2E7'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
            >
              <span style={{ display: 'inline-block', width: 3, height: 14, background: 'rgba(91,194,231,0.4)', borderRadius: 2, flexShrink: 0 }}/>
              {isAr ? link.arLabel : link.label}
            </button>
          ))}
        </div>

        {/* Tools section */}
        <div style={{ padding: '1rem 1.4rem', flexShrink: 0 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.85rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(91,194,231,0.7)', marginBottom: '0.8rem', borderBottom: '1px solid rgba(91,194,231,0.12)', paddingBottom: '0.5rem' }}>
            {isAr ? ar.nav.logisticsTools : 'Logistics Tools'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            {toolCard('🧮', isAr ? ar.nav.loadCalculator : 'Load Calculator', isAr ? ar.nav.loadCalculatorSub : 'Advanced Load Optimization Tool', () => { setMenuOpen(false); onToolsClick?.() })}
            {toolCard('🚢', isAr ? ar.nav.quickQuote : 'Quick Quote', isAr ? 'أسعار شحن فورية' : 'Instant freight rates', () => { setMenuOpen(false); setDrawerQuoteOpen(true) })}
            {toolCard('📡', isAr ? ar.nav.trackShipment : 'Track Shipment', isAr ? 'BL / AWB تتبع مباشر' : 'BL / AWB live tracking', () => { setMenuOpen(false); window.open('https://www.track-trace.com/', '_blank', 'noopener,noreferrer') })}
            {toolCard('📞', isAr ? ar.nav.bookCallTool : 'Book a Call', isAr ? 'تحدث مع خبير شحن' : 'Talk to a freight expert', () => { setMenuOpen(false); openCalPopup() })}
            {toolCard('✉️', isAr ? ar.nav.emailUs : 'Email Us', 'info@bejoiceshipping-ksa.com', () => { setMenuOpen(false); window.location.href = 'mailto:info@bejoiceshipping-ksa.com' })}
          </div>

          {/* Social links — app-icon squares */}
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.6rem', justifyContent: 'center' }}>
            <a
              href="https://www.linkedin.com/company/bejoice-shipping-llc/"
              target="_blank" rel="noopener noreferrer"
              aria-label="Bejoice on LinkedIn"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 44, height: 44, borderRadius: '11px', flexShrink: 0,
                background: 'linear-gradient(145deg, #0d7ad6 0%, #0A66C2 60%, #084ea1 100%)',
                color: '#ffffff', textDecoration: 'none', transition: 'all 0.22s',
                boxShadow: '0 2px 10px rgba(10,102,194,0.6), inset 0 1px 0 rgba(255,255,255,0.25)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.06)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(10,102,194,0.75), inset 0 1px 0 rgba(255,255,255,0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(10,102,194,0.6), inset 0 1px 0 rgba(255,255,255,0.25)' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M6.94 5a2 2 0 1 1-4-.002 2 2 0 0 1 4 .002zM7 8.48H3V21h4V8.48zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91l.04-1.68z"/>
              </svg>
            </a>
            <a
              href="https://www.instagram.com/bejoice_shipping"
              target="_blank" rel="noopener noreferrer"
              aria-label="Bejoice on Instagram"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 44, height: 44, borderRadius: '11px', flexShrink: 0,
                background: 'linear-gradient(135deg, #f9ce34 0%, #ee2a7b 50%, #6228d7 100%)',
                color: '#ffffff', textDecoration: 'none', transition: 'all 0.22s',
                boxShadow: '0 2px 10px rgba(220,39,100,0.6), inset 0 1px 0 rgba(255,255,255,0.25)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.06)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(220,39,100,0.75), inset 0 1px 0 rgba(255,255,255,0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(220,39,100,0.6), inset 0 1px 0 rgba(255,255,255,0.25)' }}
            >
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Bottom bar */}
        <div style={{ padding: '1rem 1.4rem', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(0.62rem,1.2vw,0.7rem)', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em' }}>
              {isAr ? ar.nav.estRiyadh : 'Est. 2006 · Riyadh, KSA'}
            </span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(0.62rem,1.2vw,0.7rem)', color: 'rgba(91,194,231,0.55)', letterSpacing: '0.08em' }}>
              ZATCA · ISO 9001 · FIATA
            </span>
          </div>
        </div>
      </div>
      </div>

      {/* ── Drawer Quote Modal ── */}
      {drawerQuoteOpen && <DrawerQuoteModal onClose={() => setDrawerQuoteOpen(false)} />}

      {/* ── Heavy Lift Popup ── */}
      {heavyOpen && (
        <div
          data-lenis-prevent
          data-lenis-prevent-wheel
          data-lenis-prevent-touch
          onClick={e => { if (e.target === e.currentTarget) setHeavyOpen(false) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            background: 'rgba(2,3,10,0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            padding: 'max(16px,env(safe-area-inset-top)) max(8px,env(safe-area-inset-right)) max(40px,env(safe-area-inset-bottom)) max(8px,env(safe-area-inset-left))',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position:'relative',
              width:'100%', maxWidth:960,
              minHeight:'100%',
              background:'#183650',
              backgroundImage:'linear-gradient(145deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.015) 50%, rgba(91,194,231,0.018) 100%)',
              border:'1px solid rgba(91,194,231,0.35)',
              borderTop:'1px solid rgba(91,194,231,0.65)',
              borderRadius:28,
              boxShadow:[
                '0 60px 120px rgba(0,0,0,0.75)',
                '0 0 0 1px rgba(91,194,231,0.08) inset',
                'inset 0 1px 0 rgba(91,194,231,0.30)',
                '0 0 60px rgba(91,194,231,0.10)',
                '0 0 120px rgba(91,194,231,0.05)',
              ].join(', '),
            }}
          >
            {/* Corner accent — top-left */}
            <div style={{ position:'absolute', top:0, left:0, width:120, height:120, pointerEvents:'none',
              background:'radial-gradient(circle at 0% 0%, rgba(91,194,231,0.12) 0%, transparent 65%)' }}/>
            {/* Corner accent — bottom-right */}
            <div style={{ position:'absolute', bottom:0, right:0, width:200, height:200, pointerEvents:'none',
              background:'radial-gradient(circle at 100% 100%, rgba(91,194,231,0.07) 0%, transparent 60%)' }}/>

            {/* ── Header ── */}
            <div style={{
              padding: 'clamp(1.4rem,3.5vw,2rem) clamp(1.6rem,4vw,2.4rem) clamp(1rem,2.5vw,1.4rem)',
              position: 'relative', overflow: 'hidden',
            }}>
<div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  {/* Headline — centered */}
                  <h2 style={{
                    fontFamily: "var(--font-bebas), sans-serif", fontWeight: 400,
                    fontSize: 'clamp(1rem,5vw,4rem)', letterSpacing: '0.03em',
                    color: '#ffffff', lineHeight: 0.95, margin: '0 0 1rem',
                    textAlign: 'center',
                  }}>
                    {isAr ? ar.nav.heavyLiftTitle : (
                      <>Heavy Lift &amp; Project{' '}<span style={{ color: '#5BC2E7' }}>Logistics</span></>
                    )}
                  </h2>

                </div>

                {/* Close button */}
                <button
                  onClick={() => setHeavyOpen(false)}
                  style={{
                    position: 'absolute', top: 12, right: 12, zIndex: 30,
                    width: 44, height: 44,
                    background: 'rgba(7,16,28,0.97)', border: '2px solid rgba(91,194,231,0.85)',
                    borderRadius: '50%', color: '#fff', fontSize: 22,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 16px rgba(0,0,0,0.9)',
                  }}
                  aria-label="Close"
                >×</button>
              </div>

              {/* Separator */}
              <div style={{
                height: 1,
                background: 'linear-gradient(90deg, rgba(91,194,231,0.45) 0%, rgba(91,194,231,0.08) 70%, transparent 100%)',
                marginTop: 'clamp(1rem,2.5vw,1.4rem)',
              }} />
            </div>

            {/* ── Services ── */}
            <div style={{ padding: '0 clamp(1rem,3.5vw,1.8rem) clamp(0.5rem,1.5vw,0.8rem)' }}>
              {[
                {
                  num: '01',
                  title: 'Heavy Lift / ODC / OOG Transportation',
                  desc: 'Hydraulic axle transport for wind turbines, transformers, generators, and large industrial machinery.',
                },
                {
                  num: '02',
                  title: 'Route Survey & Feasibility Study',
                  desc: 'Physical inspection of the full route from pickup to delivery, identifying and resolving risks before movement.',
                },
                {
                  num: '03',
                  title: 'Route Modification for ODC Transport',
                  desc: 'Removal of traffic signals, guardrails, overhead cables, and bypass construction to clear path for oversized cargo.',
                },
                {
                  num: '04',
                  title: 'Onsite Jacking & Skidding',
                  desc: 'Precision lifting for transformers and large modules; horizontal movement via skid systems and engineered beams.',
                },
                {
                  num: '05',
                  title: 'Technical Engineering Solutions',
                  desc: 'Lift plans, load distribution calculations, and structural analysis for safe heavy cargo transport.',
                },
              ].map((item, i) => {
                const arItem = ar.nav.heavyServices[i]
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex', gap: 'clamp(0.9rem,2.5vw,1.4rem)', alignItems: 'flex-start',
                      padding: 'clamp(0.85rem,2vw,1.1rem) clamp(0.8rem,2vw,1rem)',
                      borderRadius: 12, marginBottom: '0.2rem',
                      borderLeft: '2px solid transparent',
                      transition: 'background 0.22s ease, border-color 0.22s ease',
                      cursor: 'default',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(91,194,231,0.06)'
                      e.currentTarget.style.borderLeftColor = 'rgba(91,194,231,0.55)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.borderLeftColor = 'transparent'
                    }}
                  >
                    {/* Large decorative number */}
                    <div style={{
                      fontFamily: "var(--font-bebas), sans-serif", fontWeight: 400,
                      fontSize: 'clamp(1.4rem,2.2vw,1.7rem)', lineHeight: 1,
                      color: '#5BC2E7', letterSpacing: '0.03em',
                      flexShrink: 0, paddingTop: '0.05rem', minWidth: 'clamp(2.2rem,4.5vw,3rem)',
                    }}>{item.num}</div>

                    <div style={{ flex: 1 }}>
                      {/* Service title */}
                      <div style={{
                        fontFamily: "var(--font-bebas), sans-serif", fontWeight: 400,
                        fontSize: 'clamp(1.4rem,2.2vw,1.7rem)', letterSpacing: '0.03em',
                        color: '#5BC2E7', marginBottom: '0.35rem', lineHeight: 1.2,
                      }}>{isAr ? arItem.title : item.title}</div>
                      {/* Description */}
                      <div style={{
                        fontFamily: "var(--font-dm-sans), sans-serif",
                        fontSize: 'clamp(16px,1.6vw,18.5px)',
                        color: 'rgba(255,255,255,0.78)', lineHeight: 1.6,
                        fontWeight: 400,
                      }}>{isAr ? arItem.desc : item.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── CTA footer ── */}
            <div style={{
              padding: 'clamp(0.9rem,2.5vw,1.3rem) clamp(1.4rem,4vw,2rem) clamp(1.1rem,2.5vw,1.6rem)',
              borderTop: '1px solid rgba(91,194,231,0.12)',
              background: 'linear-gradient(0deg, rgba(91,194,231,0.05) 0%, transparent 100%)',
              display: 'flex', gap: '0.75rem', flexWrap: 'wrap',
              marginTop: '0.4rem',
            }}>
              <button
                onClick={() => { setHeavyOpen(false); openCalPopup() }}
                style={{
                  flex: '1 1 176px', padding: '1rem 1.6rem', minHeight: 52,
                  background: 'linear-gradient(135deg, #5BC2E7 0%, #8DD8F0 50%, #5BC2E7 100%)',
                  border: 'none', borderRadius: 12, cursor: 'pointer',
                  fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400,
                  fontSize: 'clamp(0.95rem,2vw,1.1rem)', letterSpacing: '0.2em',
                  color: '#07101c',
                  boxShadow: '0 4px 28px rgba(91,194,231,0.32)',
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 40px rgba(91,194,231,0.48)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 28px rgba(91,194,231,0.32)' }}
              >
                {isAr ? ar.nav.bookConsult : 'Book a Consultation →'}
              </button>
              <button
                onClick={() => { setHeavyOpen(false); const el = document.getElementById('heavy-cargo'); if (el) { if (window.__lenis) window.__lenis.scrollTo(el, { offset: -80, immediate: true }); else el.scrollIntoView({ behavior: 'instant' }) } }}
                style={{
                  flex: '1 1 156px', padding: '1rem 1.6rem', minHeight: 52,
                  background: 'transparent',
                  border: '1.5px solid rgba(91,194,231,0.35)', borderRadius: 12, cursor: 'pointer',
                  fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400,
                  fontSize: 'clamp(0.95rem,2vw,1.1rem)', letterSpacing: '0.2em',
                  color: 'rgba(91,194,231,0.85)', transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,194,231,0.09)'; e.currentTarget.style.borderColor = 'rgba(91,194,231,0.6)'; e.currentTarget.style.color = '#8DD8F0' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(91,194,231,0.35)'; e.currentTarget.style.color = 'rgba(91,194,231,0.85)' }}
              >
                {isAr ? ar.nav.viewSection : 'View Full Section ↓'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
