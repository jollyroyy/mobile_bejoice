'use client';

import { useEffect, useRef, useCallback } from 'react';

const DPR = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
const PX_PER_FRAME = 16;

export interface ChapterCanvasProps {
  /** 1-based chapter number shown as ghost overlay */
  chapterNum: number;
  /** Total frame count */
  count: number;
  /** Returns URL for frame index i (1-based) */
  src: (i: number) => string;
  /** HUD content */
  tag: string;
  title: React.ReactNode;
  body: string;
  /** Callback for each loaded image — only needed for Ch1 loader */
  onProgress?: (pct: number) => void;
  /** Called when all frames are loaded */
  onLoaded?: () => void;
  /** Exposes section offsetTop and scrollable height to parent */
  onMeasure?: (offsetTop: number, scrollable: number) => void;
  /** Delay image loading by this many ms (for Ch2/Ch3 to give Ch1 priority) */
  loadDelay?: number;
}

export default function ChapterCanvas({
  chapterNum,
  count,
  src,
  tag,
  title,
  body,
  onProgress,
  onLoaded,
  onMeasure,
  loadDelay = 0,
}: ChapterCanvasProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const hudRef     = useRef<HTMLDivElement>(null);
  const pfRef      = useRef<HTMLDivElement>(null);
  const shRef      = useRef<HTMLDivElement>(null);

  // Mutable state shared with scroll handler — avoids re-renders
  const imgsRef   = useRef<(HTMLImageElement | null)[]>([]);
  const frameRef  = useRef(0);
  const rafRef    = useRef(false);
  const loadedRef = useRef(0);

  const draw = useCallback((fi: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = imgsRef.current[fi];
    if (!img || !img.complete || !img.naturalWidth) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const w = iw * scale;
    const h = ih * scale;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = canvas.offsetWidth  * DPR;
    canvas.height = canvas.offsetHeight * DPR;
    draw(frameRef.current);
  }, [draw]);

  // ── Image loading ──────────────────────────────────────────
  useEffect(() => {
    imgsRef.current = new Array(count).fill(null);
    loadedRef.current = 0;

    function startLoading() {
      for (let i = 1; i <= count; i++) {
        const idx = i - 1;
        const img = new Image();

        img.onload = () => {
          imgsRef.current[idx] = img;
          loadedRef.current++;

          if (onProgress) {
            const pct = Math.round(loadedRef.current / count * 100);
            onProgress(pct);
          }
          // Draw frame 0 as soon as it loads — never shows a black canvas
          if (idx === 0) draw(0);

          if (loadedRef.current >= count && onLoaded) onLoaded();
        };

        img.onerror = () => {
          loadedRef.current++;
          if (loadedRef.current >= count && onLoaded) onLoaded();
        };

        img.src = src(i);
      }
    }

    if (loadDelay > 0) {
      const t = setTimeout(startLoading, loadDelay);
      return () => clearTimeout(t);
    } else {
      startLoading();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Canvas sizing + scroll handler ────────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    const canvas  = canvasRef.current;
    if (!section || !canvas) return;

    // Set section height so it provides enough scroll room
    function setSectionHeight() {
      section!.style.height = (count * PX_PER_FRAME + window.innerHeight) + 'px';
    }
    setSectionHeight();
    resizeCanvas();

    // Expose measurements to parent (for Nav dot tracking)
    function measure() {
      const offsetTop   = section!.offsetTop;
      const scrollable  = section!.offsetHeight - window.innerHeight;
      onMeasure?.(offsetTop, scrollable);
    }
    measure();

    function onScroll() {
      const sy       = window.scrollY;
      const secTop   = section!.offsetTop;
      const secH     = section!.offsetHeight;
      const scrollable = secH - window.innerHeight;
      const scrolled   = sy - secTop;

      const progress = Math.max(0, Math.min(1, scrolled / scrollable));

      // No-gap fix: use px-based formula, not progress * count
      const fi = Math.min(Math.floor(scrolled / PX_PER_FRAME), count - 1);
      const fi2 = Math.max(0, fi);

      // Progress fill bar
      if (pfRef.current) {
        pfRef.current.style.width = (progress * 100) + '%';
      }

      // Draw via RAF — throttle to one draw per frame
      if (fi2 !== frameRef.current) {
        frameRef.current = fi2;
        if (!rafRef.current) {
          rafRef.current = true;
          requestAnimationFrame(() => {
            draw(frameRef.current);
            rafRef.current = false;
          });
        }
      }

      // Show HUD at chapter start; hide near end
      if (hudRef.current) {
        if (progress < 0.18) {
          hudRef.current.classList.add('hud-visible');
        } else if (progress > 0.78) {
          hudRef.current.classList.remove('hud-visible');
        }
      }

      // Hide scroll hint
      if (shRef.current && sy > 60) {
        shRef.current.style.opacity = '0';
      }
    }

    function onResize() {
      setSectionHeight();
      resizeCanvas();
      measure();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    // Show HUD immediately for the first chapter
    if (chapterNum === 1 && hudRef.current) {
      hudRef.current.classList.add('hud-visible');
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const numLabel = String(chapterNum).padStart(2, '0');

  return (
    <section
      ref={sectionRef}
      id={`ch${chapterNum}`}
      style={{ position: 'relative' }}
    >
      {/* Sticky viewport */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
          background: '#000',
        }}
      >
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            WebkitUserSelect: 'none',
            userSelect: 'none',
            touchAction: 'pan-y',
            background: '#000',
          }}
        />

        {/* Ghost chapter number */}
        <div
          style={{
            position: 'absolute',
            top: 'clamp(3.5rem, 8vh, 5.5rem)',
            right: 'clamp(1.25rem, 5vw, 3rem)',
            fontSize: 'clamp(4rem, 14vw, 9rem)',
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.05em',
            color: 'rgba(255,255,255,0.04)',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
          className="ch-n"
        >
          {numLabel}
        </div>

        {/* HUD overlay */}
        <div
          ref={hudRef}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: 'clamp(1.5rem, 5vw, 4rem)',
          }}
        >
          {/* Gradient vignette */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 38%, transparent 65%)',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Tag */}
            <div
              className="hud-tag"
              style={{
                fontSize: '0.63rem',
                fontWeight: 700,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
                marginBottom: '0.6rem',
              }}
            >
              {tag}
            </div>

            {/* Title */}
            <h2
              className="hud-title"
              style={{
                fontSize: 'clamp(2.6rem, 8vw, 6rem)',
                fontWeight: 900,
                lineHeight: 0.93,
                letterSpacing: '-0.035em',
                marginBottom: '0.85rem',
              }}
            >
              {title}
            </h2>

            {/* Body */}
            <p
              className="hud-body"
              style={{
                fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
                color: 'rgba(255,255,255,0.62)',
                maxWidth: '48ch',
                lineHeight: 1.68,
              }}
            >
              {body}
            </p>

            {/* Progress bar */}
            <div
              className="hud-bar"
              style={{
                marginTop: '1.4rem',
                width: 'min(180px, 38vw)',
                height: 1,
                background: 'rgba(255,255,255,0.1)',
              }}
            >
              <div
                ref={pfRef}
                style={{
                  height: '100%',
                  background: 'var(--gold)',
                  width: 0,
                  willChange: 'width',
                }}
              />
            </div>
          </div>
        </div>

        {/* Scroll hint (chapter 1 only) */}
        {chapterNum === 1 && (
          <div
            ref={shRef}
            style={{
              position: 'absolute',
              bottom: 'clamp(1.5rem, 4vh, 2.5rem)',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 7,
              opacity: 1,
              transition: 'opacity 0.5s ease',
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                fontSize: '0.58rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.28)',
              }}
            >
              Scroll
            </span>
            <div
              style={{
                width: 17,
                height: 27,
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 9,
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: 4,
                  transform: 'translateX(-50%)',
                  width: 2,
                  height: 5,
                  background: 'rgba(255,255,255,0.35)',
                  borderRadius: 1,
                  animation: 'pill 1.6s ease infinite',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
