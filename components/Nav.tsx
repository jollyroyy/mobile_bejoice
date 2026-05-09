'use client';

import { useEffect, useRef } from 'react';

interface NavProps {
  chapterOffsets: React.MutableRefObject<number[]>;
}

export default function Nav({ chapterOffsets }: NavProps) {
  const dot0Ref  = useRef<HTMLButtonElement>(null);
  const dot1Ref  = useRef<HTMLButtonElement>(null);
  const dot2Ref  = useRef<HTMLButtonElement>(null);
  const dot3Ref  = useRef<HTMLButtonElement>(null);
  const dot4Ref  = useRef<HTMLButtonElement>(null);
  const plineRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);

  useEffect(() => {
    const dots = [dot0Ref.current!, dot1Ref.current!, dot2Ref.current!, dot3Ref.current!, dot4Ref.current!];

    function onScroll() {
      const sy = window.scrollY;
      const dh = document.documentElement.scrollHeight - window.innerHeight;

      // Overall progress line
      if (plineRef.current) plineRef.current.style.width = `${sy / dh * 100}%`;

      // Active dot: highest chapter offset we've passed (with 50px tolerance)
      const offsets = chapterOffsets.current;
      let active = 0;
      for (let i = offsets.length - 1; i >= 0; i--) {
        if (sy >= offsets[i] - 50) { active = i; break; }
      }

      if (activeRef.current !== active) {
        activeRef.current = active;
        dots.forEach((d, i) => {
          if (i === active) d?.classList.add('ndot-active');
          else d?.classList.remove('ndot-active');
        });
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [chapterOffsets]);

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
      {/* 1px gold overall progress line */}
      <div
        ref={plineRef}
        style={{
          position: 'fixed',
          top: 0, left: 0,
          height: 1,
          background: 'var(--gold)',
          zIndex: 500,
          width: 0,
          pointerEvents: 'none',
        }}
      />

      <nav
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 200,
          padding: 'clamp(1.4rem, 4vw, 1.4rem) clamp(1.25rem, 5vw, 3rem)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mixBlendMode: 'difference',
        }}
      >
        <a
          href="#"
          onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          style={{
            fontFamily: 'var(--font-bebas, "Impact"), sans-serif',
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
            fontWeight: 400,
            letterSpacing: '0.1em',
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
          <button
            ref={dot3Ref}
            style={dotBase}
            aria-label="Chapter 4"
            onClick={() => scrollToChapter(3)}
          />
          <button
            ref={dot4Ref}
            style={dotBase}
            aria-label="Chapter 5"
            onClick={() => scrollToChapter(4)}
          />
        </div>
      </nav>
    </>
  );
}
