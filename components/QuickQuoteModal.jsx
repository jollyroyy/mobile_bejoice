'use client';
import { useEffect, useRef } from 'react'
import QuickQuoteSection from './QuickQuoteSection'
import { useLang } from '@/context/LangContext'
import ar from '@/i18n/ar'

export default function QuickQuoteModal({ onClose }) {
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const backdropRef = useRef(null)

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <>
      <style>{`
        @keyframes qqm-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes qqm-panel-in {
          from { opacity: 0; transform: translateY(40px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes qqm-badge-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(91,194,231,0.4); }
          50%       { box-shadow: 0 0 0 6px rgba(91,194,231,0); }
        }
        @keyframes qqm-dot-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.7); }
        }
        @keyframes qqm-line-sweep {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes qqm-continue-pulse {
          0%, 100% { box-shadow: 0 6px 28px rgba(91,194,231,0.35), inset 0 1px 0 rgba(255,255,255,0.35); }
          50%       { box-shadow: 0 8px 40px rgba(91,194,231,0.65), 0 0 0 6px rgba(91,194,231,0.12), inset 0 1px 0 rgba(255,255,255,0.45); }
        }
        @keyframes qqm-arrow-nudge {
          0%, 100% { transform: translateX(0); }
          50%       { transform: translateX(5px); }
        }

        /* Close button */
        .qqm-x-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 30;
          width: 44px; height: 44px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(7,16,28,0.9);
          border: 1.5px solid rgba(91,194,231,0.5);
          border-radius: 50%;
          color: rgba(91,194,231,0.9);
          font-size: 18px;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0,0,0,0.7), 0 0 0 0 rgba(91,194,231,0.3);
          transition: background 0.25s, border-color 0.25s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s, color 0.25s;
          flex-shrink: 0;
          backdrop-filter: blur(8px);
        }
        .qqm-x-btn:hover {
          background: rgba(91,194,231,0.15);
          border-color: #8DD8F0;
          color: #8DD8F0;
          transform: rotate(90deg) scale(1.1);
          box-shadow: 0 6px 28px rgba(91,194,231,0.4), 0 0 0 4px rgba(91,194,231,0.08);
        }

        /* Animated top gradient bar */
        .qqm-top-bar {
          height: 3px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            #6b4d10 10%,
            #5BC2E7 35%,
            #8DD8F0 50%,
            #8DD8F0 65%,
            #5BC2E7 80%,
            transparent 100%
          );
          background-size: 300% 100%;
          animation: qqm-line-sweep 3s ease-in-out infinite;
          border-radius: 24px 24px 0 0;
          flex-shrink: 0;
        }

        /* Mobile / tablet responsive */
        @media (max-width: 1024px) {
          .qq-services-grid { grid-template-columns: 1fr 1fr !important; }
          .qqm-panel { border-radius: 16px !important; }
        }
        @media (max-width: 640px) {
          /* Compact heading — save vertical space */
          .qqm-panel-heading { padding: 1rem 1rem 0.5rem !important; }
          .qqm-heading-h2 { font-size: clamp(1.5rem, 8vw, 2rem) !important; }
          .qqm-badge { display: none !important; }               /* hide "Instant Pricing Engine" badge */
          .qqm-subtitle { display: none !important; }            /* hide subtitle paragraph */
          .qqm-divider { display: none !important; }             /* hide bottom divider */
          /* X button */
          .qqm-x-btn { top: 10px !important; right: 10px !important; width: 36px !important; height: 36px !important; }
          /* Form grids */
          .qq-grid-2, .qq-grid-3 { grid-template-columns: 1fr !important; }
          .qq-services-grid { grid-template-columns: 1fr 1fr !important; }
          /* Panel padding */
          .qq-panel { padding: 1rem !important; border-radius: 0.75rem !important; }
          /* Tabs */
          .qq-tabs { gap: 0.3rem !important; margin-bottom: 1rem !important; }
          .qq-tab { padding: 0.55rem 0.75rem !important; }
          .qq-tab-sub { display: none !important; }              /* hide sub-label in tabs to save space */
          /* Input font size — prevent iOS zoom */
          .qq-panel input, .qq-panel select { font-size: 16px !important; }
          /* Continue/Submit button */
          .qq-panel button[style*="qqm-continue"] { font-size: 0.9rem !important; padding: 0.9rem 1.5rem !important; }
        }
        @media (max-width: 479px) {
          .qq-services-grid { grid-template-columns: 1fr 1fr !important; }
          /* Inline repeat(4,1fr) grids in container forms → 2 columns */
          .qq-panel [style*="repeat(4"] { grid-template-columns: 1fr 1fr !important; }
          .qq-panel [style*="1fr 1fr 1fr"] { grid-template-columns: 1fr !important; }
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
          animation: 'qqm-backdrop-in 0.28s ease forwards',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Panel */}
        <div
          className="qqm-panel"
          onClick={e => e.stopPropagation()}
          style={{
            position: 'relative',
            width: '100%', maxWidth: 960,
            boxSizing: 'border-box',
            background: 'linear-gradient(160deg, #0d1425 0%, #080c18 40%, #091524 100%)',
            border: '1px solid rgba(91,194,231,0.18)',
            borderRadius: 24,
            boxShadow: `
              0 60px 140px rgba(0,0,0,0.95),
              0 0 0 1px rgba(91,194,231,0.06) inset,
              0 1px 0 rgba(91,194,231,0.2) inset
            `,
            animation: 'qqm-panel-in 0.45s cubic-bezier(0.34,1.2,0.64,1) forwards',
          }}
        >
          {/* Animated gold top bar */}
          <div className="qqm-top-bar" />

          {/* Ambient glow behind heading */}
          <div style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: '60%', height: '200px',
            background: 'radial-gradient(ellipse at 50% 0%, rgba(91,194,231,0.12) 0%, transparent 70%)',
            pointerEvents: 'none', zIndex: 0,
          }} />

          {/* Close button */}
          <button className="qqm-x-btn" onClick={onClose} aria-label="Close">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>

          {/* ── Hero heading block ── */}
          <div className="qqm-panel-heading" style={{
            position: 'relative', zIndex: 1,
            textAlign: 'center',
            padding: '2.6rem 2.5rem 1rem',
          }}>

            {/* Live badge */}
            <div className="qqm-badge" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(91,194,231,0.07)',
              border: '1px solid rgba(91,194,231,0.25)',
              borderRadius: 40,
              padding: '6px 16px',
              marginBottom: 20,
              animation: 'qqm-badge-pulse 2.2s ease-in-out infinite',
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#5BC2E7',
                display: 'inline-block',
                boxShadow: '0 0 8px rgba(91,194,231,0.9)',
                animation: 'qqm-dot-pulse 1.8s ease-in-out infinite',
                flexShrink: 0,
              }} />
              <span style={{
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: 10.5, letterSpacing: isAr ? 0 : '0.32em',
                textTransform: isAr ? 'none' : 'uppercase',
                color: 'rgba(91,194,231,0.9)', fontWeight: 700,
              }}>
                {isAr ? ar.quickQuote.badgeLabel : 'Instant Pricing Engine'}
              </span>
            </div>

            {/* Main heading */}
            <div style={{ marginBottom: 10 }}>
              <h2 className="qqm-heading-h2" style={{
                fontFamily: isAr ? 'var(--font-cairo), sans-serif' : 'var(--font-bebas), sans-serif',
                fontSize: 'clamp(2.2rem,6vw,4rem)',
                letterSpacing: isAr ? 0 : '0.1em',
                lineHeight: 1,
                margin: 0,
                color: '#ffffff',
                textShadow: '0 2px 40px rgba(0,0,0,0.8)',
                textTransform: isAr ? 'none' : undefined,
                direction: isAr ? 'rtl' : 'ltr',
              }}>
                {isAr ? ar.quickQuote.headingWhite : 'GET YOUR'}{' '}
                <span style={{
                  color: '#5BC2E7',
                  textShadow: '0 0 30px rgba(91,194,231,0.5), 0 2px 40px rgba(0,0,0,0.8)',
                }}>
                  {isAr ? ar.quickQuote.headingBlue : 'QUICK QUOTE'}
                </span>
              </h2>
            </div>

            {/* Subtitle */}
            <p className="qqm-subtitle" style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 17,
              color: 'rgba(255,255,255,0.88)',
              margin: '0 auto 20px',
              maxWidth: 560,
              lineHeight: 1.7,
              letterSpacing: '0.01em',
              fontWeight: 500,
            }}>
              {isAr ? ar.quickQuote.subtitle : 'Get a tailored freight price in minutes — Sea, Air, Road, Customs or Project Cargo. No calls, no waiting. Just results.'}
            </p>

            {/* Divider */}
            <div className="qqm-divider" style={{
              width: 80, height: 1, margin: '18px auto 0',
              background: 'linear-gradient(90deg, transparent, rgba(91,194,231,0.5), transparent)',
            }} />
          </div>

          {/* Form */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <QuickQuoteSection inModal={true} lang={lang} />
          </div>
        </div>
      </div>
    </>
  )
}
