'use client';

import { useEffect, useRef, useCallback } from 'react';

// Only safe to read on client — this module only runs client-side ('use client')
const DPR = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;

const PX_PER_FRAME = 16;  // scroll pixels per frame
const LERP         = 0.14; // lower = smoother, more cinematic lag

export interface ChapterCanvasProps {
  chapterNum: number;
  count: number;
  src: (i: number) => string;
  /** Short eyebrow label shown as pill badge */
  tag: string;
  /** Headline lines — odd indices render in gold, even in white */
  headline: string[];
  body: string;
  align?: 'left' | 'right';
  onProgress?: (pct: number) => void;
  onLoaded?: () => void;
  onMeasure?: (offsetTop: number, scrollable: number) => void;
  loadDelay?: number;
}

export default function ChapterCanvas({
  chapterNum,
  count,
  src,
  tag,
  headline,
  body,
  align = 'left',
  onProgress,
  onLoaded,
  onMeasure,
  loadDelay = 0,
}: ChapterCanvasProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const textRef    = useRef<HTMLDivElement>(null);
  const pfRef      = useRef<HTMLDivElement>(null);
  const shRef      = useRef<HTMLDivElement>(null);

  const imgsRef    = useRef<(HTMLImageElement | null)[]>([]);
  const loadedRef  = useRef(0);

  // Lerp scroll state (mutated in RAF, never triggers React re-render)
  const targetScrolledRef = useRef(0);
  const smoothScrolledRef = useRef(0);
  const rafIdRef          = useRef<number | null>(null);
  const kickRef           = useRef<(() => void) | null>(null);

  // ── Draw ─────────────────────────────────────────────────────────
  const draw = useCallback((fi: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Nearest-loaded-frame fallback: walk backwards so we never show black
    let img: HTMLImageElement | null = null;
    for (let i = Math.min(fi, imgsRef.current.length - 1); i >= 0; i--) {
      const f = imgsRef.current[i];
      if (f && f.complete && f.naturalWidth > 0) { img = f; break; }
    }
    if (!img) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    // object-fit: cover
    const scale = Math.max(cw / iw, ch / ih);
    const w = Math.ceil(iw * scale);
    const h = Math.ceil(ih * scale);
    const x = Math.floor((cw - w) / 2);
    const y = Math.floor((ch - h) / 2);

    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, cw, ch);

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    // Expensive quality settings only on desktop
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      ctx.imageSmoothingQuality = 'high';
      // Subtle color grade — contrast(1.08) saturate(1.12) brightness(1.02)
      // iOS Safari ≤15 doesn't support canvas filter — guard with 'filter' in ctx
      if ('filter' in ctx) {
        (ctx as CanvasRenderingContext2D & { filter: string }).filter =
          'contrast(1.08) saturate(1.12) brightness(1.02)';
      }
    }
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
  }, []);

  // ── Chapter text opacity (lerp-driven, frame-based) ───────────────
  const updateTextOpacity = useCallback((fi: number) => {
    const el = textRef.current;
    if (!el) return;

    const FADE_IN  = 22;
    const FADE_OUT_START = count - 26;

    let op: number;
    if (chapterNum === 1) {
      // Hero chapter: always full opacity, only fades at the very end
      op = fi >= FADE_OUT_START ? Math.max(0, 1 - (fi - FADE_OUT_START) / 26) : 1;
    } else {
      if (fi < FADE_IN) {
        op = fi / FADE_IN;
      } else if (fi >= FADE_OUT_START) {
        op = Math.max(0, 1 - (fi - FADE_OUT_START) / 26);
      } else {
        op = 1;
      }
    }
    op = Math.max(0, Math.min(1, op));
    el.style.opacity  = String(op);
    el.style.transform = `translateY(${Math.round(20 * (1 - op))}px)`;
  }, [chapterNum, count]);

  // ── Image loading ─────────────────────────────────────────────────
  useEffect(() => {
    imgsRef.current  = new Array(count).fill(null);
    loadedRef.current = 0;

    function startLoading() {
      for (let i = 1; i <= count; i++) {
        const idx = i - 1;
        const img = new Image();

        img.onload = () => {
          imgsRef.current[idx] = img;
          loadedRef.current++;

          if (onProgress) onProgress(Math.round(loadedRef.current / count * 100));

          // Draw frame 0 the instant it loads — canvas never stays black
          if (idx === 0) draw(0);

          // Kick RAF so late-loading frames repaint immediately
          if (kickRef.current) kickRef.current();

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
    }
    startLoading();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Canvas sizing + lerp scroll loop ─────────────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    const canvas  = canvasRef.current;
    if (!section || !canvas) return;

    function setSectionHeight() {
      section!.style.height = `${count * PX_PER_FRAME + window.innerHeight}px`;
    }

    function resizeCanvas() {
      const parent = canvas!.parentElement;
      const w = parent ? parent.offsetWidth  : window.innerWidth;
      const h = parent ? parent.offsetHeight : window.innerHeight;
      canvas!.width  = Math.round(w * DPR);
      canvas!.height = Math.round(h * DPR);
    }

    function measure() {
      onMeasure?.(section!.offsetTop, section!.offsetHeight - window.innerHeight);
    }

    // ── Continuous lerp render loop ──────────────────────────────
    function render() {
      const diff = targetScrolledRef.current - smoothScrolledRef.current;
      if (Math.abs(diff) > 0.5) {
        smoothScrolledRef.current += diff * LERP;
      } else {
        smoothScrolledRef.current = targetScrolledRef.current;
      }

      const scrollable = section!.offsetHeight - window.innerHeight;
      const progress   = Math.max(0, Math.min(1, smoothScrolledRef.current / scrollable));
      const fi         = Math.max(0, Math.min(
        Math.floor(smoothScrolledRef.current / PX_PER_FRAME),
        count - 1
      ));

      draw(fi);
      updateTextOpacity(fi);

      if (pfRef.current) pfRef.current.style.width = `${progress * 100}%`;

      // Hide scroll hint once user starts scrolling
      if (shRef.current && smoothScrolledRef.current > 60) {
        shRef.current.style.opacity = '0';
      }

      // Stop RAF when settled; will be re-kicked by scroll or late frame load
      if (Math.abs(smoothScrolledRef.current - targetScrolledRef.current) > 0.1) {
        rafIdRef.current = requestAnimationFrame(render);
      } else {
        rafIdRef.current = null;
      }
    }

    // Expose kick fn to image loader so late-loading frames repaint
    kickRef.current = () => {
      if (!rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(render);
      }
    };

    function onScroll() {
      const sy        = window.scrollY;
      const newTarget = Math.max(0, sy - section!.offsetTop);
      const scrollable = section!.offsetHeight - window.innerHeight;

      // Snap smooth value on large jumps (e.g. nav-dot click) — no ghosting
      if (scrollable > 0 && Math.abs(newTarget - targetScrolledRef.current) / scrollable > 0.04) {
        smoothScrolledRef.current = newTarget;
      }

      targetScrolledRef.current = newTarget;
      if (!rafIdRef.current) rafIdRef.current = requestAnimationFrame(render);
    }

    function onResize() {
      setSectionHeight();
      resizeCanvas();
      measure();
      // Force redraw at current position
      const fi = Math.max(0, Math.min(
        Math.floor(smoothScrolledRef.current / PX_PER_FRAME),
        count - 1
      ));
      draw(fi);
    }

    // Init
    setSectionHeight();
    resizeCanvas();
    measure();
    updateTextOpacity(0); // ch1 → op=1 immediately; ch2/ch3 → op=0

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const numLabel = String(chapterNum).padStart(2, '0');
  const isRight  = align === 'right';

  return (
    <section
      ref={sectionRef}
      id={`ch${chapterNum}`}
      style={{ position: 'relative' }}
    >
      {/* ── Sticky viewport ───────────────────────────────────────── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
          background: '#080808',
        }}
      >
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            background: '#080808',
            willChange: 'transform',
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            WebkitUserSelect: 'none',
            userSelect: 'none',
            touchAction: 'pan-y',
          }}
        />

        {/* Cinematic vignette — two-layer gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            pointerEvents: 'none',
            background: [
              'radial-gradient(ellipse 75% 55% at 50% 80%, rgba(8,8,8,0) 0%, rgba(8,8,8,0.52) 100%)',
              'linear-gradient(to bottom, rgba(8,8,8,0) 0%, rgba(8,8,8,0.01) 20%, rgba(8,8,8,0.01) 74%, rgba(8,8,8,0.75) 100%)',
            ].join(', '),
          }}
        />

        {/* Nav legibility shield — fades out below nav bar height */}
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '18%',
            zIndex: 3,
            pointerEvents: 'none',
            background: 'linear-gradient(to bottom, rgba(8,8,8,0.78) 0%, rgba(8,8,8,0.35) 45%, rgba(8,8,8,0) 100%)',
          }}
        />

        {/* Ghost chapter number */}
        <div
          className="ch-n"
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
            zIndex: 4,
          }}
        >
          {numLabel}
        </div>

        {/* ── Chapter text overlay ─────────────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: isRight ? 'flex-end' : 'flex-start',
            padding: 'clamp(1.2rem, 5vw, 6rem)',
            paddingTop: 'clamp(10rem, 20vh, 13rem)',
            paddingBottom: 'clamp(7rem, 14vh, 12rem)',
            pointerEvents: 'none',
          }}
        >
          {/* Glass card — opacity driven by lerp RAF */}
          <div
            ref={textRef}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: isRight ? 'flex-end' : 'flex-start',
              background: 'rgba(0,0,0,0.42)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              borderRadius: 10,
              padding: 'clamp(14px, 2vw, 22px) clamp(16px, 2.5vw, 28px)',
              border: '1px solid rgba(255,255,255,0.07)',
              maxWidth: 'min(calc(100% - 2rem), 580px)',
              // opacity + transform managed via DOM in render()
            }}
          >
            {/* Eyebrow pill badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: 'var(--font-dm-sans, system-ui), sans-serif',
                fontSize: 'clamp(10px, 1.1vw, 13px)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.92)',
                background: 'rgba(255,255,255,0.1)',
                border: '1.5px solid rgba(255,255,255,0.44)',
                borderRadius: 3,
                padding: '5px 13px',
                marginBottom: 14,
                backdropFilter: 'blur(8px)',
                userSelect: 'none',
                boxShadow: '0 0 12px rgba(255,255,255,0.07)',
              }}
            >
              {tag}
            </div>

            {/* Headline — Bebas Neue, alternating white + gold */}
            <div style={{ userSelect: 'none' }}>
              {headline.map((line, li) => (
                <div
                  key={li}
                  style={{
                    fontFamily: 'var(--font-bebas, "Impact"), sans-serif',
                    fontSize: 'clamp(2.4rem, 5.8vw, 5.8rem)',
                    fontWeight: 400,
                    lineHeight: 0.88,
                    letterSpacing: '0.05em',
                    color: li % 2 === 0 ? '#ffffff' : 'var(--gold)',
                    textShadow: li % 2 === 0
                      ? '0 1px 16px rgba(0,0,0,0.9)'
                      : '0 1px 16px rgba(0,0,0,0.9), 0 0 24px rgba(200,168,107,0.28)',
                  }}
                >
                  {line}
                </div>
              ))}
            </div>

            {/* Accent rule */}
            <div
              style={{
                width: 56,
                height: 2,
                marginTop: 20,
                marginBottom: 14,
                background: isRight
                  ? 'linear-gradient(270deg, rgba(200,168,107,0.85), rgba(200,168,107,0.06))'
                  : 'linear-gradient(90deg, rgba(200,168,107,0.85), rgba(200,168,107,0.06))',
                alignSelf: isRight ? 'flex-end' : 'flex-start',
              }}
            />

            {/* Body copy */}
            <p
              style={{
                fontFamily: 'var(--font-dm-sans, system-ui), sans-serif',
                fontSize: 'clamp(0.8rem, 1.6vw, 0.94rem)',
                color: 'rgba(255,255,255,0.6)',
                maxWidth: '40ch',
                lineHeight: 1.66,
                margin: 0,
                textAlign: isRight ? 'right' : 'left',
              }}
            >
              {body}
            </p>

            {/* Per-chapter progress bar */}
            <div
              style={{
                marginTop: 16,
                width: 'min(150px, 34vw)',
                height: 1,
                background: 'rgba(255,255,255,0.09)',
                alignSelf: isRight ? 'flex-end' : 'flex-start',
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

        {/* Scroll hint — chapter 1 only */}
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
              zIndex: 10,
              opacity: 1,
              transition: 'opacity 0.5s ease',
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-dm-sans, system-ui), sans-serif',
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
