'use client';

import { useEffect, useRef } from 'react';

interface InterstitialProps {
  number: string;
  heading: React.ReactNode;
  body: string;
}

export default function Interstitial({ number, heading, body }: InterstitialProps) {
  const rootRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      ref={rootRef}
      style={{
        background: 'var(--dark)',
        minHeight: '25vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(2.5rem, 6vh, 5rem) clamp(1.5rem, 8vw, 6rem)',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 620 }}>
        {/* Ghost big number */}
        <span
          className="fu"
          style={{
            display: 'block',
            fontFamily: 'var(--font-bebas, "Impact"), sans-serif',
            fontSize: 'clamp(6rem, 22vw, 14rem)',
            fontWeight: 400,
            lineHeight: 1,
            letterSpacing: '0.05em',
            color: 'rgba(255,255,255,0.03)',
            marginBottom: '-0.1em',
            userSelect: 'none',
          }}
        >
          {number}
        </span>

        {/* Heading */}
        <h3
          className="fu"
          style={{
            fontFamily: 'var(--font-bebas, "Impact"), sans-serif',
            fontSize: 'clamp(2rem, 6vw, 3.4rem)',
            fontWeight: 400,
            letterSpacing: '0.06em',
            lineHeight: 0.92,
            marginBottom: '1.2rem',
          }}
        >
          {heading}
        </h3>

        {/* Body */}
        <p
          className="fu"
          style={{
            fontFamily: 'var(--font-dm-sans, system-ui), sans-serif',
            fontSize: 'clamp(0.88rem, 2.2vw, 1rem)',
            color: 'var(--dim)',
            lineHeight: 1.72,
          }}
        >
          {body}
        </p>
      </div>
    </div>
  );
}
