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
        <span
          className="fu"
          style={{
            display: 'block',
            fontSize: 'clamp(5.5rem, 20vw, 12rem)',
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.06em',
            color: 'rgba(255,255,255,0.03)',
            marginBottom: '-0.15em',
          }}
        >
          {number}
        </span>
        <h3
          className="fu"
          style={{
            fontSize: 'clamp(1.75rem, 5.5vw, 2.8rem)',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            lineHeight: 1.08,
            marginBottom: '1.1rem',
          }}
        >
          {heading}
        </h3>
        <p
          className="fu"
          style={{
            fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)',
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
