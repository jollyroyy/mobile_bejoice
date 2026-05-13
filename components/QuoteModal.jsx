'use client';
// QuoteModal.jsx — stylish quote request modal
import { useState, useEffect, useRef } from 'react'

const STYLE_ID = 'qm-keyframes'
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const s = document.createElement('style')
  s.id = STYLE_ID
  s.textContent = `
    @keyframes qm-backdrop-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes qm-panel-in {
      from { opacity: 0; transform: translateY(28px) scale(0.96); }
      to   { opacity: 1; transform: translateY(0)    scale(1);    }
    }
    @keyframes qm-service-select {
      0%   { transform: scale(1); }
      40%  { transform: scale(0.96); }
      100% { transform: scale(1); }
    }
    @keyframes qm-success-glow {
      0%   { box-shadow: 0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(91,194,231,0.1); }
      50%  { box-shadow: 0 40px 100px rgba(0,0,0,0.9), 0 0 60px rgba(91,194,231,0.4); }
      100% { box-shadow: 0 40px 100px rgba(0,0,0,0.8), 0 0 30px rgba(91,194,231,0.2); }
    }
    .qm-input {
      width: 100%; background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px;
      color: #fff; font-family: var(--font-dm-sans), sans-serif;
      font-size: 13.5px; padding: 13px 18px; outline: none;
      transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
      box-sizing: border-box;
    }
    .qm-input::placeholder { color: rgba(255,255,255,0.2); }
    .qm-input:focus { 
      border-color: rgba(91,194,231,0.6); 
      background: rgba(255,255,255,0.06); 
      box-shadow: 0 0 0 1px rgba(91,194,231,0.3), 0 8px 24px rgba(0,0,0,0.2);
    }
    .qm-select {
      width: 100%; background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
      color: #fff; font-family: var(--font-dm-sans), sans-serif;
      font-size: 13.5px; padding: 13px 18px; outline: none;
      cursor: pointer; appearance: none;
      transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
      box-sizing: border-box;
    }
    .qm-select:focus { 
      border-color: rgba(91,194,231,0.6); 
      background: rgba(255,255,255,0.06); 
      box-shadow: 0 0 0 1px rgba(91,194,231,0.3);
    }
    .qm-select option { background: #0a0e1a; color: #fff; }
    .qm-submit {
      display:block; width:auto; margin:0 auto; padding:15px 29px;
      background: linear-gradient(135deg, #8DD8F0 0%, #8DD8F0 40%, #5BC2E7 100%);
      color: #091524; border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 12px;
      font-family: var(--font-dm-sans), sans-serif;
      font-size: 14px; font-weight: 900;
      letter-spacing: 0.2em; text-transform: uppercase;
      cursor: pointer; position: relative; overflow: hidden;
      box-shadow: 0 12px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.45);
      transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
    }
    .qm-submit:hover:not(:disabled) { 
      transform: translateY(-2.5px); 
      background: linear-gradient(135deg, #c4edfa 0%, #8DD8F0 40%, #8DD8F0 100%); 
      box-shadow: 0 16px 40px rgba(91,194,231,0.45), 0 12px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.6); 
    }
    .qm-submit:active { transform: scale(0.975); }
    .qm-submit:disabled { opacity: 0.4; cursor: default; transform: none; }
    .qm-service-card {
      flex: 1 1 0; min-width: 0;
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      padding: 18px 12px 16px;
      border-radius: 12px;
      border: 1.5px solid rgba(91,194,231,0.12);
      background: rgba(255,255,255,0.02);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
      user-select: none;
    }
    .qm-service-card:hover {
      border-color: rgba(91,194,231,0.35);
      background: rgba(91,194,231,0.06);
      transform: translateY(-3px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.3);
    }
    .qm-service-card.active {
      border-color: rgba(91,194,231,0.9);
      background: rgba(91,194,231,0.12);
      box-shadow: 0 0 20px rgba(91,194,231,0.22);
      animation: qm-service-select 0.28s ease;
    }
  `
  document.head.appendChild(s)
}

