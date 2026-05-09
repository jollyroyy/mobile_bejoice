'use client';

import { useEffect, useRef } from 'react';

export default function Finale() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const els = rootRef.current?.querySelectorAll('.fu');
    if (!els) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('in'); }),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  function handleRestart(e: React.MouseEvent) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <section
      ref={rootRef}
      id="finale"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'clamp(3rem, 8vw, 6rem) clamp(1.5rem, 5vw, 3rem)',
        background: 'radial-gradient(ellipse at 50% 110%, rgba(200,168,107,0.07) 0%, transparent 60%)',
      }}
    >
      {/* Eyebrow */}
      <div
        className="fu"
        style={{
          fontFamily: 'var(--font-dm-sans, system-ui), sans-serif',
          fontSize: '0.63rem',
          fontWeight: 700,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: 'var(--gold)',
          marginBottom: '1.5rem',
        }}
      >
        The Experience is Complete
      </div>

      {/* Headline — Bebas Neue, two lines, second line gold */}
      <div className="fu" style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            fontFamily: 'var(--font-bebas, "Impact"), sans-serif',
            fontSize: 'clamp(4rem, 14vw, 9.5rem)',
            fontWeight: 400,
            lineHeight: 0.88,
            letterSpacing: '0.05em',
            color: '#ffffff',
            textShadow: '0 1px 16px rgba(0,0,0,0.6)',
          }}
        >
          Bejoice
        </div>
        <div
          style={{
            fontFamily: 'var(--font-bebas, "Impact"), sans-serif',
            fontSize: 'clamp(4rem, 14vw, 9.5rem)',
            fontWeight: 400,
            lineHeight: 0.88,
            letterSpacing: '0.05em',
            color: 'var(--gold)',
            textShadow: '0 1px 16px rgba(0,0,0,0.6), 0 0 28px rgba(200,168,107,0.28)',
          }}
        >
          in it.
        </div>
      </div>

      {/* Body */}
      <p
        className="fu"
        style={{
          fontFamily: 'var(--font-dm-sans, system-ui), sans-serif',
          fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
          color: 'var(--dim)',
          maxWidth: '44ch',
          lineHeight: 1.68,
          marginBottom: '3rem',
        }}
      >
        Three chapters. One story. An experience crafted to move you — in every sense of the word.
      </p>

      {/* CTA */}
      <a
        href="#"
        className="fu"
        onClick={handleRestart}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          background: 'var(--gold)',
          color: '#000',
          textDecoration: 'none',
          fontFamily: 'var(--font-bebas, "Impact"), sans-serif',
          fontSize: '1.1rem',
          letterSpacing: '0.12em',
          padding: '0.9rem 2.8rem',
          borderRadius: 100,
          transition: 'transform 0.25s, box-shadow 0.25s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-3px)';
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 14px 38px rgba(200,168,107,0.28)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.transform = '';
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = '';
        }}
      >
        ↑ BEGIN AGAIN
      </a>
    </section>
  );
}
