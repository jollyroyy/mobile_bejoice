'use client';

import { useEffect, useRef } from 'react';

interface NavProps {
  chapterOffsets: React.MutableRefObject<number[]>;
  chapterScrollables: React.MutableRefObject<number[]>;
}

export default function Nav({ chapterOffsets, chapterScrollables }: NavProps) {
  const dot0Ref = useRef<HTMLButtonElement>(null);
  const dot1Ref = useRef<HTMLButtonElement>(null);
  const dot2Ref = useRef<HTMLButtonElement>(null);
  const plineRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);

  useEffect(() => {
    const dots = [dot0Ref.current!, dot1Ref.current!, dot2Ref.current!];

    function onScroll() {
      const sy = window.scrollY;
      const dh = document.documentElement.scrollHeight - window.innerHeight;

      // Overall progress line
      if (plineRef.current) {
        plineRef.current.style.width = (sy / dh * 100) + '%';
      }

      // Active chapter dot
      const offsets = chapterOffsets.current;
      const scrollables = chapterScrollables.current;
      for (let i = 0; i < 3; i++) {
        const scrolled = sy - offsets[i];
        if (scrolled >= 0 && scrolled <= scrollables[i]) {
          if (activeRef.current !== i) {
            activeRef.current = i;
            dots.forEach((d, j) => {
              if (j === i) d.classList.add('ndot-active');
              else d.classList.remove('ndot-active');
            });
          }
          break;
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [chapterOffsets, chapterScrollables]);

  function scrollToChapter(idx: number) {
    window.scrollTo({ top: chapterOffsets.current[idx], behavior: 'smooth' });
  }

  const dotBase: React.CSSProperties = {
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.22)',
    cursor: 'pointer',
    transition: 'background 0.3s, transform 0.3s',
    border: 'none',
    outline: 'none',
    padding: 0,
  };

  return (
    <>
      {/* 1px gold progress line at very top */}
      <div
        ref={plineRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: 1,
          background: 'var(--gold)',
          zIndex: 500,
          width: 0,
        }}
      />

      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          padding: 'clamp(1.4rem, 4vw, 1.4rem) clamp(1.25rem, 5vw, 3rem)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(0,0,0,0.1)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          mixBlendMode: 'difference',
        }}
      >
        <a
          href="#"
          style={{
            fontSize: '0.95rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--white)',
            textDecoration: 'none',
          }}
        >
          Bejoice
        </a>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            ref={dot0Ref}
            style={dotBase}
            className="ndot-active"
            aria-label="Chapter 1"
            onClick={() => scrollToChapter(0)}
          />
          <button
            ref={dot1Ref}
            style={dotBase}
            aria-label="Chapter 2"
            onClick={() => scrollToChapter(1)}
          />
          <button
            ref={dot2Ref}
            style={dotBase}
            aria-label="Chapter 3"
            onClick={() => scrollToChapter(2)}
          />
        </div>
      </nav>
    </>
  );
}