export default function QuoteModal({ onClose }) {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm]         = useState({
    name: '', source: '', destination: '', portNumber: '', phone: '',
  })
  const backdropRef = useRef(null)

  // Close on Escape
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = e => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div
      ref={backdropRef}
      onClick={e => { if (e.target === backdropRef.current) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(3,3,8,0.82)',
        backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        animation: 'qm-backdrop-in 0.3s ease forwards',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 580,
        maxHeight: '90vh', overflowY: 'auto',
        background: 'linear-gradient(170deg, #0f172a 0%, #091524 100%)',
        border: '1.5px solid rgba(91,194,231,0.32)',
        borderRadius: 24,
        boxShadow: submitted ? '0 40px 100px rgba(0,0,0,0.95), 0 0 30px rgba(91,194,231,0.2)' : '0 40px 100px rgba(0,0,0,0.9), 0 0 0 1px rgba(91,194,231,0.12)',
        animation: submitted 
          ? 'qm-success-glow 0.8s ease-out forwards' 
          : 'qm-panel-in 0.45s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        scrollbarWidth: 'none',
        position: 'relative', overflow: 'hidden',
      }}>

        <div style={{
          height: 4,
          background: 'linear-gradient(90deg, transparent 0%, #5BC2E7 30%, #8DD8F0 50%, #5BC2E7 70%, transparent 100%)',
          borderRadius: '24px 24px 0 0',
        }} />

        {submitted ? (
          /* ── Success state ── */
          <div style={{
            padding: '60px 40px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 52 }}>✅</div>
            <div style={{
              fontFamily: "var(--font-bebas), sans-serif",
              fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
              letterSpacing: '0.12em', color: '#8DD8F0',
            }}>
              Quote Request Sent!
            </div>
            <p style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 14, color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.7, maxWidth: 340,
            }}>
              Our freight team will review your request and get back to you within <strong style={{ color: '#5BC2E7' }}>1 hour</strong>. Expect a detailed quote tailored to your shipment.
            </p>
            <button
              onClick={onClose}
              style={{
                marginTop: 12, padding: '14px 44px',
                background: 'linear-gradient(135deg, #8DD8F0, #8DD8F0, #5BC2E7)',
                color: '#091524', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 12,
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 14, fontWeight: 900, letterSpacing: '0.18em',
                textTransform: 'uppercase', cursor: 'pointer',
                position: 'relative', overflow: 'hidden',
                boxShadow: '0 12px 32px rgba(91,194,231,0.4), 0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.5)',
              }}
            >
              <div className="btn-shine-overlay" />
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{
              padding: '36px 32px 0',
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
              position: 'relative',
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  position: 'absolute', right: 26, top: 26,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.4)',
                  borderRadius: 10, cursor: 'pointer',
                  fontSize: 14, padding: '6px 12px',
                  lineHeight: 1, transition: 'all 0.22s cubic-bezier(0.23, 1, 0.32, 1)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
              >✕</button>
              
              <div style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 11.5, letterSpacing: '0.28em',
                color: '#5BC2E7', textTransform: 'uppercase', marginBottom: 10,
                fontWeight: 700,
              }}>
                Bejoice Freight · Quick Booking
              </div>
              <h2 style={{
                fontFamily: "var(--font-bebas), sans-serif",
                fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
                letterSpacing: '0.08em', color: '#fff',
                lineHeight: 0.9, margin: 0,
                textShadow: '0 0 30px rgba(255,255,255,0.15)',
              }}>
                Request a Private Quote
              </h2>
              <p style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 15,
                color: 'rgba(255,255,255,0.8)',
                marginTop: 14,
                marginBottom: 0,
              }}>
                Tailored quote. Instant response.
              </p>
              <div style={{ width: 60, height: 2, background: '#5BC2E7', marginTop: 16, opacity: 0.6 }} />
            </div>

            <div style={{ padding: '24px 32px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>

              <div>
                <Label>Quick Quote Details</Label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 10 }}>
                  <input className="qm-input" placeholder="Full Name" value={form.name} onChange={e => set('name', e.target.value)} required />
                  <input className="qm-input" placeholder="Source" value={form.source} onChange={e => set('source', e.target.value)} required />
                  <input className="qm-input" placeholder="Destination" value={form.destination} onChange={e => set('destination', e.target.value)} required />
                  <input className="qm-input" placeholder="Port Number" value={form.portNumber} onChange={e => set('portNumber', e.target.value)} required />
                  <input className="qm-input" type="tel" placeholder="Phone Number" value={form.phone} onChange={e => set('phone', e.target.value)} required style={{ gridColumn: '1 / -1' }} />
                </div>
              </div>

              {/* ── Submit ── */}
              <button type="submit" className="qm-submit" disabled={!form.name || !form.source || !form.destination || !form.portNumber || !form.phone}>
                <div className="btn-shine-overlay" />
                Request Quick Quote
              </button>

              <p style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 11, color: 'rgba(255,255,255,0.28)',
                textAlign: 'center', margin: 0, lineHeight: 1.5,
              }}>
                🔒 Your details are confidential. We respond within 1 hour during business hours.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function Label({ children }) {
  return (
    <div style={{
      fontFamily: "var(--font-dm-sans), sans-serif",
      fontSize: 11, fontWeight: 700,
      letterSpacing: '0.18em', textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.45)',
    }}>
      {children}
    </div>
  )
}
