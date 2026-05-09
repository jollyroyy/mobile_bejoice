'use client';
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function GlobeVideo() {
  const videoRef  = useRef(null)
  const tagRef    = useRef(null)
  const line1Ref  = useRef(null)
  const line2Ref  = useRef(null)
  const subRef    = useRef(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {})
    }

    // Entrance animation on mount (hero = first thing on page)
    const tl = gsap.timeline({ delay: 0.3 })

    tl.fromTo(tagRef.current,
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }
    )
    .fromTo(line1Ref.current,
      { y: 60, opacity: 0, filter: 'blur(12px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.15, ease: 'power3.out' },
      '-=0.45'
    )
    .fromTo(line2Ref.current,
      { y: 60, opacity: 0, filter: 'blur(12px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.15, ease: 'power3.out' },
      '-=0.8'
    )
    .fromTo(subRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 0.72, duration: 0.9, ease: 'power3.out' },
      '-=0.7'
    )

    return () => tl.kill()
  }, [])

  return (
    <section style={{
      position: 'relative',
      height: '100vh',
      width: '100%',
      overflow: 'hidden',
      background: '#091524',
    }}>
      {/* ── Video ── */}
      <video
        ref={videoRef}
        src="/globe-trade.mp4"
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center center',
        }}
      />

      {/* ── Cinematic overlay ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse 75% 65% at 50% 50%, rgba(5,5,8,0) 0%, rgba(5,5,8,0.52) 100%),
          linear-gradient(to bottom,
            rgba(5,5,8,0.65) 0%,
            rgba(5,5,8,0.04) 22%,
            rgba(5,5,8,0.04) 76%,
            rgba(5,5,8,0.72) 100%
          )
        `,
        pointerEvents: 'none',
      }} />

      {/* ── Gold tint ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 90% 50% at 50% 50%, rgba(91,194,231,0.06) 0%, transparent 100%)',
        mixBlendMode: 'screen',
        pointerEvents: 'none',
      }} />

      {/* ── Vignette ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 42%, rgba(5,5,8,0.88) 100%)',
        pointerEvents: 'none',
      }} />

      {/* ── Text — left-aligned ── */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'flex-start', justifyContent: 'center',
        textAlign: 'left',
        padding: '0 clamp(1.5rem, 8vw, 7rem)',
        pointerEvents: 'none',
      }}>
        {/* Logo + tagline row */}
        <div ref={tagRef} style={{
          display: 'flex', alignItems: 'center', gap: '0.9rem',
          marginBottom: '1.4rem',
          opacity: 0,
        }}>
          <picture>
            <source srcSet="/bejoice-logo-nav.webp" type="image/webp" />
            <img
              src="/bejoice-logo-nav.webp"
              alt="Bejoice"
              width="400" height="223"
              loading="lazy" decoding="async"
              style={{ height: '2.2rem', width: 'auto', aspectRatio: '400 / 223', objectFit: 'contain' }}
            />
          </picture>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            fontSize: 'clamp(0.65rem, 1.1vw, 0.85rem)',
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: 'rgba(91,194,231,0.88)',
          }}>
            Bejoice Logistics · Saudi Arabia
          </span>
        </div>

        <h1
          ref={line1Ref}
          className="section-headline"
          style={{ lineHeight: 1, marginBottom: '0.08em', opacity: 0 }}
        >
          GLOBAL{' '}
          <span style={{ color: 'rgba(91,194,231,0.78)' }}>REACH.</span>
        </h1>

        <h1
          ref={line2Ref}
          className="section-headline"
          style={{ lineHeight: 1, marginBottom: '2rem', opacity: 0 }}
        >
          LOCAL{' '}
          <span className="shine-text" data-text="EXPERTISE.">EXPERTISE.</span>
        </h1>

        <p ref={subRef} className="body-text" style={{
          maxWidth: '38ch',
          fontSize: 'clamp(0.85rem, 1.3vw, 0.98rem)',
          opacity: 0,
          lineHeight: 1.7,
        }}>
          Connecting continents. Delivering certainty.<br />
          Award-winning freight forwarder based in the Kingdom of Saudi Arabia.
        </p>
      </div>

      {/* ── Bottom dissolve into next section ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '28%',
        background: 'linear-gradient(to bottom, transparent, #091524)',
        pointerEvents: 'none',
      }} />
    </section>
  )
}
