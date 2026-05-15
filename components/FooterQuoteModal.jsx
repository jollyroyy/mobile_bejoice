'use client';
import { useEffect, useRef, useState, useCallback } from 'react'
import { useLang } from '@/context/LangContext'
import ar from '@/i18n/ar'
import emailjs from '@emailjs/browser'
import { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, sanitize, isValidPhone, isValidEmail } from '@/utils/emailService'

const CONTACT_TEMPLATE_ID = EMAILJS_TEMPLATE_ID
const SERVICES = ['Air Freight','Sea Freight','Road Transport','Customs Clearance','Warehousing','Project Cargo']

export default function FooterQuoteModal({ onClose }) {
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const backdropRef = useRef(null)
  const [form, setForm] = useState({ name:'', company:'', email:'', phone:'', origin:'', destination:'', types:[], message:'' })
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [focused, setFocused] = useState(null)
  const [errors, setErrors] = useState({})
  const cardRef = useRef(null)
  const glowRef = useRef(null)

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current
    const glow = glowRef.current
    if (!card || !glow) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const px = (x / rect.width) * 100
    const py = (y / rect.height) * 100
    glow.style.background = `radial-gradient(600px circle at ${px}% ${py}%, rgba(91,194,231,0.10) 0%, rgba(91,194,231,0.04) 30%, transparent 65%)`
    const rx = (y / rect.height - 0.5) * 4
    const ry = (x / rect.width - 0.5) * -4
    card.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current
    const glow = glowRef.current
    if (card) card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)'
    if (glow) glow.style.background = 'transparent'
  }, [])

  const handleChange = e => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  function validate() {
    const e = {}
    const name = (form.name || '').trim()
    const email = (form.email || '').trim()
    const phone = (form.phone || '').trim()
    if (!name) e.name = isAr ? 'الاسم مطلوب' : 'Full name is required'
    else if (name.length < 2) e.name = isAr ? 'الاسم قصير جداً' : 'Name is too short'
    if (!email) e.email = isAr ? 'البريد الإلكتروني مطلوب' : 'Email is required'
    else if (!isValidEmail(email)) e.email = isAr ? 'أدخل بريداً إلكترونياً صحيحاً' : 'Enter a valid email address'
    if (phone && !isValidPhone(phone)) e.phone = isAr ? 'أدخل رقم هاتف صحيحاً (مثال: +966 50 123 4567)' : 'Enter a valid phone number (e.g. +966 50 123 4567)'
    return e
  }

  const fieldErr = (field) => errors[field]
    ? <div style={{ color:'#f87171', fontSize:'clamp(11px,1.1vw,13px)', marginTop:4, fontFamily:"var(--font-dm-sans), sans-serif" }}>{errors[field]}</div>
    : null

  const iStyle = (name) => ({
    width: '100%', boxSizing: 'border-box',
    background: errors[name] ? 'rgba(248,113,113,0.05)' : focused === name ? 'rgba(91,194,231,0.09)' : 'rgba(255,255,255,0.08)',
    border: `1px solid ${errors[name] ? 'rgba(248,113,113,0.65)' : focused === name ? 'rgba(91,194,231,0.7)' : 'rgba(255,255,255,0.18)'}`,
    borderRadius: 8,
    padding: 'clamp(11px,1.4vw,14px) clamp(12px,1.8vw,16px)',
    fontFamily: isAr ? "'Cairo',sans-serif" : "var(--font-dm-sans), sans-serif",
    fontSize: 'clamp(16px,1.7vw,19px)',
    color: '#ffffff',
    textShadow: '0 0 12px rgba(255,255,255,0.15)',
    outline: 'none',
    transition: 'border-color 0.2s, background 0.2s',
    direction: isAr ? 'rtl' : 'ltr',
    textAlign: isAr ? 'right' : 'left',
  })

  const labelStyle = {
    fontFamily: isAr ? "'Cairo',sans-serif" : "var(--font-dm-sans), sans-serif",
    fontSize: 'clamp(13px,1.3vw,15px)',
    letterSpacing: isAr ? '0' : '0.22em',
    textTransform: isAr ? 'none' : 'uppercase',
    color: 'rgba(91,194,231,1)',
    textShadow: '0 0 16px rgba(91,194,231,0.4)',
    fontWeight: 700,
    display: 'block', marginBottom: 7,
    direction: isAr ? 'rtl' : 'ltr',
  }

  return (
    <>
      <style>{`
        @keyframes fqm-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fqm-pan { from { opacity: 0; transform: translateY(28px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 600px) {
          .fqm-grid2 { grid-template-columns: 1fr !important; }
          .fqm-glass { transform: none !important; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        ref={backdropRef}
        data-lenis-prevent
        data-lenis-prevent-wheel
        data-lenis-prevent-touch
        onClick={e => { if (e.target === backdropRef.current) onClose() }}
        style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          background: 'rgba(2,3,10,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          padding: 'max(16px, env(safe-area-inset-top)) max(8px, env(safe-area-inset-right)) max(40px, env(safe-area-inset-bottom)) max(8px, env(safe-area-inset-left))',
          animation: 'fqm-in 0.28s ease forwards',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Panel */}
        <div
          ref={cardRef}
          onClick={e => e.stopPropagation()}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="fqm-glass"
          style={{
            position: 'relative',
            width: '100%', maxWidth: 700,
            boxSizing: 'border-box',
            background: 'linear-gradient(160deg, #0d1425 0%, #080c18 40%, #091524 100%)',
            border: '1px solid rgba(91,194,231,0.18)',
            borderRadius: 24,
            boxShadow: [
              '0 60px 140px rgba(0,0,0,0.95)',
              '0 0 0 1px rgba(91,194,231,0.06) inset',
              '0 1px 0 rgba(91,194,231,0.2) inset',
            ].join(', '),
            animation: 'fqm-pan 0.45s cubic-bezier(0.34,1.2,0.64,1) forwards',
            transition: 'transform 0.15s ease, box-shadow 0.3s ease',
            overflow: 'hidden',
          }}
        >
          {/* Mouse-follow glow */}
          <div ref={glowRef} style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            borderRadius: 24, transition: 'background 0.1s ease',
            zIndex: 1,
          }}/>

          {/* Animated top bar */}
          <div style={{
            position: 'relative', zIndex: 2,
            height: 3,
            background: 'linear-gradient(90deg, transparent 0%, #5BC2E7 35%, #8DD8F0 50%, #8DD8F0 65%, #5BC2E7 80%, transparent 100%)',
            backgroundSize: '300% 100%',
            animation: 'fqm-line-sweep 3s ease-in-out infinite',
            borderRadius: '24px 24px 0 0',
            flexShrink: 0,
          }}>
            <style>{`@keyframes fqm-line-sweep { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }`}</style>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 16, right: 16, zIndex: 30,
              width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(7,16,28,0.9)',
              border: '1.5px solid rgba(91,194,231,0.5)',
              color: 'rgba(91,194,231,0.9)',
              fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.7)',
              transition: 'all 0.25s',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,194,231,0.15)'; e.currentTarget.style.borderColor = '#8DD8F0'; e.currentTarget.style.color = '#8DD8F0' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(7,16,28,0.9)'; e.currentTarget.style.borderColor = 'rgba(91,194,231,0.5)'; e.currentTarget.style.color = 'rgba(91,194,231,0.9)' }}
            aria-label="Close"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 2, padding: 'clamp(1.5rem,4vw,2.5rem) clamp(1.2rem,3vw,2rem)' }}>
            {!sent ? (
              <>
                {/* Heading */}
                <div style={{ textAlign: 'center', marginBottom: 'clamp(1.2rem,2.5vw,2rem)' }}>
                  <h2 style={{
                    fontFamily: isAr ? "'Cairo','Noto Sans Arabic',sans-serif" : "var(--font-bebas), sans-serif",
                    fontSize: 'clamp(1.5rem,4vw,2.6rem)',
                    letterSpacing: isAr ? 0 : '0.07em',
                    lineHeight: 1,
                    margin: '0 0 0.5rem',
                    color: '#ffffff',
                  }}>
                    {isAr ? (
                      <><span style={{ color: '#ffffff' }}>{ar.contact.headlineWhite}</span><span style={{ color: '#5BC2E7' }}>{ar.contact.headlineCyan}</span></>
                    ) : (
                      <><span style={{ color: '#ffffff' }}>REQUEST A </span><span style={{ color: '#5BC2E7' }}>PRIVATE QUOTE</span></>
                    )}
                  </h2>
                  <p style={{
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontSize: isAr ? 'clamp(19px, 2.3vw, 23px)' : 'clamp(14px, 1.5vw, 16px)',
                    color: '#ffffff', maxWidth: 450, margin: '0 auto', lineHeight: 1.7,
                    fontWeight: 500,
                  }}>
                    {isAr ? ar.contact.subheading : 'Tailored quote. Instant response.'}
                  </p>
                </div>

                {/* Form */}
                <form dir={isAr ? 'rtl' : 'ltr'} onSubmit={async e => {
                  e.preventDefault()
                  if (submitting) return
                  const validationErrors = validate()
                  if (Object.keys(validationErrors).length > 0) {
                    setErrors(validationErrors)
                    return
                  }
                  setErrors({})
                  setSubmitting(true)
                  try {
                    const body = [
                      `📋 CONTACT FORM — BEJOICE PREMIUM`,
                      ``,
                      `👤 CONTACT DETAILS`,
                      `• Name:        ${sanitize(form.name)}`,
                      `• Company:     ${sanitize(form.company)}`,
                      `• Email:       ${sanitize(form.email)}`,
                      `• Phone:       ${sanitize(form.phone)}`,
                      ``,
                      `🚚 SHIPMENT DETAILS`,
                      `• Origin:      ${sanitize(form.origin)}`,
                      `• Destination: ${sanitize(form.destination)}`,
                      `• Service:     ${form.types.length ? form.types.join(', ') : '—'}`,
                      ``,
                      form.message ? `📝 MESSAGE\n${sanitize(form.message)}` : '',
                    ].filter(Boolean).join('\n')

                    setSent(true)
                    setSubmitting(false)
                    emailjs.send(
                      EMAILJS_SERVICE_ID,
                      CONTACT_TEMPLATE_ID,
                      {
                        to_email:    'info@bejoiceshipping-ksa.com',
                        reply_to:    sanitize(form.email) || 'info@bejoiceshipping-ksa.com',
                        from_name:   sanitize(form.name) || 'Bejoice Contact Form',
                        subject:     `[Bejoice Contact] ${sanitize(form.name)} — ${form.types.join(', ') || 'General Enquiry'}`,
                        client_name: sanitize(form.name) || '—',
                        company:     sanitize(form.company) || '—',
                        client_email:sanitize(form.email) || '—',
                        phone:       sanitize(form.phone) || '—',
                        message:     body,
                      },
                      EMAILJS_PUBLIC_KEY,
                    ).catch((err) => console.error('FooterQuote email send failed:', err))
                  } catch {
                    setSent(true)
                  } finally {
                    setSubmitting(false)
                  }
                }}>
                  {/* Row 1 — Name / Company */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'clamp(8px,1.4vw,14px)', marginBottom:'clamp(8px,1.4vw,14px)' }} className="fqm-grid2">
                    <div><label style={labelStyle}>{isAr ? ar.contact.labels.fullName : 'Full Name *'}</label>
                      <input style={iStyle('name')} placeholder={isAr ? ar.contact.placeholders.fullName : 'Ahmed Al-Rashidi'} name="name" value={form.name} onChange={handleChange} onFocus={()=>setFocused('name')} onBlur={()=>setFocused(null)} />
                      {fieldErr('name')}
                    </div>
                    <div><label style={labelStyle}>{isAr ? ar.contact.labels.company : 'Company'}</label>
                      <input style={iStyle('company')} placeholder={isAr ? ar.contact.placeholders.company : 'Company name'} name="company" value={form.company} onChange={handleChange} onFocus={()=>setFocused('company')} onBlur={()=>setFocused(null)} />
                    </div>
                  </div>

                  {/* Row 2 — Email / Phone */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'clamp(8px,1.4vw,14px)', marginBottom:'clamp(8px,1.4vw,14px)' }} className="fqm-grid2">
                    <div><label style={labelStyle}>{isAr ? ar.contact.labels.email : 'Email *'}</label>
                      <input style={iStyle('email')} placeholder="your@email.com" type="email" name="email" value={form.email} onChange={handleChange} onFocus={()=>setFocused('email')} onBlur={()=>setFocused(null)} />
                      {fieldErr('email')}
                    </div>
                    <div><label style={labelStyle}>{isAr ? ar.contact.labels.phone : 'Phone / WhatsApp'}</label>
                      <input style={iStyle('phone')} placeholder="+966 5X XXX XXXX" name="phone" value={form.phone}
                        onChange={handleChange}
                        onFocus={()=>setFocused('phone')} onBlur={()=>setFocused(null)} />
                      {fieldErr('phone')}
                    </div>
                  </div>

                  {/* Row 3 — Origin / Destination */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'clamp(8px,1.4vw,14px)', marginBottom:'clamp(8px,1.4vw,14px)' }} className="fqm-grid2">
                    <div><label style={labelStyle}>{isAr ? ar.contact.labels.origin : 'Origin'}</label>
                      <input style={iStyle('origin')} placeholder={isAr ? ar.contact.placeholders.origin : 'Country / Port'} name="origin" value={form.origin} onChange={handleChange} onFocus={()=>setFocused('origin')} onBlur={()=>setFocused(null)} />
                    </div>
                    <div><label style={labelStyle}>{isAr ? ar.contact.labels.destination : 'Destination'}</label>
                      <input style={iStyle('destination')} placeholder={isAr ? ar.contact.placeholders.destination : 'Country / Port'} name="destination" value={form.destination} onChange={handleChange} onFocus={()=>setFocused('destination')} onBlur={()=>setFocused(null)} />
                    </div>
                  </div>

                  {/* Service type pills */}
                  <div style={{ marginBottom:'clamp(8px,1.4vw,14px)' }}>
                    <label style={labelStyle}>
                      {isAr ? ar.contact.labels.serviceType : 'Service Type'}
                      {form.types.length > 0 && (
                        <span style={{ marginLeft: 8, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'none', color: 'rgba(91,194,231,0.7)', fontSize: 'clamp(11px,1vw,12px)' }}>
                          {isAr ? `(${form.types.length} محدد)` : `(${form.types.length} selected)`}
                        </span>
                      )}
                    </label>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'clamp(5px,0.8vw,8px)' }}>
                      {(isAr ? ar.contact.services : SERVICES).map((s, sIdx) => {
                        const val = isAr ? SERVICES[sIdx] : s
                        const active = form.types.includes(val)
                        return (
                          <button key={s} type="button"
                            onClick={() => setForm(f => {
                              const newTypes = f.types.includes(val)
                                ? f.types.filter(t => t !== val)
                                : [...f.types, val]
                              return { ...f, types: newTypes }
                            })}
                            style={{
                              fontFamily: isAr ? "'Cairo',sans-serif" : "var(--font-dm-sans), sans-serif",
                              fontSize:'clamp(13px,1vw,13px)', fontWeight:600,
                              letterSpacing: isAr ? '0' : '0.1em',
                              textTransform: isAr ? 'none' : 'uppercase',
                              padding:'clamp(8px,0.8vw,9px) clamp(12px,1.3vw,16px)',
                              minHeight: 44,
                              borderRadius:6, cursor:'pointer', transition:'all 0.18s',
                              background: active ? 'rgba(91,194,231,0.15)' : 'rgba(255,255,255,0.04)',
                              border: `1px solid ${active ? 'rgba(91,194,231,0.55)' : 'rgba(255,255,255,0.08)'}`,
                              color: active ? '#8DD8F0' : 'rgba(255,255,255,0.85)',
                              boxShadow: active ? '0 0 12px rgba(91,194,231,0.15)' : 'none',
                              display: 'flex', alignItems: 'center', gap: 6,
                              flexDirection: isAr ? 'row-reverse' : 'row',
                            }}
                          >
                            {active && (
                              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                                <path d="M2 6l3 3 5-5" stroke="#8DD8F0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                            {s}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Message */}
                  <div style={{ marginBottom:'clamp(1.2rem,2.5vw,2rem)' }}>
                    <label style={labelStyle}>{isAr ? ar.contact.labels.additionalDetails : 'Additional Details'}</label>
                    <textarea
                      style={{ ...iStyle('message'), resize:'none' }}
                      placeholder={isAr ? ar.contact.placeholders.message : 'Cargo type, weight, dimensions, special requirements...'}
                      name="message" rows={3} value={form.message}
                      onChange={handleChange}
                      onFocus={()=>setFocused('message')}
                      onBlur={()=>setFocused(null)}
                    />
                  </div>

                  {/* Submit */}
                  <div style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        fontFamily: isAr ? "'Cairo','Noto Sans Arabic',sans-serif" : "var(--font-bebas), sans-serif",
                        fontSize: 'clamp(13px,1.5vw,16px)',
                        letterSpacing: '0.2em',
                        padding: 'clamp(12px,1.5vw,15px) clamp(24px,3vw,38px)',
                        background: 'linear-gradient(135deg,#8DD8F0 0%,#8DD8F0 40%,#5BC2E7 100%)',
                        color: '#091524',
                        border: '1px solid rgba(255,255,255,0.25)',
                        fontWeight: 900,
                        borderRadius: 12,
                        cursor: 'pointer',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.45)',
                        transition: 'all 0.4s cubic-bezier(0.23,1,0.32,1)',
                        opacity: submitting ? 0.75 : 1,
                      }}
                      onMouseEnter={e => { if (!submitting) { e.currentTarget.style.transform = 'translateY(-2.5px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(91,194,231,0.45),0 12px 32px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.6)' } }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.45)' }}
                    >
                      {submitting ? (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                            style={{ animation: 'spin 0.7s linear infinite' }}>
                            <path d="M12 2a10 10 0 1 0 10 10" strokeLinecap="round"/>
                          </svg>
                          <span>{isAr ? 'جارٍ الإرسال…' : 'Sending…'}</span>
                        </>
                      ) : (
                        <>
                          <span>{isAr ? ar.contact.submitBtn : 'Send Query'}</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* ── Success ── */
              <div dir={isAr ? 'rtl' : 'ltr'} style={{
                animation: 'fqm-success-in 0.5s ease forwards',
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(34,197,94,0.06) 0%, rgba(34,197,94,0.02) 100%)',
                border: '1px solid rgba(34,197,94,0.25)',
                borderRadius: 20, padding: 'clamp(3rem,6vw,6rem) clamp(2rem,5vw,4rem)',
              }}>
                <style>{`@keyframes fqm-success-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1.4rem' }}>
                  <div style={{
                    width:'clamp(72px,10vw,96px)', height:'clamp(72px,10vw,96px)',
                    borderRadius:'50%',
                    background:'linear-gradient(135deg,rgba(34,197,94,0.18) 0%,rgba(22,163,74,0.08) 100%)',
                    border:'2px solid rgba(34,197,94,0.55)',
                    boxShadow:'0 0 40px rgba(34,197,94,0.25), 0 0 80px rgba(34,197,94,0.1)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                  </div>
                </div>
                <h3 style={{ fontFamily: isAr ? "'Cairo','Noto Sans Arabic',sans-serif" : "var(--font-bebas), sans-serif", fontSize:'clamp(1.8rem,4vw,3rem)', letterSpacing:'0.1em', color:'#ffffff', marginBottom:'0.8rem' }}>{isAr ? ar.contact.successTitle : 'ENQUIRY SENT'}</h3>
                <p style={{ fontFamily:"var(--font-dm-sans), sans-serif", fontSize:'clamp(14px,1.5vw,17px)', color:'rgba(255,255,255,0.72)', maxWidth:380, margin:'0 auto 0.5rem', lineHeight:1.75 }}>
                  {isAr ? ar.contact.successBody : 'Your form has been submitted successfully.'}
                </p>
                <p style={{ fontFamily:"var(--font-dm-sans), sans-serif", fontSize:'clamp(14px,1.5vw,17px)', color:'#22c55e', fontWeight:600, maxWidth:380, margin:'0 auto 2rem', lineHeight:1.75 }}>
                  {isAr ? ar.contact.successTime : 'Our freight expert will reach you in 5 minutes.'}
                </p>
                <button
                  onClick={() => { setSent(false); setSubmitting(false); setForm({ name:'', company:'', email:'', phone:'', origin:'', destination:'', types:[], message:'' }); onClose() }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '12px 32px', borderRadius: 12, border: '1px solid rgba(91,194,231,0.4)',
                    background: 'transparent', color: '#8DD8F0', cursor: 'pointer',
                    fontFamily: "var(--font-dm-sans), sans-serif", fontWeight: 700,
                    fontSize: 14, letterSpacing: '0.1em', transition: 'all 0.3s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,194,231,0.1)'; e.currentTarget.style.borderColor = '#8DD8F0' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(91,194,231,0.4)' }}
                >
                  {isAr ? ar.contact.newEnquiry : 'New Enquiry'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
