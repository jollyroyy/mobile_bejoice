'use client';

import { useEffect, useRef } from 'react';

interface LoaderProps {
  progress: number; // 0–100
  visible: boolean;
}

export default function Loader({ progress, visible }: LoaderProps) {
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!labelRef.current) return;
    if (progress < 100) {
      labelRef.current.textContent = `Loading… ${progress}%`;
    } else {
      labelRef.current.textContent = 'Ready!';
    }
  }, [progress]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'var(--dark)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2.5rem',
        opacity: visible ? 1 : 0,
        visibility: visible ? 'visible' : 'hidden',
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.9s ease, visibility 0.9s ease',
      }}
    >
      {/* Brand */}
      <div
        style={{
          fontFamily: 'var(--font-bebas, "Impact"), sans-serif',
          fontSize: 'clamp(3.5rem, 12vw, 7rem)',
          fontWeight: 400,
          letterSpacing: '0.06em',
          background: 'linear-gradient(120deg, #fff 30%, var(--gold) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Bejoice
      </div>

      {/* Progress track */}
      <div
        style={{
          width: 'min(300px, 70vw)',
          height: 1,
          background: 'var(--border)',
        }}
      >
        <div
          style={{
            height: '100%',
            background: 'var(--gold)',
            width: `${progress}%`,
            transition: 'width 0.25s ease',
          }}
        />
      </div>

      {/* Label */}
      <div
        ref={labelRef}
        style={{
          fontSize: '0.68rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--dim)',
        }}
      >
        Preparing experience…
      </div>
    </div>
  );
}
