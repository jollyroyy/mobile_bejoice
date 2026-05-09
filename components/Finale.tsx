'use client';

import { useEffect, useRef } from 'react';

export default function Finale() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const els = rootRef.current?.querySelectorAll('.fu');
    if (!els) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('in');
        });
      },
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
        background:
          'radial-gradient(ellipse at 50% 110%, rgba(200,168,107,0.07) 0%, transparent 60%)',
      }}
    >
      <div
        className="fu"
        style={{
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

      <h2
        className="fu"
        style={{
          fontSize: 'clamp(3.5rem, 13vw, 8.5rem)',
          fontWeight: 900,
          lineHeight: 0.9,
          letterSpacing: '-0.045em',
          marginBottom: '1.5rem',
          background: 'linear-gradient(160deg, #fff 25%, rgba(255,255,255,0.3) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Bejoice
        <br />
        in it.
      </h2>

      <p
        className="fu"
        style={{
          fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)',
          color: 'var(--dim)',
          maxWidth: '44ch',
          lineHeight: 1.68,
          marginBottom: '3rem',
        }}
      >
        Three chapters. One story. An experience crafted to move you — in every sense of the word.
      </p>

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
          fontSize: '0.78rem',
          fontWeight: 800,
          letterSpacing: '0.09em',
          textTransform: 'uppercase',
          padding: '1rem 2.5rem',
          borderRadius: 100,
          transition: 'transform 0.25s, box-shadow 0.25s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-3px)';
          (e.currentTarget as HTMLAnchorElement).style.boxShadow =
            '0 14px 38px rgba(200,168,107,0.22)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.transform = '';
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = '';
        }}
      >
        ↑&nbsp; Begin Again
      </a>
    </section>
  );
}
