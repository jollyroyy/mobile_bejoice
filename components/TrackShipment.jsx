'use client';
import { useState } from 'react'

export default function TrackShipment() {
  const [blNum, setBlNum]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState(null)
  const [inputErr, setInputErr] = useState(false)

  const handleTrack = () => {
    if (!blNum.trim()) { setInputErr(true); return }
    setInputErr(false)
    setLoading(true)
    setResult(null)
    setTimeout(() => {
      setLoading(false)
      setResult('ok')
      const msg = `Hi, I'd like to track my shipment: ${blNum.trim()}`
      window.open(`https://wa.me/966550000000?text=${encodeURIComponent(msg)}`, '_blank', 'noopener')
    }, 1200)
  }

  return (
    <section id="track" style={{
      background: 'linear-gradient(180deg, #091524 0%, #07090f 100%)',
      padding: '32px clamp(1.5rem, 8vw, 8rem) 48px',
      position: 'relative',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(91,194,231,0.22)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          padding: '28px 32px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Gold top bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(91,194,231,0.7), transparent)',
          }} />
          {/* Corner glow */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '180px', height: '180px',
            background: 'linear-gradient(135deg, rgba(91,194,231,0.08) 0%, transparent 65%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Title row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5BC2E7" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <span style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '22px', letterSpacing: '0.18em', color: '#ffffff',
              }}>
                TRACK YOUR SHIPMENT
              </span>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2aaa5e', animation: 'trackPulse 2s infinite' }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                  24/7 Live Support
                </span>
              </div>
            </div>

            {/* Input row */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Enter BL / AWB number — e.g. MSKU1234567 or 157-12345678"
                value={blNum}
                onChange={e => { setBlNum(e.target.value); setInputErr(false); setResult(null) }}
                onKeyDown={e => e.key === 'Enter' && handleTrack()}
                style={{
                  flex: 1, minWidth: '220px',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${inputErr ? 'rgba(255,80,80,0.7)' : 'rgba(91,194,231,0.2)'}`,
                  padding: '13px 18px',
                  color: '#ffffff',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px', fontWeight: 500,
                  outline: 'none',
                  transition: 'border-color 0.25s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={e => (e.target.style.borderColor = 'rgba(91,194,231,0.65)')}
                onBlur={e => (e.target.style.borderColor = inputErr ? 'rgba(255,80,80,0.7)' : 'rgba(91,194,231,0.2)')}
              />
              <button
                onClick={handleTrack}
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', gap: '9px',
                  padding: '13px 30px',
                  background: 'linear-gradient(135deg, #8DD8F0, #5BC2E7)',
                  border: 'none', color: '#091524',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12px', fontWeight: 700,
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  cursor: loading ? 'wait' : 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 0 18px rgba(91,194,231,0.35)',
                  transition: 'box-shadow 0.3s ease, transform 0.2s ease',
                  opacity: loading ? 0.8 : 1,
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.boxShadow = '0 0 28px rgba(91,194,231,0.65)'; e.currentTarget.style.transform = 'translateY(-1px)' }}}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 18px rgba(91,194,231,0.35)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {loading ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                      style={{ animation: 'trackSpin 0.8s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    <span>Checking...</span>
                  </>
                ) : (
                  <>
                    <span>Track Now</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </>
                )}
              </button>
            </div>

            {/* Error */}
            {inputErr && (
              <p style={{ marginTop: '8px', fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'rgba(255,100,100,0.9)' }}>
                Please enter a BL or AWB number to continue.
              </p>
            )}

            {/* Success toast */}
            {result === 'ok' && (
              <div style={{
                marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 16px',
                background: 'rgba(91,194,231,0.05)',
                border: '1px solid rgba(91,194,231,0.2)',
                animation: 'trackFadeIn 0.35s ease',
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(37,211,102,1)" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                  Opening WhatsApp with your tracking request.{' '}
                  <a
                    href={`https://wa.me/966550000000?text=${encodeURIComponent(`Hi, I'd like to track my shipment: ${blNum.trim()}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ color: 'rgba(37,211,102,0.9)', textDecoration: 'underline' }}
                  >
                    Open WhatsApp
                  </a>
                </span>
              </div>
            )}

            {/* Cargo type badges */}
            <div style={{
              marginTop: '18px', paddingTop: '16px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center',
            }}>
              {[
                { label: 'FCL / LCL', desc: 'Container' },
                { label: 'Air Freight', desc: 'AWB' },
                { label: 'Project Cargo', desc: 'Heavy Lift & ODC' },
                { label: 'Road', desc: 'GCC & KSA' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '3px', height: '16px', background: 'rgba(91,194,231,0.4)', flexShrink: 0 }} />
                  <div>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '13px', letterSpacing: '0.12em', color: '#5BC2E7' }}>{item.label}</span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginLeft: '6px' }}>{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
