'use client';
import { useEffect, useRef } from 'react';

const HERO_VH = 1800;

export default function ScrollProgress() {
  const lineRef = useRef(null);

  useEffect(() => {
    const update = (scrollY) => {
      const heroEnd = (HERO_VH / 100) * window.innerHeight;
      if (lineRef.current) {
        lineRef.current.style.opacity = scrollY > heroEnd ? '1' : '0';
      }
    };

    // Hook into Lenis scroll event (most reliable with smooth scroll)
    const attach = () => {
      if (window.__lenis) {
        window.__lenis.on('scroll', ({ scroll }) => update(scroll));
      } else {
        // Lenis not ready yet — retry in 200ms
        setTimeout(attach, 200);
      }
    };
    attach();

    // Also listen to native scroll as fallback
    const onScroll = () => update(window.scrollY || document.documentElement.scrollTop);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      ref={lineRef}
      style={{
        position: 'fixed',
        top: 'clamp(82px, 11.2vw, 128px)',
        left: 0,
        width: '100%',
        height: '1px',
        background: 'transparent',
        zIndex: 99990,
        pointerEvents: 'none',
        opacity: 0,
        transition: 'opacity 0.6s ease',
      }}
    />
  );
}
